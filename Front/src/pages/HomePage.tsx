import { Link } from 'react-router-dom'
import { useAppData } from '../context/AppDataContext'

const quickLinks = [
  { to: '/clientes', title: 'Gestionar clientes', description: 'CRUD completo de clientes' },
  {
    to: '/medicamentos',
    title: 'Gestionar medicamentos',
    description: 'CRUD completo de medicamentos',
  },
  { to: '/mascotas', title: 'Gestionar mascotas', description: 'CRUD completo de mascotas' },
  { to: '/reportes', title: 'Ver reportes', description: 'Reportes de clientes y medicamentos' },
]

export function HomePage() {
  const { clients, medications, pets } = useAppData()

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-xl border border-emerald-100 bg-emerald-600 text-white shadow-lg md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100">
          Panel Principal
        </p>
        <h2 className="mt-2 text-xl font-extrabold md:text-4xl">Plataforma  PETS</h2>

      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-transparent transition hover:-translate-y-0.5 hover:ring-emerald-200">
          <p className="text-sm font-medium text-slate-500">Clientes registrados</p>
          <p className="mt-2 text-3xl font-extrabold text-emerald-700">{clients.length}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-transparent transition hover:-translate-y-0.5 hover:ring-emerald-200">
          <p className="text-sm font-medium text-slate-500">Medicamentos disponibles</p>
          <p className="mt-2 text-3xl font-extrabold text-emerald-700">{medications.length}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-transparent transition hover:-translate-y-0.5 hover:ring-emerald-200">
          <p className="text-sm font-medium text-slate-500">Mascotas registradas</p>
          <p className="mt-2 text-3xl font-extrabold text-emerald-700">{pets.length}</p>
        </article>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {quickLinks.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-400"
          >
            <h3 className="text-lg font-semibold text-slate-900 transition group-hover:text-emerald-700">
              {item.title}
            </h3>
            <p className="mt-1 text-sm text-slate-600">{item.description}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
