import axios from 'axios'
import type { Pet } from '../types/models'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

interface BackendPet {
  id: number
  identification: string
  name: string
  breed: string
  age: number
  weight: number
  medication_ids?: number[] | null
  client_id: number
}

export type PetCreatePayload = Omit<Pet, 'id'>
export type PetUpdatePayload = Partial<PetCreatePayload>

function toFrontendPet(pet: BackendPet): Pet {
  return {
    id: String(pet.id),
    identification: pet.identification,
    name: pet.name,
    breed: pet.breed,
    age: pet.age,
    weight: pet.weight,
    client_id: String(pet.client_id),
    medication_ids: Array.isArray(pet.medication_ids)
      ? pet.medication_ids.map(String)
      : [],
  }
}

function toBackendPayload(pet: PetCreatePayload | PetUpdatePayload) {
  const payload: Record<string, string | number | number[]> = {}

  if (pet.identification !== undefined) payload.identification = pet.identification
  if (pet.name !== undefined) payload.name = pet.name
  if (pet.breed !== undefined) payload.breed = pet.breed
  if (pet.age !== undefined) payload.age = pet.age
  if (pet.weight !== undefined) payload.weight = pet.weight
  if (pet.client_id !== undefined) payload.client_id = Number(pet.client_id)
  if (pet.medication_ids !== undefined) {
    payload.medication_ids = pet.medication_ids.map(Number)
  }

  return payload
}

export async function createPet(payload: PetCreatePayload): Promise<Pet> {
  const response = await api.post<BackendPet>('/pets/', toBackendPayload(payload))
  return toFrontendPet(response.data)
}

export async function listPets(skip = 0, limit = 100): Promise<Pet[]> {
  const response = await api.get<BackendPet[]>('/pets/', {
    params: { skip, limit },
  })
  console.log('Received pets from API:', response.data)
  return response.data.map(toFrontendPet)
}

export async function getPet(petId: number | string): Promise<Pet> {
  const response = await api.get<BackendPet>(`/pets/${petId}`)
  return toFrontendPet(response.data)
}

export async function updatePet(
  petId: number | string,
  payload: PetUpdatePayload,
): Promise<Pet> {
  const response = await api.put<BackendPet>(`/pets/${petId}`, toBackendPayload(payload))
  return toFrontendPet(response.data)
}

export async function deletePet(petId: number | string): Promise<void> {
  await api.delete(`/pets/${petId}`)
}
