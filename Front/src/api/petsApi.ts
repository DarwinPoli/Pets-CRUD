import axios from 'axios'
import type { Pet } from '../types/models'
import { graphqlApi, getApiMode } from './graphqlClient'

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
  if (getApiMode() === 'GRAPHQL') {
    const mutation = `
      mutation CreatePet($input: PetInput!) {
        createPet(input: $input) {
          id
          identification
          name
          breed
          age
          weight
          medication_ids: medicationIds
          client_id: clientId
        }
      }
    `
    const input: Record<string, any> = {}
    if (payload.identification !== undefined) input.identification = payload.identification
    if (payload.name !== undefined) input.name = payload.name
    if (payload.breed !== undefined) input.breed = payload.breed
    if (payload.age !== undefined) input.age = payload.age
    if (payload.weight !== undefined) input.weight = payload.weight
    if (payload.client_id !== undefined) input.clientId = Number(payload.client_id)
    if (payload.medication_ids !== undefined) input.medicationIds = payload.medication_ids.map(Number)

    const response = await graphqlApi.post<{ data: { createPet: BackendPet } }>('', {
      query: mutation,
      variables: { input },
    })
    return toFrontendPet(response.data.data.createPet)
  }

  const response = await api.post<BackendPet>('/pets/', toBackendPayload(payload))
  return toFrontendPet(response.data)
}

export async function listPets(skip = 0, limit = 100): Promise<Pet[]> {
  if (getApiMode() === 'GRAPHQL') {
    const query = `
      query GetPets($skip: Int!, $limit: Int!) {
        pets(skip: $skip, limit: $limit) {
          id
          identification
          name
          breed
          age
          weight
          medication_ids: medicationIds
          client_id: clientId
        }
      }
    `
    const response = await graphqlApi.post<{ data: { pets: BackendPet[] } }>('', {
      query,
      variables: { skip, limit },
    })
    return response.data.data.pets.map(toFrontendPet)
  }

  const response = await api.get<BackendPet[]>('/pets/', {
    params: { skip, limit },
  })
  console.log('Received pets from API:', response.data)
  return response.data.map(toFrontendPet)
}

export async function getPet(petId: number | string): Promise<Pet> {
  if (getApiMode() === 'GRAPHQL') {
    const query = `
      query GetPet($petId: Int!) {
        pet(petId: $petId) {
          id
          identification
          name
          breed
          age
          weight
          medication_ids: medicationIds
          client_id: clientId
        }
      }
    `
    const id = typeof petId === 'string' ? parseInt(petId, 10) : petId
    const response = await graphqlApi.post<{ data: { pet: BackendPet } }>('', {
      query,
      variables: { petId: id },
    })
    return toFrontendPet(response.data.data.pet)
  }

  const response = await api.get<BackendPet>(`/pets/${petId}`)
  return toFrontendPet(response.data)
}

export async function updatePet(
  petId: number | string,
  payload: PetUpdatePayload,
): Promise<Pet> {
  if (getApiMode() === 'GRAPHQL') {
    const mutation = `
      mutation UpdatePet($petId: Int!, $input: PetUpdateInput!) {
        updatePet(petId: $petId, input: $input) {
          id
          identification
          name
          breed
          age
          weight
          medication_ids: medicationIds
          client_id: clientId
        }
      }
    `
    const input: Record<string, any> = {}
    if (payload.identification !== undefined) input.identification = payload.identification
    if (payload.name !== undefined) input.name = payload.name
    if (payload.breed !== undefined) input.breed = payload.breed
    if (payload.age !== undefined) input.age = payload.age
    if (payload.weight !== undefined) input.weight = payload.weight
    if (payload.client_id !== undefined) input.clientId = Number(payload.client_id)
    if (payload.medication_ids !== undefined) input.medicationIds = payload.medication_ids.map(Number)

    const id = typeof petId === 'string' ? parseInt(petId, 10) : petId
    const response = await graphqlApi.post<{ data: { updatePet: BackendPet } }>('', {
      query: mutation,
      variables: { petId: id, input },
    })
    return toFrontendPet(response.data.data.updatePet)
  }

  const response = await api.put<BackendPet>(`/pets/${petId}`, toBackendPayload(payload))
  return toFrontendPet(response.data)
}

export async function deletePet(petId: number | string): Promise<void> {
  if (getApiMode() === 'GRAPHQL') {
    const mutation = `
      mutation DeletePet($petId: Int!) {
        deletePet(petId: $petId)
      }
    `
    const id = typeof petId === 'string' ? parseInt(petId, 10) : petId
    await graphqlApi.post('', {
      query: mutation,
      variables: { petId: id },
    })
    return
  }

  await api.delete(`/pets/${petId}`)
}
