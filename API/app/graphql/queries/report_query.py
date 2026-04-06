import strawberry
from typing import List

from app.graphql.types.report_type import (
    MedicationReportType,
    ClientReportType,
    ClientMedicationReportType,
)
from app.graphql.resolvers.report_resolver import (
    resolve_report_medications,
    resolve_report_clients,
    resolve_report_medications_by_client,
)


@strawberry.type
class ReportQuery:
    """Queries para los reportes del centro veterinario."""

    @strawberry.field(description="Reporte de medicamentos con el total de mascotas que los usan.")
    def report_medications(self) -> List[MedicationReportType]:
        return resolve_report_medications()

    @strawberry.field(description="Reporte de clientes con resumen de sus mascotas y medicamentos.")
    def report_clients(self) -> List[ClientReportType]:
        return resolve_report_clients()

    @strawberry.field(description="Reporte de medicamentos filtrado por un cliente específico.")
    def report_medications_by_client(self, client_id: int) -> ClientMedicationReportType:
        return resolve_report_medications_by_client(client_id)
