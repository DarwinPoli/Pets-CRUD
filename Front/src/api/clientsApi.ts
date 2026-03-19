import axios from 'axios'
import type { Client } from '../types/models'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

interface BackendClient {
  id: number
  id_number: string
  first_names: string
  last_names: string
  address: string
  phone: string
}

export type ClientCreatePayload = Omit<Client, 'id'>
export type ClientUpdatePayload = Partial<ClientCreatePayload>

function toFrontendClient(client: BackendClient): Client {
  return {
    id: String(client.id),
    cedula: client.id_number,
    nombres: client.first_names,
    apellidos: client.last_names,
    direccion: client.address,
    telefono: client.phone,
  }
}

function toBackendPayload(client: ClientCreatePayload | ClientUpdatePayload) {
  const payload: Record<string, string> = {}

  if (client.cedula !== undefined) payload.id_number = client.cedula
  if (client.nombres !== undefined) payload.first_names = client.nombres
  if (client.apellidos !== undefined) payload.last_names = client.apellidos
  if (client.direccion !== undefined) payload.address = client.direccion
  if (client.telefono !== undefined) payload.phone = client.telefono

  return payload
}

export async function createClient(payload: ClientCreatePayload): Promise<Client> {
  const response = await api.post<BackendClient>('/clients/', toBackendPayload(payload))
  return toFrontendClient(response.data)
}

export async function listClients(skip = 0, limit = 100): Promise<Client[]> {
  const response = await api.get<BackendClient[]>('/clients/', {
    params: { skip, limit },
  })
  return response.data.map(toFrontendClient)
}

export async function getClient(clientId: number | string): Promise<Client> {
  const response = await api.get<BackendClient>(`/clients/${clientId}`)
  return toFrontendClient(response.data)
}

export async function updateClient(
  clientId: number | string,
  payload: ClientUpdatePayload,
): Promise<Client> {
  const response = await api.put<BackendClient>(
    `/clients/${clientId}`,
    toBackendPayload(payload),
  )
  return toFrontendClient(response.data)
}

export async function deleteClient(clientId: number | string): Promise<void> {
  await api.delete(`/clients/${clientId}`)
}
