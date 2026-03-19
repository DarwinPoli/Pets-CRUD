import { useState } from 'react'
import { useAppData } from '../context/AppDataContext'
import type { Pet } from '../types/models'

type PetForm = Omit<Pet, 'id'>

const emptyForm: PetForm = {
  identification: '',
  name: '',
  breed: '',
  age: 0,
  weight: 0,
  medication_ids: [],
  client_id: '',
}

export function PetsPage() {
  const {
    pets,
    clients,
    medications,
    addPet,
    updatePet,
    removePet,
  } = useAppData()
  console.log('Current pets in context:', pets)
  const [form, setForm] = useState<PetForm>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const getMedicationLabel = (medication: unknown): string => {
    if (!medication || typeof medication !== 'object') {
      return ''
    }

    const raw = medication as Record<string, unknown>
    if (typeof raw.name === 'string') return raw.name
    if (typeof raw.nombre === 'string') return raw.nombre
    return ''
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!form.client_id || form.medication_ids.length === 0) {
      return
    }

    setIsSubmitting(true)

    try {
      if (editingId) {
        await updatePet(editingId, form)
        setEditingId(null)
      } else {
        await addPet(form)
      }

      setForm(emptyForm)
    } catch (error) {
      console.error('Error guardando mascota', error)
      alert('No se pudo guardar la mascota. Verifica que la API este disponible.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (id: string) => {
    const pet = pets.find((item) => item.id === id)
    if (!pet) {
      return
    }

    setEditingId(id)
    setForm({
      identification: pet.identification,
      name: pet.name,
      breed: pet.breed,
      age: pet.age,
      weight: pet.weight,
      medication_ids: pet.medication_ids,
      client_id: pet.client_id,
    })
  }

  const handleDelete = async (id: string) => {
    try {
      await removePet(id)
    } catch (error) {
      console.error('Error eliminando mascota', error)
      alert('No se pudo eliminar la mascota. Verifica que la API este disponible.')
    }
  }

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">CRUD de mascotas</h2>

      <form
        className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2"
        onSubmit={handleSubmit}
      >
        <input
          required
          className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-emerald-200 focus:ring"
          placeholder="Identificacion"
          value={form.identification}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, identification: event.target.value }))
          }
        />
        <input
          required
          className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-emerald-200 focus:ring"
          placeholder="Nombre"
          value={form.name}
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
        />
        <input
          required
          className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-emerald-200 focus:ring"
          placeholder="Raza"
          value={form.breed}
          onChange={(event) => setForm((prev) => ({ ...prev, breed: event.target.value }))}
        />
        <input
          required
          min={0}
          type="number"
          className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-emerald-200 focus:ring"
          placeholder="Edad"
          value={form.age}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, age: Number(event.target.value) }))
          }
        />
        <input
          required
          min={0}
          step="0.1"
          type="number"
          className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-emerald-200 focus:ring"
          placeholder="Peso"
          value={form.weight}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, weight: Number(event.target.value) }))
          }
        />
        <select
          required
          multiple
          value={form.medication_ids}
          className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-emerald-200 focus:ring"
          onChange={(event) =>
            setForm((prev) => ({
              ...prev,
              medication_ids: Array.from(event.target.selectedOptions, (option) => option.value),
            }))
          }
        >
          {medications.map((medication) => (
            <option key={medication.id} value={medication.id}>
              {getMedicationLabel(medication)}
            </option>
          ))}
        </select>
        <select
          required
          value={form.client_id}
          className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-emerald-200 focus:ring md:col-span-2"
          onChange={(event) =>
            setForm((prev) => ({ ...prev, client_id: event.target.value }))
          }
        >
          <option value="">Seleccione cliente</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.nombres} {client.apellidos}
            </option>
          ))}
        </select>

        <div className="md:col-span-2 flex gap-2">
          <button
            type="submit"
            className="rounded-lg bg-emerald-700 px-4 py-2 font-medium text-white hover:bg-emerald-800"
            disabled={isSubmitting || clients.length === 0 || medications.length === 0}
          >
            {isSubmitting ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
          </button>
          {editingId ? (
            <button
              type="button"
              className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-100"
              onClick={() => {
                setEditingId(null)
                setForm(emptyForm)
              }}
            >
              Cancelar
            </button>
          ) : null}
        </div>

        {clients.length === 0 || medications.length === 0 ? (
          <p className="md:col-span-2 text-sm text-amber-700">
            Debes registrar al menos un cliente y un medicamento antes de crear mascotas.
          </p>
        ) : null}
      </form>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="px-4 py-3 text-left">Identificacion</th>
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3 text-left">Raza</th>
              <th className="px-4 py-3 text-left">Edad</th>
              <th className="px-4 py-3 text-left">Peso</th>
              <th className="px-4 py-3 text-left">Medicamento</th>
              <th className="px-4 py-3 text-left">Cliente</th>
              <th className="px-4 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pets.map((pet) => {
              const medicationIds = Array.isArray(pet.medication_ids) ? pet.medication_ids : []
              const petMedications = medications.filter((item) =>
                medicationIds.includes(item.id),
              )
              const client = clients.find((item) => item.id === pet.client_id)

              return (
                <tr key={pet.id} className="border-t border-slate-200">
                  <td className="px-4 py-3">{pet.identification}</td>
                  <td className="px-4 py-3">{pet.name}</td>
                  <td className="px-4 py-3">{pet.breed}</td>
                  <td className="px-4 py-3">{pet.age}</td>
                  <td className="px-4 py-3">{pet.weight} kg</td>
                  <td className="px-4 py-3">
                    {petMedications.length > 0
                      ? petMedications.map((item) => getMedicationLabel(item)).join(', ')
                      : 'N/A'}
                  </td>
                  <td className="px-4 py-3">
                    {client ? `${client.nombres} ${client.apellidos}` : 'N/A'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600"
                        onClick={() => handleEdit(pet.id)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
                        onClick={() => void handleDelete(pet.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
