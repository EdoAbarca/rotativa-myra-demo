from django.urls import path
from .views import *
from api import views
from dotenv import load_dotenv
from os import environ
load_dotenv()
from rest_framework_simplejwt import views as jwt_views

urlpatterns=[
    path(environ.get('PROFESIONAL_URL'), ProfesionalView.as_view()),
    path(environ.get('PROFESIONAL_PARAM_URL'), ProfesionalView.as_view()),
    path(environ.get('PACIENTE_URL'), PacienteView.as_view()),
    path(environ.get('PACIENTE_PARAM_URL'), PacienteView.as_view()),
    path(environ.get('AREA_URL'), AreaView.as_view()),
    path(environ.get('AREA_PARAM_URL'), AreaView.as_view()),
    path(environ.get('CENTRO_URL'), CentroView.as_view()),
    path(environ.get('CENTRO_PARAM_URL'), CentroView.as_view()),
    path(environ.get('CARGO_URL'), CargoView.as_view()),
    path(environ.get('CARGO_PARAM_URL'), CargoView.as_view()),
    path(environ.get('CONTRATO_URL'), ContratoView.as_view()),
    path(environ.get('CONTRATO_PARAM_URL'), ContratoView.as_view()),
    path(environ.get('COORDINADOR_URL'), CoordinadorView.as_view()),
    path(environ.get('COORDINADOR_PARAM_URL'), CoordinadorView.as_view()),
    path(environ.get('PAGO_URL'), PagoView.as_view()),
    path(environ.get('PAGO_PARAM_URL'), PagoView.as_view()),
    path(environ.get('REGION_URL'), RegionView.as_view()),
    path(environ.get('REGION_PARAM_URL'), RegionView.as_view()),
    path(environ.get('ZONA_URL'), ZonaView.as_view()),
    path(environ.get('ZONA_PARAM_URL'), ZonaView.as_view()),
    path(environ.get('CLIENTE_URL'), ClienteView.as_view()),
    path(environ.get('CLIENTE_PARAM_URL'), ClienteView.as_view()),
    path(environ.get('ASISTENCIA_URL'), AsistenciaView.as_view()),
    path(environ.get('ASISTENCIA_PARAM_URL'), AsistenciaView.as_view()),
    path(environ.get('TURNO_URL'), TurnoView.as_view()),
    path(environ.get('TURNO_PARAM_URL'), TurnoView.as_view()),    
    path(environ.get('TIPO_TURNO_URL'), TipoTurnoView.as_view()),
    path(environ.get('TIPO_TURNO_PARAM_URL'), TipoTurnoView.as_view()),

    path(environ.get('TIPO_ALERTA_URL'), TipoAlertaView.as_view()),
    path(environ.get('TIPO_ALERTA_PARAM_URL'), TipoAlertaView.as_view()),

    path(environ.get('ALERTA_URL'), AlertaView.as_view()),
    path(environ.get('ALERTA_PARAM_URL'), AlertaView.as_view()),

    path(environ.get('SEARCH_PROFESIONAL_URL'), SearchView.as_view(), name='search-profesional'),
    path(environ.get('FILTER_POSITION_URL'), FilterAreaView.as_view(), name='filter-position'),
    path(environ.get('FILTER_CENTER_URL'), FilterCenterView.as_view(), name='filter-center'),
    #path('get-profesional/<int:id_profesional>/', MyraView.as_view(), name='get-profesional'),
    path(environ.get('SEARCH_PACIENTE_URL'), SearchPacienteView.as_view(), name='search-paciente'),
    path(environ.get('FILTER_CLIENT_TYPE_URL'), FilterTipoClienteView.as_view(), name='filter-client-type'),
    path(environ.get('FILTER_TURN_TYPE_URL'), FilterTipoTurnoView.as_view(), name='filter-turn-type'),
    path(environ.get('REPORTE_PROFESIONAL_URL'), ReporteProfesionalView.as_view()),
    path(environ.get('CARGA_EXCEL_URL'), CargaExcelView.as_view()),
    
    path(environ.get('REGISTER_URL'), views.UserRegister.as_view(), name='register'),
	path(environ.get('LOGIN_URL'), jwt_views.TokenObtainPairView.as_view(serializer_class=CustomTokenObtainPairSerializer), name='login'),
	path(environ.get('LOGOUT_URL'), views.UserLogout.as_view(), name='logout'),
	path(environ.get('USER_URL'), views.UserView.as_view(), name='user'),
    path(environ.get('TOKEN_REFRESH_URL'), jwt_views.TokenRefreshView.as_view(), name='token_refresh'),
]
