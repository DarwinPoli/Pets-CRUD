import { useMemo, useState } from 'react'
import { useAppData } from '../context/AppDataContext'
import { useNotification } from '../context/NotificationContext'
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
  const { showNotification } = useNotification()
  const [form, setForm] = useState<PetForm>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [medicationQuery, setMedicationQuery] = useState('')

  const filteredMedications = useMemo(() => {
    const query = medicationQuery.trim().toLowerCase()
    if (!query) {
      return medications
    }

    return medications.filter((medication) =>
      getMedicationLabel(medication).toLowerCase().includes(query),
    )
  }, [medicationQuery, medications])

  const selectedMedications = useMemo(
    () =>
      medications.filter((medication) =>
        form.medication_ids.includes(medication.id),
      ),
    [form.medication_ids, medications],
  )

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
        showNotification('Mascota actualizada correctamente.', 'success')
      } else {
        await addPet(form)
        showNotification('Mascota creada correctamente.', 'success')
      }

      setForm(emptyForm)
    } catch (error) {
      console.error('Error guardando mascota', error)
      showNotification('No se pudo guardar la mascota. Verifica que la API este disponible.', 'error')
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
      showNotification('Mascota eliminada correctamente.', 'success')
    } catch (error) {
      console.error('Error eliminando mascota', error)
      showNotification('No se pudo eliminar la mascota. Verifica que la API este disponible.', 'error')
    }
  }

  const handleMedicationToggle = (id: string) => {
    setForm((prev) => {
      const exists = prev.medication_ids.includes(id)

      return {
        ...prev,
        medication_ids: exists
          ? prev.medication_ids.filter((item) => item !== id)
          : [...prev.medication_ids, id],
      }
    })
  }

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">CRUD de mascotas</h2>

      <form
        className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2"
        onSubmit={handleSubmit}
      >
        <label className="space-y-1">
          <span className="text-sm font-medium text-slate-700">Identificacion</span>
          <input
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-emerald-200 focus:ring"
            placeholder="Ej. PET-1001"
            value={form.identification}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, identification: event.target.value }))
            }
          />
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium text-slate-700">Nombre</span>
          <input
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-emerald-200 focus:ring"
            placeholder="Nombre de la mascota"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          />
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium text-slate-700">Raza</span>
          <input
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-emerald-200 focus:ring"
            placeholder="Ej. Labrador"
            value={form.breed}
            onChange={(event) => setForm((prev) => ({ ...prev, breed: event.target.value }))}
          />
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium text-slate-700">Edad (años)</span>
          <input
            required
            min={0}
            type="number"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-emerald-200 focus:ring"
            placeholder="0"
            value={form.age}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, age: Number(event.target.value) }))
            }
          />
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium text-slate-700">Peso (kg)</span>
          <input
            required
            min={0}
            step="0.1"
            type="number"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-emerald-200 focus:ring"
            placeholder="0.0"
            value={form.weight}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, weight: Number(event.target.value) }))
            }
          />
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium text-slate-700">Cliente</span>
          <select
            required
            value={form.client_id}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-emerald-200 focus:ring"
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
        </label>

        <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3 md:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-900">Medicamentos</h3>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span>
                {form.medication_ids.length} seleccionado{form.medication_ids.length === 1 ? '' : 's'}
              </span>
              <button
                type="button"
                className="rounded-md border border-slate-300 bg-white px-2 py-1 font-medium text-slate-700 hover:bg-slate-100"
                onClick={() => setForm((prev) => ({ ...prev, medication_ids: [] }))}
                disabled={form.medication_ids.length === 0}
              >
                Limpiar
              </button>
            </div>
          </div>

          <input
            type="text"
            value={medicationQuery}
            onChange={(event) => setMedicationQuery(event.target.value)}
            placeholder="Buscar medicamento..."
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-200 focus:ring"
          />

          {selectedMedications.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selectedMedications.map((medication) => (
                <button
                  key={medication.id}
                  type="button"
                  className="rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-900 hover:bg-emerald-200"
                  onClick={() => handleMedicationToggle(medication.id)}
                >
                  {getMedicationLabel(medication)} x
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-600">Selecciona al menos un medicamento.</p>
          )}

          <div className="max-h-44 space-y-2 overflow-y-auto rounded-lg border border-slate-200 bg-white p-2">
            {filteredMedications.length > 0 ? (
              filteredMedications.map((medication) => {
                const isSelected = form.medication_ids.includes(medication.id)

                return (
                  <label
                    key={medication.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition ${
                      isSelected
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      checked={isSelected}
                      onChange={() => handleMedicationToggle(medication.id)}
                    />
                    <span className="font-medium">{getMedicationLabel(medication)}</span>
                  </label>
                )
              })
            ) : (
              <p className="px-2 py-3 text-sm text-slate-500">No hay medicamentos que coincidan.</p>
            )}
          </div>
        </div>

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
