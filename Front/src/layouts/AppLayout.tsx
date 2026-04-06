import { NavLink, Outlet } from 'react-router-dom'
import { getApiMode, toggleApiMode } from '../api/graphqlClient'

const links = [
  { to: '/', label: 'Inicio' },
  { to: '/clientes', label: 'Clientes' },
  { to: '/medicamentos', label: 'Medicamentos' },
  { to: '/mascotas', label: 'Mascotas' },
  { to: '/reportes', label: 'Reportes' },
]

export function AppLayout() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-800">
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-20 h-80 w-80 rounded-full bg-sky-200/40 blur-3xl" />

      <header className="relative border-b border-white/70 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 md:px-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Clinica Veterinaria
              </p>
              <h1 className="text-2xl font-extrabold text-slate-900 md:text-3xl">PETS S.A.</h1>
            </div>
            <button
              onClick={toggleApiMode}
              className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              Modo API: {getApiMode()}
            </button>
          </div>
          <nav className="flex flex-wrap gap-2 rounded-2xl border border-slate-200/70 bg-white/70 p-2 shadow-sm">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow'
                      : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-800'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <div className="app-content rounded-3xl border border-white/70 bg-white/70 p-4 shadow-[0_20px_60px_-28px_rgba(15,23,42,0.35)] backdrop-blur md:p-6">
          <Outlet />
        </div>
      </main>

      <footer className="relative mx-auto flex max-w-7xl items-center justify-between px-4 pb-6 pt-2 text-xs text-slate-500 md:px-6">
        <span>PETS S.A. - Sistema Web Veterinario</span>
      </footer>
    </div>
  )
}
