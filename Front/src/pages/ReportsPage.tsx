import { useEffect, useState } from 'react'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
  getClientReport,
  getMedicationReport,
  getMedicationsByClientReport,
  type ClientReport,
  type MedicationReport,
  type MedicationsByClientReport,
} from '../api/reportsApi'
import { useAppData } from '../context/AppDataContext'
import { useNotification } from '../context/NotificationContext'

type ReportOption = 'clients' | 'medications' | 'pets'

export function ReportsPage() {
  const { clients } = useAppData()
  const { showNotification } = useNotification()
  const [selectedReport, setSelectedReport] = useState<ReportOption>('clients')

  const [clientsReport, setClientsReport] = useState<ClientReport[]>([])
  const [medicationsReport, setMedicationsReport] = useState<MedicationReport[]>([])
  const [petsReport, setPetsReport] = useState<MedicationsByClientReport | null>(null)

  const [selectedClientId, setSelectedClientId] = useState<string>('')

  const [loadingClientsReport, setLoadingClientsReport] = useState(false)
  const [loadingMedicationsReport, setLoadingMedicationsReport] = useState(false)
  const [loadingPetsReport, setLoadingPetsReport] = useState(false)

  const [clientsReportError, setClientsReportError] = useState<string>('')
  const [medicationsReportError, setMedicationsReportError] = useState<string>('')
  const [petsReportError, setPetsReportError] = useState<string>('')

  useEffect(() => {
    if (clients.length > 0 && selectedClientId === '') {
      setSelectedClientId(clients[0].id)
    }
  }, [clients, selectedClientId])

  useEffect(() => {
    if (selectedReport !== 'clients' || clientsReport.length > 0) {
      return
    }

    setLoadingClientsReport(true)
    setClientsReportError('')

    void getClientReport()
      .then((data) => {
        setClientsReport(data)
      })
      .catch(() => {
        setClientsReportError('No se pudo cargar el reporte de clientes.')
      })
      .finally(() => {
        setLoadingClientsReport(false)
      })
  }, [selectedReport, clientsReport.length])

  useEffect(() => {
    if (
      selectedReport !== 'medications' ||
      medicationsReport.length > 0
    ) {
      return
    }

    setLoadingMedicationsReport(true)
    setMedicationsReportError('')

    void getMedicationReport()
      .then((data) => {
        setMedicationsReport(data)
      })
      .catch(() => {
        setMedicationsReportError('No se pudo cargar el reporte de medicamentos.')
      })
      .finally(() => {
        setLoadingMedicationsReport(false)
      })
  }, [selectedReport, medicationsReport.length])

  useEffect(() => {
    if (selectedReport !== 'pets' || selectedClientId === '') {
      return
    }

    setLoadingPetsReport(true)
    setPetsReportError('')

    void getMedicationsByClientReport(selectedClientId)
      .then((data) => {
        setPetsReport(data)
      })
      .catch(() => {
        setPetsReport(null)
        setPetsReportError('No se pudo cargar el reporte de perros por cliente.')
      })
      .finally(() => {
        setLoadingPetsReport(false)
      })
  }, [selectedReport, selectedClientId])

  function getReportTitle() {
    if (selectedReport === 'clients') return 'Reporte completo de clientes'
    if (selectedReport === 'medications') return 'Reporte de medicamentos'
    return 'Reporte de perros por cliente'
  }

  function handleDownloadPdf() {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    const title = getReportTitle()
    const now = new Date()
    const dateLabel = now.toLocaleString('es-CO')
    const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate(),
    ).padStart(2, '0')}`

    doc.setFontSize(16)
    doc.text(title, 40, 44)
    doc.setFontSize(10)
    doc.text(`Generado: ${dateLabel}`, 40, 62)

    if (selectedReport === 'clients') {
      if (clientsReport.length === 0) {
        showNotification('No hay datos de clientes para exportar.', 'warning')
        return
      }

      autoTable(doc, {
        startY: 80,
        head: [[
          'Cliente',
          'Cedula',
          'Telefono',
          'Total mascotas',
          'Mascotas y medicamentos',
        ]],
        body: clientsReport.map((client) => [
          `${client.nombres} ${client.apellidos}`,
          client.cedula,
          client.telefono,
          String(client.totalMascotas),
          client.mascotas.length > 0
            ? client.mascotas
                .map(
                  (pet) =>
                    `${pet.nombre} (${pet.raza}) - ${
                      pet.medicamentos.length > 0
                        ? pet.medicamentos.join(', ')
                        : 'Sin medicamentos'
                    }`,
                )
                .join(' | ')
            : 'Sin mascotas',
        ]),
        styles: {
          fontSize: 9,
          cellPadding: 6,
          valign: 'top',
        },
        headStyles: {
          fillColor: [15, 23, 42],
        },
      })

      doc.save(`reporte-clientes-${dateKey}.pdf`)
      return
    }

    if (selectedReport === 'medications') {
      if (medicationsReport.length === 0) {
        showNotification('No hay datos de medicamentos para exportar.', 'warning')
        return
      }

      autoTable(doc, {
        startY: 80,
        head: [[
          'Nombre',
          'Descripcion',
          'Dosis',
          'Total mascotas',
        ]],
        body: medicationsReport.map((medication) => [
          medication.nombre,
          medication.descripcion || 'Sin descripcion',
          medication.dosis || 'Sin dosis',
          String(medication.totalMascotas),
        ]),
        styles: {
          fontSize: 9,
          cellPadding: 6,
          valign: 'top',
        },
        headStyles: {
          fillColor: [15, 23, 42],
        },
      })

      doc.save(`reporte-medicamentos-${dateKey}.pdf`)
      return
    }

    if (!petsReport) {
      showNotification('Selecciona un cliente con datos para exportar.', 'warning')
      return
    }

    autoTable(doc, {
      startY: 80,
      head: [[
        'Cliente',
        'Cedula',
        'Mascota',
        'Medicamentos',
      ]],
      body: petsReport.mascotas.length > 0
        ? petsReport.mascotas.map((pet) => [
            petsReport.cliente,
            petsReport.cedula,
            pet.nombreMascota,
            pet.medicamentos.length > 0
              ? pet.medicamentos
                  .map((medication) =>
                    `${medication.nombre}${medication.dosis ? ` (${medication.dosis})` : ''}`,
                  )
                  .join(', ')
              : 'Sin medicamentos',
          ])
        : [[
            petsReport.cliente,
            petsReport.cedula,
            'Sin mascotas',
            'Sin medicamentos',
          ]],
      styles: {
        fontSize: 9,
        cellPadding: 6,
        valign: 'top',
      },
      headStyles: {
        fillColor: [15, 23, 42],
      },
    })

    doc.save(`reporte-perros-${dateKey}.pdf`)
  }

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Reportes</h2>

      <article className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              selectedReport === 'clients'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            onClick={() => setSelectedReport('clients')}
          >
            Clientes completos
          </button>

          <button
            type="button"
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              selectedReport === 'medications'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            onClick={() => setSelectedReport('medications')}
          >
            Medicamentos
          </button>

          <button
            type="button"
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              selectedReport === 'pets'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            onClick={() => setSelectedReport('pets')}
          >
            Perros por cliente
          </button>
        </div>

        {selectedReport === 'clients' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-900">Reporte completo de clientes</h3>
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Descargar PDF
              </button>
            </div>

            {clientsReportError && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {clientsReportError}
              </p>
            )}

            {loadingClientsReport ? (
              <p className="text-sm text-slate-600">Cargando reporte...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="px-4 py-3 text-left">Cliente</th>
                      <th className="px-4 py-3 text-left">Cedula</th>
                      <th className="px-4 py-3 text-left">Telefono</th>
                      <th className="px-4 py-3 text-left">Total mascotas</th>
                      <th className="px-4 py-3 text-left">Mascotas y medicamentos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientsReport.map((client) => (
                      <tr key={client.clientId} className="border-t border-slate-200 align-top">
                        <td className="px-4 py-3">{client.nombres} {client.apellidos}</td>
                        <td className="px-4 py-3">{client.cedula}</td>
                        <td className="px-4 py-3">{client.telefono}</td>
                        <td className="px-4 py-3">{client.totalMascotas}</td>
                        <td className="px-4 py-3">
                          {client.mascotas.length > 0
                            ? client.mascotas
                                .map(
                                  (pet) =>
                                    `${pet.nombre} (${pet.raza}) - ${
                                      pet.medicamentos.length > 0
                                        ? pet.medicamentos.join(', ')
                                        : 'Sin medicamentos'
                                    }`,
                                )
                                .join(' | ')
                            : 'Sin mascotas'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {selectedReport === 'medications' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-900">Reporte de medicamentos</h3>
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Descargar PDF
              </button>
            </div>

            {medicationsReportError && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {medicationsReportError}
              </p>
            )}

            {loadingMedicationsReport ? (
              <p className="text-sm text-slate-600">Cargando reporte...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="px-4 py-3 text-left">Nombre</th>
                      <th className="px-4 py-3 text-left">Descripcion</th>
                      <th className="px-4 py-3 text-left">Dosis</th>
                      <th className="px-4 py-3 text-left">Total mascotas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicationsReport.map((medication) => (
                      <tr key={medication.medicationId} className="border-t border-slate-200">
                        <td className="px-4 py-3">{medication.nombre}</td>
                        <td className="px-4 py-3">{medication.descripcion || 'Sin descripcion'}</td>
                        <td className="px-4 py-3">{medication.dosis || 'Sin dosis'}</td>
                        <td className="px-4 py-3">{medication.totalMascotas}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {selectedReport === 'pets' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-900">Reporte de perros por cliente</h3>
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Descargar PDF
              </button>
            </div>

            <div className="max-w-md">
              <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="clientId">
                Cliente
              </label>
              <select
                id="clientId"
                value={selectedClientId}
                onChange={(event) => {
                  setSelectedClientId(event.target.value)
                }}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-300"
              >
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.nombres} {client.apellidos} - {client.cedula}
                  </option>
                ))}
              </select>
            </div>

            {petsReportError && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {petsReportError}
              </p>
            )}

            {loadingPetsReport ? (
              <p className="text-sm text-slate-600">Cargando reporte...</p>
            ) : !petsReport ? (
              <p className="text-sm text-slate-600">Selecciona un cliente para ver el reporte.</p>
            ) : (
              <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-700">
                  <span className="font-semibold">Cliente:</span> {petsReport.cliente}
                </p>
                <p className="text-sm text-slate-700">
                  <span className="font-semibold">Cedula:</span> {petsReport.cedula}
                </p>

                <div className="space-y-2">
                  {petsReport.mascotas.length > 0 ? (
                    petsReport.mascotas.map((pet) => (
                      <div key={pet.nombreMascota} className="rounded-lg border border-slate-200 bg-white p-3">
                        <p className="text-sm font-semibold text-slate-900">{pet.nombreMascota}</p>
                        <p className="text-sm text-slate-700">
                          {pet.medicamentos.length > 0
                            ? pet.medicamentos
                                .map((medication) =>
                                  `${medication.nombre}${
                                    medication.dosis ? ` (${medication.dosis})` : ''
                                  }`,
                                )
                                .join(', ')
                            : 'Sin medicamentos'}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-600">Este cliente no tiene mascotas registradas.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </article>
    </section>
  )
}
