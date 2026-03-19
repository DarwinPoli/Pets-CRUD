import { useState } from 'react'
import { useAppData } from '../context/AppDataContext'

interface MedicationForm {
  nombre: string
  descripcion: string
  dosis: string
}

const emptyForm: MedicationForm = {
  nombre: '',
  descripcion: '',
  dosis: '',
}

export function MedicationsPage() {
  const { medications, addMedication, updateMedication, removeMedication } = useAppData()
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
      } else {
        await addMedication(form)
      }

      setForm(emptyForm)
    } catch (error) {
      console.error('Error guardando medicamento', error)
      alert('No se pudo guardar el medicamento. Verifica que la API este disponible.')
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
      nombre: medication.nombre,
      descripcion: medication.descripcion,
      dosis: medication.dosis,
    })
  }

  const handleDelete = async (id: string) => {
    try {
      const deleted = await removeMedication(id)
      if (!deleted) {
        alert('No se puede eliminar el medicamento porque esta asignado a una mascota.')
      }
    } catch (error) {
      console.error('Error eliminando medicamento', error)
      alert('No se pudo eliminar el medicamento. Verifica que la API este disponible.')
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
          value={form.nombre}
          onChange={(event) => setForm((prev) => ({ ...prev, nombre: event.target.value }))}
        />
        <input
          required
          className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-emerald-200 focus:ring"
          placeholder="Descripcion"
          value={form.descripcion}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, descripcion: event.target.value }))
          }
        />
        <input
          required
          className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-emerald-200 focus:ring"
          placeholder="Dosis"
          value={form.dosis}
          onChange={(event) => setForm((prev) => ({ ...prev, dosis: event.target.value }))}
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
                <td className="px-4 py-3">{medication.nombre}</td>
                <td className="px-4 py-3">{medication.descripcion}</td>
                <td className="px-4 py-3">{medication.dosis}</td>
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
