import axios from 'axios'
import type { Medication } from '../types/models'

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
    nombre: medication.name,
    descripcion: medication.description ?? '',
    dosis: medication.dosage ?? medication.dose ?? '',
  }
}

function toBackendPayload(
  medication: MedicationCreatePayload | MedicationUpdatePayload,
) {
  const payload: Record<string, string> = {}

  if (medication.nombre !== undefined) payload.name = medication.nombre
  if (medication.descripcion !== undefined) payload.description = medication.descripcion
  if (medication.dosis !== undefined) payload.dosage = medication.dosis

  return payload
}

export async function createMedication(
  payload: MedicationCreatePayload,
): Promise<Medication> {
  const response = await api.post<BackendMedication>(
    '/medications/',
    toBackendPayload(payload),
  )
  return toFrontendMedication(response.data)
}

export async function listMedications(skip = 0, limit = 100): Promise<Medication[]> {
  const response = await api.get<BackendMedication[]>('/medications/', {
    params: { skip, limit },
  })
  return response.data.map(toFrontendMedication)
}

export async function getMedication(medicationId: number | string): Promise<Medication> {
  const response = await api.get<BackendMedication>(`/medications/${medicationId}`)
  return toFrontendMedication(response.data)
}

export async function updateMedication(
  medicationId: number | string,
  payload: MedicationUpdatePayload,
): Promise<Medication> {
  const response = await api.put<BackendMedication>(
    `/medications/${medicationId}`,
    toBackendPayload(payload),
  )
  return toFrontendMedication(response.data)
}

export async function deleteMedication(medicationId: number | string): Promise<void> {
  await api.delete(`/medications/${medicationId}`)
}
