import axios from 'axios'
import type { Medication } from '../types/models'
import { graphqlApi, getApiMode } from './graphqlClient'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

interface BackendMedication {
  id: number
  name: string
  description: string | null
  dosage?: string | null
  dose?: string | null
}

export type MedicationCreatePayload = Omit<Medication, 'id'>
export type MedicationUpdatePayload = Partial<MedicationCreatePayload>

function toFrontendMedication(medication: BackendMedication): Medication {
  return {
    id: String(medication.id),
    name: medication.name,
    description: medication.description ?? '',
    dosage: medication.dosage ?? medication.dose ?? '',
  }
}

function toBackendPayload(
  medication: MedicationCreatePayload | MedicationUpdatePayload,
) {
  const payload: Record<string, string> = {}

  if (medication.name !== undefined) payload.name = medication.name
  if (medication.description !== undefined) payload.description = medication.description
  if (medication.dosage !== undefined) payload.dosage = medication.dosage

  return payload
}

export async function createMedication(
  payload: MedicationCreatePayload,
): Promise<Medication> {
  if (getApiMode() === 'GRAPHQL') {
    const mutation = `
      mutation CreateMedication($input: MedicationInput!) {
        createMedication(input: $input) {
          id
          name
          description
          dosage
          dose
        }
      }
    `
    const input: Record<string, string> = {}
    if (payload.name !== undefined) input.name = payload.name
    if (payload.description !== undefined) input.description = payload.description
    if (payload.dosage !== undefined) input.dosage = payload.dosage

    const response = await graphqlApi.post<{ data: { createMedication: BackendMedication } }>('', {
      query: mutation,
      variables: { input },
    })
    return toFrontendMedication(response.data.data.createMedication)
  }

  const response = await api.post<BackendMedication>(
    '/medications/',
    toBackendPayload(payload),
  )
  return toFrontendMedication(response.data)
}

export async function listMedications(skip = 0, limit = 100): Promise<Medication[]> {
  if (getApiMode() === 'GRAPHQL') {
    const query = `
      query GetMedications($skip: Int!, $limit: Int!) {
        medications(skip: $skip, limit: $limit) {
          id
          name
          description
          dosage
          dose
        }
      }
    `
    const response = await graphqlApi.post<{ data: { medications: BackendMedication[] } }>('', {
      query,
      variables: { skip, limit },
    })
    return response.data.data.medications.map(toFrontendMedication)
  }

  const response = await api.get<BackendMedication[]>('/medications/', {
    params: { skip, limit },
  })
  return response.data.map(toFrontendMedication)
}

export async function getMedication(medicationId: number | string): Promise<Medication> {
  if (getApiMode() === 'GRAPHQL') {
    const query = `
      query GetMedication($medicationId: Int!) {
        medication(medicationId: $medicationId) {
          id
          name
          description
          dosage
          dose
        }
      }
    `
    const id = typeof medicationId === 'string' ? parseInt(medicationId, 10) : medicationId
    const response = await graphqlApi.post<{ data: { medication: BackendMedication } }>('', {
      query,
      variables: { medicationId: id },
    })
    return toFrontendMedication(response.data.data.medication)
  }

  const response = await api.get<BackendMedication>(`/medications/${medicationId}`)
  return toFrontendMedication(response.data)
}

export async function updateMedication(
  medicationId: number | string,
  payload: MedicationUpdatePayload,
): Promise<Medication> {
  if (getApiMode() === 'GRAPHQL') {
    const mutation = `
      mutation UpdateMedication($medicationId: Int!, $input: MedicationUpdateInput!) {
        updateMedication(medicationId: $medicationId, input: $input) {
          id
          name
          description
          dosage
          dose
        }
      }
    `
    const input: Record<string, string> = {}
    if (payload.name !== undefined) input.name = payload.name
    if (payload.description !== undefined) input.description = payload.description
    if (payload.dosage !== undefined) input.dosage = payload.dosage

    const id = typeof medicationId === 'string' ? parseInt(medicationId, 10) : medicationId
    const response = await graphqlApi.post<{ data: { updateMedication: BackendMedication } }>('', {
      query: mutation,
      variables: { medicationId: id, input },
    })
    return toFrontendMedication(response.data.data.updateMedication)
  }

  const response = await api.put<BackendMedication>(
    `/medications/${medicationId}`,
    toBackendPayload(payload),
  )
  return toFrontendMedication(response.data)
}

export async function deleteMedication(medicationId: number | string): Promise<void> {
  if (getApiMode() === 'GRAPHQL') {
    const mutation = `
      mutation DeleteMedication($medicationId: Int!) {
        deleteMedication(medicationId: $medicationId)
      }
    `
    const id = typeof medicationId === 'string' ? parseInt(medicationId, 10) : medicationId
    await graphqlApi.post('', {
      query: mutation,
      variables: { medicationId: id },
    })
    return
  }

  await api.delete(`/medications/${medicationId}`)
}
