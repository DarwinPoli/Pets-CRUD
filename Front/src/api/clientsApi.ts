import axios from 'axios'
import type { Client } from '../types/models'
import { graphqlApi, getApiMode } from './graphqlClient'

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
  if (getApiMode() === 'GRAPHQL') {
    const mutation = `
      mutation CreateClient($input: ClientInput!) {
        createClient(input: $input) {
          id
          id_number: idNumber
          first_names: firstNames
          last_names: lastNames
          address
          phone
        }
      }
    `
    // Convert to GraphQL input format
    const input: Record<string, string> = {}
    if (payload.cedula !== undefined) input.idNumber = payload.cedula
    if (payload.nombres !== undefined) input.firstNames = payload.nombres
    if (payload.apellidos !== undefined) input.lastNames = payload.apellidos
    if (payload.direccion !== undefined) input.address = payload.direccion
    if (payload.telefono !== undefined) input.phone = payload.telefono

    const response = await graphqlApi.post<{ data: { createClient: BackendClient } }>('', {
      query: mutation,
      variables: { input },
    })
    return toFrontendClient(response.data.data.createClient)
  }

  const response = await api.post<BackendClient>('/clients/', toBackendPayload(payload))
  return toFrontendClient(response.data)
}

export async function listClients(skip = 0, limit = 100): Promise<Client[]> {
  if (getApiMode() === 'GRAPHQL') {
    const query = `
      query GetClients($skip: Int!, $limit: Int!) {
        clients(skip: $skip, limit: $limit) {
          id
          id_number: idNumber
          first_names: firstNames
          last_names: lastNames
          address
          phone
        }
      }
    `
    const response = await graphqlApi.post<{ data: { clients: BackendClient[] } }>('', {
      query,
      variables: { skip, limit },
    })
    return response.data.data.clients.map(toFrontendClient)
  }

  const response = await api.get<BackendClient[]>('/clients/', {
    params: { skip, limit },
  })
  return response.data.map(toFrontendClient)
}

export async function getClient(clientId: number | string): Promise<Client> {
  if (getApiMode() === 'GRAPHQL') {
    const query = `
      query GetClient($clientId: Int!) {
        client(clientId: $clientId) {
          id
          id_number: idNumber
          first_names: firstNames
          last_names: lastNames
          address
          phone
        }
      }
    `
    const id = typeof clientId === 'string' ? parseInt(clientId, 10) : clientId
    const response = await graphqlApi.post<{ data: { client: BackendClient } }>('', {
      query,
      variables: { clientId: id },
    })
    return toFrontendClient(response.data.data.client)
  }

  const response = await api.get<BackendClient>(`/clients/${clientId}`)
  return toFrontendClient(response.data)
}

export async function updateClient(
  clientId: number | string,
  payload: ClientUpdatePayload,
): Promise<Client> {
  if (getApiMode() === 'GRAPHQL') {
    const mutation = `
      mutation UpdateClient($clientId: Int!, $input: ClientUpdateInput!) {
        updateClient(clientId: $clientId, input: $input) {
          id
          id_number: idNumber
          first_names: firstNames
          last_names: lastNames
          address
          phone
        }
      }
    `
    const input: Record<string, string> = {}
    if (payload.cedula !== undefined) input.idNumber = payload.cedula
    if (payload.nombres !== undefined) input.firstNames = payload.nombres
    if (payload.apellidos !== undefined) input.lastNames = payload.apellidos
    if (payload.direccion !== undefined) input.address = payload.direccion
    if (payload.telefono !== undefined) input.phone = payload.telefono

    const id = typeof clientId === 'string' ? parseInt(clientId, 10) : clientId
    const response = await graphqlApi.post<{ data: { updateClient: BackendClient } }>('', {
      query: mutation,
      variables: { clientId: id, input },
    })
    return toFrontendClient(response.data.data.updateClient)
  }

  const response = await api.put<BackendClient>(
    `/clients/${clientId}`,
    toBackendPayload(payload),
  )
  return toFrontendClient(response.data)
}

export async function deleteClient(clientId: number | string): Promise<void> {
  if (getApiMode() === 'GRAPHQL') {
    const mutation = `
      mutation DeleteClient($clientId: Int!) {
        deleteClient(clientId: $clientId)
      }
    `
    const id = typeof clientId === 'string' ? parseInt(clientId, 10) : clientId
    await graphqlApi.post('', {
      query: mutation,
      variables: { clientId: id },
    })
    return
  }

  await api.delete(`/clients/${clientId}`)
}
