import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './layouts/AppLayout'

import { ClientsPage } from './pages/ClientsPage'
import { HomePage } from './pages/HomePage'
import { MedicationsPage } from './pages/MedicationsPage'
import { PetsPage } from './pages/PetsPage'
import { ReportsPage } from './pages/ReportsPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="clientes" element={<ClientsPage />} />
        <Route path="medicamentos" element={<MedicationsPage />} />
        <Route path="mascotas" element={<PetsPage />} />
        <Route path="reportes" element={<ReportsPage />} />
    
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
