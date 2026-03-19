import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  createClient as createClientApi,
  deleteClient as deleteClientApi,
  listClients,
  updateClient as updateClientApi,
} from '../api/clientsApi'
import {
  createPet as createPetApi,
  deletePet as deletePetApi,
  listPets,
  updatePet as updatePetApi,
} from '../api/petsApi'
import {
  createMedication as createMedicationApi,
  deleteMedication as deleteMedicationApi,
  listMedications,
  updateMedication as updateMedicationApi,
} from '../api/medicationsApi'
import type { Client, Medication, Pet } from '../types/models'

const STORAGE_KEY = 'pets-sa-data-v1'

interface AppDataState {
  clients: Client[]
  medications: Medication[]
  pets: Pet[]
}

interface AppDataContextValue extends AppDataState {
  addClient: (client: Omit<Client, 'id'>) => Promise<void>
  updateClient: (id: string, client: Omit<Client, 'id'>) => Promise<void>
  removeClient: (id: string) => Promise<boolean>
  addMedication: (medication: Omit<Medication, 'id'>) => Promise<void>
  updateMedication: (id: string, medication: Omit<Medication, 'id'>) => Promise<void>
  removeMedication: (id: string) => Promise<boolean>
  addPet: (pet: Omit<Pet, 'id'>) => Promise<void>
  updatePet: (id: string, pet: Omit<Pet, 'id'>) => Promise<void>
  removePet: (id: string) => Promise<void>
}

const initialData: AppDataState = {
  clients: [],
  medications: [],
  pets: [],
}

const AppDataContext = createContext<AppDataContextValue | undefined>(undefined)

function normalizeStoredPet(value: unknown): Pet | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const raw = value as Record<string, unknown>

  const id = typeof raw.id === 'string' || typeof raw.id === 'number' ? String(raw.id) : ''
  const identification =
    typeof raw.identification === 'string'
      ? raw.identification
      : typeof raw.identificacion === 'string'
        ? raw.identificacion
        : ''
  const name =
    typeof raw.name === 'string'
      ? raw.name
      : typeof raw.nombre === 'string'
        ? raw.nombre
        : ''
  const breed =
    typeof raw.breed === 'string'
      ? raw.breed
      : typeof raw.raza === 'string'
        ? raw.raza
        : ''
  const age = typeof raw.age === 'number' ? raw.age : typeof raw.edad === 'number' ? raw.edad : 0
  const weight =
    typeof raw.weight === 'number' ? raw.weight : typeof raw.peso === 'number' ? raw.peso : 0
  const client_id =
    typeof raw.client_id === 'string' || typeof raw.client_id === 'number'
      ? String(raw.client_id)
      : typeof raw.clienteId === 'string' || typeof raw.clienteId === 'number'
        ? String(raw.clienteId)
        : ''

  let medication_ids: string[] = []

  if (Array.isArray(raw.medication_ids)) {
    medication_ids = raw.medication_ids
      .filter((item) => typeof item === 'string' || typeof item === 'number')
      .map(String)
  } else if (typeof raw.medicamentoId === 'string' || typeof raw.medicamentoId === 'number') {
    medication_ids = [String(raw.medicamentoId)]
  }

  if (!id) {
    return null
  }

  return {
    id,
    identification,
    name,
    breed,
    age,
    weight,
    client_id,
    medication_ids,
  }
}

function safeParseStorage(): AppDataState {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return initialData
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AppDataState>
    const pets = Array.isArray(parsed.pets)
      ? parsed.pets
          .map((item) => normalizeStoredPet(item))
          .filter((item): item is Pet => item !== null)
      : []

    return {
      clients: Array.isArray(parsed.clients) ? parsed.clients : [],
      medications: Array.isArray(parsed.medications) ? parsed.medications : [],
      pets,
    }
  } catch {
    return initialData
  }
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppDataState>(() => safeParseStorage())

  useEffect(() => {
    let active = true

    async function loadInitialData() {
      try {
        const [clients, medications, pets] = await Promise.all([
          listClients(),
          listMedications(),
          listPets(),
        ])
        if (!active) {
          return
        }

        setData((prev) => ({
          ...prev,
          clients,
          medications,
          pets,
        }))
      } catch (error) {
        console.error('Error cargando datos desde API', error)
      }
    }

    void loadInitialData()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  const value = useMemo<AppDataContextValue>(() => {
    return {
      ...data,
      addClient: async (client) => {
        const created = await createClientApi(client)
        setData((prev) => ({
          ...prev,
          clients: [...prev.clients, created],
        }))
      },
      updateClient: async (id, client) => {
        const updated = await updateClientApi(id, client)
        setData((prev) => ({
          ...prev,
          clients: prev.clients.map((current) =>
            current.id === id ? updated : current,
          ),
        }))
      },
      removeClient: async (id) => {
        const hasRelatedPets = data.pets.some((pet) => pet.client_id === id)
        if (hasRelatedPets) {
          return false
        }

        await deleteClientApi(id)

        setData((prev) => ({
          ...prev,
          clients: prev.clients.filter((client) => client.id !== id),
        }))

        return true
      },
      addMedication: async (medication) => {
        const created = await createMedicationApi(medication)
        setData((prev) => ({
          ...prev,
          medications: [...prev.medications, created],
        }))
      },
      updateMedication: async (id, medication) => {
        const updated = await updateMedicationApi(id, medication)
        setData((prev) => ({
          ...prev,
          medications: prev.medications.map((current) =>
            current.id === id ? updated : current,
          ),
        }))
      },
      removeMedication: async (id) => {
        const hasRelatedPets = data.pets.some((pet) => pet.medication_ids.includes(id))
        if (hasRelatedPets) {
          return false
        }

        await deleteMedicationApi(id)

        setData((prev) => ({
          ...prev,
          medications: prev.medications.filter((medication) => medication.id !== id),
        }))

        return true
      },
      addPet: async (pet) => {
        const created = await createPetApi(pet)
        setData((prev) => ({
          ...prev,
          pets: [...prev.pets, created],
        }))
      },
      updatePet: async (id, pet) => {
        const updated = await updatePetApi(id, pet)
        setData((prev) => ({
          ...prev,
          pets: prev.pets.map((current) =>
            current.id === id ? updated : current,
          ),
        }))
      },
      removePet: async (id) => {
        await deletePetApi(id)
        setData((prev) => ({
          ...prev,
          pets: prev.pets.filter((pet) => pet.id !== id),
        }))
      },
    }
  }, [data])

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export function useAppData() {
  const context = useContext(AppDataContext)

  if (!context) {
    throw new Error('useAppData debe usarse dentro de AppDataProvider')
  }

  return context
}
