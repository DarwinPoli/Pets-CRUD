import { useState } from 'react'
import { useAppData } from '../context/AppDataContext'

interface ClientForm {
  cedula: string
  nombres: string
  apellidos: string
  direccion: string
  telefono: string
}

const emptyForm: ClientForm = {
  cedula: '',
  nombres: '',
  apellidos: '',
  direccion: '',
  telefono: '',
}

export function ClientsPage() {
  const { clients, addClient, updateClient, removeClient } = useAppData()
  const [form, setForm] = useState<ClientForm>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      if (editingId) {
        await updateClient(editingId, form)
        setEditingId(null)
      } else {
        await addClient(form)
      }

      setForm(emptyForm)
    } catch (error) {
      console.error('Error guardando cliente', error)
      alert('No se pudo guardar el cliente. Verifica que la API este disponible.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (id: string) => {
    const client = clients.find((item) => item.id === id)
    if (!client) {
      return
    }

    setEditingId(id)
    setForm({
      cedula: client.cedula,
      nombres: client.nombres,
      apellidos: client.apellidos,
      direccion: client.direccion,
      telefono: client.telefono,
    })
  }

  const handleDelete = async (id: string) => {
    try {
      const deleted = await removeClient(id)
      if (!deleted) {
        alert('No se puede eliminar el cliente porque tiene mascotas asociadas.')
      }
    } catch (error) {
      console.error('Error eliminando cliente', error)
      alert('No se pudo eliminar el cliente. Verifica que la API este disponible.')
    }
  }

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">CRUD de clientes</h2>

      <form
        className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2"
        onSubmit={handleSubmit}
      >
        <input
          required
          className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-emerald-200 focus:ring"
          placeholder="Cedula"
          value={form.cedula}
          onChange={(event) => setForm((prev) => ({ ...prev, cedula: event.target.value }))}
        />
        <input
          required
          className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-emerald-200 focus:ring"
          placeholder="Nombres"
          value={form.nombres}
          onChange={(event) => setForm((prev) => ({ ...prev, nombres: event.target.value }))}
        />
        <input
          required
          className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-emerald-200 focus:ring"
          placeholder="Apellidos"
          value={form.apellidos}
          onChange={(event) => setForm((prev) => ({ ...prev, apellidos: event.target.value }))}
        />
        <input
          required
          className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-emerald-200 focus:ring"
          placeholder="Telefono"
          value={form.telefono}
          onChange={(event) => setForm((prev) => ({ ...prev, telefono: event.target.value }))}
        />
        <input
          required
          className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-emerald-200 focus:ring md:col-span-2"
          placeholder="Direccion"
          value={form.direccion}
          onChange={(event) => setForm((prev) => ({ ...prev, direccion: event.target.value }))}
        />
        <div className="md:col-span-2 flex gap-2">
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
              <th className="px-4 py-3 text-left">Cedula</th>
              <th className="px-4 py-3 text-left">Nombres</th>
              <th className="px-4 py-3 text-left">Apellidos</th>
              <th className="px-4 py-3 text-left">Direccion</th>
              <th className="px-4 py-3 text-left">Telefono</th>
              <th className="px-4 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="border-t border-slate-200">
                <td className="px-4 py-3">{client.cedula}</td>
                <td className="px-4 py-3">{client.nombres}</td>
                <td className="px-4 py-3">{client.apellidos}</td>
                <td className="px-4 py-3">{client.direccion}</td>
                <td className="px-4 py-3">{client.telefono}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600"
                      onClick={() => handleEdit(client.id)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
                      onClick={() => handleDelete(client.id)}
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
