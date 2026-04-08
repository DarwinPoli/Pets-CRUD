import { useState } from 'react'
import { useAppData } from '../context/AppDataContext'
import { useNotification } from '../context/NotificationContext'

interface MedicationForm {
  name: string
  description: string
  dosage: string
}

const emptyForm: MedicationForm = {
  name: '',
  description: '',
  dosage: '',
}

export function MedicationsPage() {
  const { medications, addMedication, updateMedication, removeMedication } = useAppData()
  const { showNotification } = useNotification()
  const [form, setForm] = useState<MedicationForm>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setIsSubmitting(true)

    try {
      if (editingId) {
        await updateMedication(editingId, form)
        setEditingId(null)
        showNotification('Medicamento actualizado correctamente.', 'success')
      } else {
        await addMedication(form)
        showNotification('Medicamento creado correctamente.', 'success')
      }

      setForm(emptyForm)
    } catch (error) {
      console.error('Error guardando medicamento', error)
      showNotification('No se pudo guardar el medicamento. Verifica que la API este disponible.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (id: string) => {
    const medication = medications.find((item) => item.id === id)
    if (!medication) {
      return
    }

    setEditingId(id)
    setForm({
      name: medication.name,
      description: medication.description,
      dosage: medication.dosage,
    })
  }

  const handleDelete = async (id: string) => {
    try {
      const deleted = await removeMedication(id)
      if (!deleted) {
        showNotification('No se puede eliminar el medicamento porque esta asignado a una mascota.', 'warning')
        return
      }

      showNotification('Medicamento eliminado correctamente.', 'success')
    } catch (error) {
      console.error('Error eliminando medicamento', error)
      showNotification('No se pudo eliminar el medicamento. Verifica que la API este disponible.', 'error')
    }
  }

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">CRUD de medicamentos</h2>

      <form
        className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        onSubmit={handleSubmit}
      >
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
          placeholder="Descripcion"
          value={form.description}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, description: event.target.value }))
          }
        />
        <input
          required
          className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-emerald-200 focus:ring"
          placeholder="Dosis"
          value={form.dosage}
          onChange={(event) => setForm((prev) => ({ ...prev, dosage: event.target.value }))}
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-emerald-700 px-4 py-2 font-medium text-white hover:bg-emerald-800"
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
      </form>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3 text-left">Descripcion</th>
              <th className="px-4 py-3 text-left">Dosis</th>
              <th className="px-4 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {medications.map((medication) => (
              <tr key={medication.id} className="border-t border-slate-200">
                <td className="px-4 py-3">{medication.name}</td>
                <td className="px-4 py-3">{medication.description}</td>
                <td className="px-4 py-3">{medication.dosage}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600"
                      onClick={() => handleEdit(medication.id)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
                      onClick={() => void handleDelete(medication.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
