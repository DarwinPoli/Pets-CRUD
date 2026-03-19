import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

interface BackendMedicationReport {
  medication_id: number
  name: string
  description: string | null
  dosage: string | null
  total_pets: number
}

interface BackendClientPetReport {
  name: string
  breed: string
  medications: string[]
}

interface BackendClientReport {
  client_id: number
  id_number: string
  first_names: string
  last_names: string
  phone: string
  total_pets: number
  pets: BackendClientPetReport[]
}

interface BackendMedicationByClientPet {
  pet_name: string
  medications: Array<{
    name: string
    dosage: string | null
  }>
}

interface BackendMedicationsByClientReport {
  client: string
  client_id: number
  id_number: string
  pets: BackendMedicationByClientPet[]
}

export interface MedicationReport {
  medicationId: string
  nombre: string
  descripcion: string
  dosis: string
  totalMascotas: number
}

export interface ClientPetReport {
  nombre: string
  raza: string
  medicamentos: string[]
}

export interface ClientReport {
  clientId: string
  cedula: string
  nombres: string
  apellidos: string
  telefono: string
  totalMascotas: number
  mascotas: ClientPetReport[]
}

export interface MedicationsByClientPetReport {
  nombreMascota: string
  medicamentos: Array<{
    nombre: string
    dosis: string
  }>
}

export interface MedicationsByClientReport {
  cliente: string
  clientId: string
  cedula: string
  mascotas: MedicationsByClientPetReport[]
}

function toMedicationReport(item: BackendMedicationReport): MedicationReport {
  return {
    medicationId: String(item.medication_id),
    nombre: item.name,
    descripcion: item.description ?? '',
    dosis: item.dosage ?? '',
    totalMascotas: item.total_pets,
  }
}

function toClientReport(item: BackendClientReport): ClientReport {
  return {
    clientId: String(item.client_id),
    cedula: item.id_number,
    nombres: item.first_names,
    apellidos: item.last_names,
    telefono: item.phone,
    totalMascotas: item.total_pets,
    mascotas: item.pets.map((pet) => ({
      nombre: pet.name,
      raza: pet.breed,
      medicamentos: pet.medications,
    })),
  }
}

function toMedicationsByClientReport(
  item: BackendMedicationsByClientReport,
): MedicationsByClientReport {
  return {
    cliente: item.client,
    clientId: String(item.client_id),
    cedula: item.id_number,
    mascotas: item.pets.map((pet) => ({
      nombreMascota: pet.pet_name,
      medicamentos: pet.medications.map((medication) => ({
        nombre: medication.name,
        dosis: medication.dosage ?? '',
      })),
    })),
  }
}

export async function getMedicationReport(): Promise<MedicationReport[]> {
  const response = await api.get<BackendMedicationReport[]>('/reports/medications')
  return response.data.map(toMedicationReport)
}

export async function getClientReport(): Promise<ClientReport[]> {
  const response = await api.get<BackendClientReport[]>('/reports/clients')
  return response.data.map(toClientReport)
}

export async function getMedicationsByClientReport(
  clientId: number | string,
): Promise<MedicationsByClientReport> {
  const response = await api.get<BackendMedicationsByClientReport>(
    `/reports/medications-by-client/${clientId}`,
  )
  return toMedicationsByClientReport(response.data)
}
