import strawberry

from app.graphql.queries.client_query import ClientQuery
from app.graphql.queries.pet_query import PetQuery
from app.graphql.queries.medication_query import MedicationQuery
from app.graphql.queries.report_query import ReportQuery
from app.graphql.mutations.client_mutation import ClientMutation
from app.graphql.mutations.pet_mutation import PetMutation
from app.graphql.mutations.medication_mutation import MedicationMutation


@strawberry.type
class Query(ClientQuery, PetQuery, MedicationQuery, ReportQuery):
    """Raíz de todas las queries GraphQL de PETS S.A.
    Hereda las queries de clientes, mascotas, medicamentos y reportes."""
    pass


@strawberry.type
class Mutation(ClientMutation, PetMutation, MedicationMutation):
    """Raíz de todas las mutations GraphQL de PETS S.A.
    Hereda las mutations de clientes, mascotas y medicamentos."""
    pass


# Schema principal de GraphQL que combina queries y mutations
schema = strawberry.Schema(query=Query, mutation=Mutation)
