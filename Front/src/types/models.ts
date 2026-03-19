export interface Client {
  id: string
  cedula: string
  nombres: string
  apellidos: string
  direccion: string
  telefono: string
}

export interface Medication {
  id: string
  name: string
  description: string
  dosage: string
}

export interface Pet {
  id: string
  identification: string
  name: string
  breed: string
  age: number
  weight: number
  client_id: string
  medication_ids: string[]
}
