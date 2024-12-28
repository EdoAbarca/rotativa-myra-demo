from typing import Any
from django.http import JsonResponse, HttpResponse, HttpRequest
from django.views import View  # A cambiar
from .models import *
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import json
import pandas as pd
from django.db.models import Q
from django.db import IntegrityError
from django.core.exceptions import ValidationError
from django.core.exceptions import ObjectDoesNotExist, MultipleObjectsReturned
from django.db import connection
from django.db.utils import DatabaseError
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import *
from rest_framework.parsers import MultiPartParser
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
import math

#############################################################################################
#############################################################################################
#############################################################################################

# CRUD

class CargoView(View):
    @method_decorator(csrf_exempt)
    def dispatch(self, request: HttpRequest, *args: Any, **kwargs: Any) -> HttpResponse:
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, id=0):
        if (id > 0):
            cargos = list(Cargo.objects.filter(id=id).values())
            if len(cargos) > 0:
                cargo = cargos[0]
                datos = {'message': "Success", 'cargo': cargo}
            else:
                datos = {'message': "Cargo no encontrado."}
            return JsonResponse(datos)
        else:
            cargos = list(Cargo.objects.values())
            if len(cargos) > 0:
                datos = {'message': "Success", 'cargos': cargos}
            else:
                datos = {'message': "Sin cargos."}
            return JsonResponse(datos)

    def post(self, request):
        json_data = json.loads(request.body)
        Cargo.objects.create(cargo=json_data['cargo'])
        datos = {'message': "Success"}
        return JsonResponse(datos)

    def put(self, request, id):
        json_data = json.loads(request.body)
        cargos = list(Cargo.objects.filter(id=id).values())
        if len(cargos) > 0:
            cargo = Cargo.objects.get(id=id)
            cargo.cargo = json_data['cargo']
            cargo.save()
            datos = {'message': "Success"}
        else:
            datos = {'message': "Cargo no encontrado"}
        return JsonResponse(datos)

    def delete(self, request, id):
        cargos = list(Cargo.objects.filter(id=id).values())
        if len(cargos) > 0:
            Cargo.objects.filter(id=id).delete()
            datos = {'message': "Success"}
        else:
            datos = {'message': "Cargo no encontrado"}
        return JsonResponse(datos)


class ContratoView(View):
    @method_decorator(csrf_exempt)
    def dispatch(self, request: HttpRequest, *args: Any, **kwargs: Any) -> HttpResponse:
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, id=0):
        if (id > 0):
            contratos = list(Contrato.objects.filter(id=id).values())
            if len(contratos) > 0:
                contrato = contratos[0]
                datos = {'message': "Success", 'contrato': contrato}
            else:
                datos = {'message': "Contrato no encontrado."}
            return JsonResponse(datos)
        else:
            contratos = list(Contrato.objects.values())
            if len(contratos) > 0:
                datos = {'message': "Success", 'contratos': contratos}
            else:
                datos = {'message': "Sin contratos."}
            return JsonResponse(datos)

    def post(self, request):
        json_data = json.loads(request.body)
        Contrato.objects.create(tipoContrato=json_data['tipoContrato'])
        datos = {'message': "Success"}
        return JsonResponse(datos)

    def put(self, request, id):
        json_data = json.loads(request.body)
        contratos = list(Contrato.objects.filter(id=id).values())
        if len(contratos) > 0:
            contratos = Contrato.objects.get(id=id)
            contratos.tipoContrato = json_data['tipoContrato']
            contratos.save()
            datos = {'message': "Success"}
        else:
            datos = {'message': "Contrato no encontrado"}
        return JsonResponse(datos)

    def delete(self, request, id):
        contratos = list(Contrato.objects.filter(id=id).values())
        if len(contratos) > 0:
            Contrato.objects.filter(id=id).delete()
            datos = {'message': "Success"}
        else:
            datos = {'message': "Contrato no encontrado"}
        return JsonResponse(datos)


class CentroView(View):
    @method_decorator(csrf_exempt)
    def dispatch(self, request: HttpRequest, *args: Any, **kwargs: Any) -> HttpResponse:
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, id=0):
        if (id > 0):
            centros = list(Centro.objects.filter(id=id).values())
            if len(centros) > 0:
                centro = centros[0]
                datos = {'message': "Success", 'centro': centro}
            else:
                datos = {'message': "Centro no encontrado."}
            return JsonResponse(datos)
        else:
            centros = list(Centro.objects.values())
            if len(centros) > 0:
                datos = {'message': "Success", 'centros': centros}
            else:
                datos = {'message': "Sin centros."}
            return JsonResponse(datos)

    def post(self, request):
        json_data = json.loads(request.body)
        Centro.objects.create(nombreCentro=json_data['nombreCentro'])
        datos = {'message': "Success"}
        return JsonResponse(datos)

    def put(self, request, id):
        json_data = json.loads(request.body)
        centros = list(Centro.objects.filter(id=id).values())
        if len(centros) > 0:
            centros = Centro.objects.get(id=id)
            centros.nombreCentro = json_data['nombreCentro']
            centros.save()
            datos = {'message': "Success"}
        else:
            datos = {'message': "Centro no encontrado"}
        return JsonResponse(datos)

    def delete(self, request, id):
        centros = list(Centro.objects.filter(id=id).values())
        if len(centros) > 0:
            Centro.objects.filter(id=id).delete()
            datos = {'message': "Success"}
        else:
            datos = {'message': "Centro no encontrado"}
        return JsonResponse(datos)


class CoordinadorView(View):
    @method_decorator(csrf_exempt)
    def dispatch(self, request: HttpRequest, *args: Any, **kwargs: Any) -> HttpResponse:
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, id=0):
        if (id > 0):
            try:
                coordinador = Coordinador.objects.get(id=id)
            except Coordinador.DoesNotExist:
                datos = {'message': 'Coordinador no encontrado'}
                return JsonResponse(datos, status=404)

            profesionales = Profesional.objects.filter(idCoordinador_id=id)
            pacientes = Paciente.objects.filter(idCoordinador_id=id)

            horasExtra = 0
            inasistencias = 0
            licencias = 0
            vacaciones = 0
            for p in profesionales:
                horasExtra = p.horasExtras + horasExtra
                inasistencias = p.inasistencias + inasistencias
                licencias = p.licencia + licencias
                vacaciones = p.vacaciones + vacaciones

            datos_coordinador = {
                'nombre': coordinador.nombre,
                'rut': coordinador.rut,
                'inasistencias': inasistencias,
                'horasExtras': horasExtra,
                'vacaciones': vacaciones,
                'licencia': licencias,
                'idCentro_id': coordinador.idCentro.id,
                'idArea_id': coordinador.idArea.id,
                'profesionales': [
                    {'id': prof.id, 'nombre': prof.nombre,
                     'rut': prof.rut,
                     'idCentro_id': prof.idCentro.id,
                     'idArea_id': prof.idArea.id} for prof in profesionales],
                'pacientes': [
                    {'id': pac.id, 'nombre': pac.nombre,
                     'idCliente_id': pac.idCliente.id,
                     'idTipoTurno_id': pac.idTipoTurno.id} for pac in pacientes],
            }

            datos = {'message': 'Success', 'coordinador': datos_coordinador}
            return JsonResponse(datos)
        else:
            coordinadores = list(Coordinador.objects.values())
            if len(coordinadores) > 0:
                datos = {'message': "Success", 'coordinadores': coordinadores}
            else:
                datos = {'message': "Sin coordinadores."}
            return JsonResponse(datos)

    def post(self, request):
        json_data = json.loads(request.body)
        Coordinador.objects.create(nombre=json_data['nombre'], rut=json_data['rut'],
                                   idCargo=json_data['idArea'], idCentro=json_data['idCentro'])
        datos = {'message': "Success"}
        return JsonResponse(datos)

    def put(self, request, id):
        json_data = json.loads(request.body)
        coordinadores = list(Coordinador.objects.filter(id=id).values())
        if len(coordinadores) > 0:
            coordinador = Coordinador.objects.get(id=id)
            coordinador.nombre = json_data['nombre']
            coordinador.rut = json_data['rut']
            coordinador.idCargo = json_data['idArea']
            coordinador.idCentro = json_data['idCentro']
            coordinador.save()
            datos = {'message': "Success"}
        else:
            datos = {'message': "Coordinador no encontrado"}
        return JsonResponse(datos)

    def delete(self, request, id):
        coordinadores = list(Coordinador.objects.filter(id=id).values())
        if len(coordinadores) > 0:
            Coordinador.objects.filter(id=id).delete()
            datos = {'message': "Success"}
        else:
            datos = {'message': "Coordinador no encontrado"}
        return JsonResponse(datos)


class AreaView(View):
    @method_decorator(csrf_exempt)
    def dispatch(self, request: HttpRequest, *args: Any, **kwargs: Any) -> HttpResponse:
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, id=0):
        if (id > 0):
            areas = list(Area.objects.filter(id=id).values())
            if len(areas) > 0:
                area = areas[0]
                datos = {'message': "Success", 'area': area}
            else:
                datos = {'message': "Area no encontrada."}
            return JsonResponse(datos)
        else:
            areas = list(Area.objects.values())
            if len(areas) > 0:
                datos = {'message': "Success", 'areas': areas}
            else:
                datos = {'message': "Sin areas."}
            return JsonResponse(datos)

    def post(self, request):
        json_data = json.loads(request.body)
        Area.objects.create(nombreArea=json_data['nombreArea'])
        datos = {'message': "Success"}
        return JsonResponse(datos)

    def put(self, request, id):
        json_data = json.loads(request.body)
        areas = list(Area.objects.filter(id=id).values())
        if len(areas) > 0:
            areas = Area.objects.get(id=id)
            areas.nombreArea = json_data['nombreArea']
            areas.save()
            datos = {'message': "Success"}
        else:
            datos = {'message': "Area no encontrada"}
        return JsonResponse(datos)

    def delete(self, request, id):
        areas = list(Area.objects.filter(id=id).values())
        if len(areas) > 0:
            Area.objects.filter(id=id).delete()
            datos = {'message': "Success"}
        else:
            datos = {'message': "Area no encontrada"}
        return JsonResponse(datos)


class ProfesionalView(View):

    @method_decorator(csrf_exempt)
    def dispatch(self, request: HttpRequest, *args: Any, **kwargs: Any) -> HttpResponse:
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, id=0):
        if (id > 0):
            try:
                profesional = Profesional.objects.get(id=id)
            except Profesional.DoesNotExist:
                datos = {'message': 'Profesional no encontrado'}
                return JsonResponse(datos, status=404)

            pagos = Pago.objects.filter(idProfesional_id=id)
            asistencias = Asistencia.objects.filter(idProfesional_id=id)

            datos_profesional = {
                'nombre': profesional.nombre,
                'rut': profesional.rut,
                'inasistencias': profesional.inasistencias,
                'horasTotales': profesional.horasTotales,
                'horasExtras': profesional.horasExtras,
                'vacaciones': profesional.vacaciones,
                'licencia': profesional.licencia,
                'valorHora': profesional.valorHora,
                'horasCont': profesional.horasCont,
                'horasObj': profesional.horasObj,
                'turnosTrab': profesional.turnosTrab,
                'bonoColacion': profesional.bonoColacion,
                'bonoMov': profesional.bonoMov,
                'bonoResp': profesional.bonoResp,
                'idCentro_id': profesional.idCentro.id,
                'idArea_id': profesional.idArea.id,
                'idCargo_id': profesional.idCargo.id,
                'idContrato_id': profesional.idContrato.id,
                'tipoContrato': profesional.idContrato.tipoContrato,
                'idCoordinador_id': profesional.idCoordinador.id,
                'nombreCoordinador': profesional.idCoordinador.nombre,
                'asistencias': [
                    {
                        'id': asistencia.id,
                        'fechaAsistencia': asistencia.fechaAsistencia,
                        'asisteProfesional': asistencia.asisteProfesional,
                        'estado': asistencia.estado,
                        'nombrePaciente': asistencia.idPaciente.nombre,
                        'idPaciente_id': asistencia.idPaciente.id,
                        #'idTurno_id': asistencia.idTurno.id
                     } for asistencia in asistencias],
                'pagos': [
                    {'sueldoBase': pago.sueldoBase, 'gratificacion': pago.gratificacion, 'horaExtra': pago.horaExtra,
                     'bonos': pago.bonos, 'aguinaldo': pago.aguinaldo, 'vacaciones': pago.vacaciones,
                     'viatico': pago.viatico, 'asignacionFamiliar': pago.asignacionFamiliar,
                     'colacion': pago.colacion, 'movilizacion': pago.movilizacion, 'salaCuna': pago.salaCuna,
                     'totalHaberes': pago.totalHaberes, 'totalImponible': pago.totalImponible, 'afp': pago.afp,
                     'isapre': pago.isapre, 'fonasa': pago.fonasa, 'segCes': pago.segCes,
                     'imptoUnico': pago.imptoUnico, 'ctaAfp': pago.ctaAfp, 'anticipos': pago.anticipos,
                     'descuento': pago.descuento, 'ley3': pago.ley3, 'totalDescuento': pago.totalDescuento,
                     'liquido': pago.liquido, 'fechaPago': pago.fechaPago} for pago in pagos],
            }

            datos = {'message': 'Success', 'profesional': datos_profesional}
            return JsonResponse(datos)
        else:
            profesionales = list(Profesional.objects.values())
            if len(profesionales) > 0:
                datos = {'message': "Success", 'profesionales': profesionales}
            else:
                datos = {'message': "Sin profesionales."}
            return JsonResponse(datos)

    def post(self, request):
        json_data = json.loads(request.body)
        Profesional.objects.create(nombre=json_data['nombre'], rut=json_data['rut'], inasistencias=json_data['inasistencias'],
                                   horasTotales=json_data['horasTotales'], horasExtras=json_data['horasExtras'],
                                   vacaciones=json_data['vacaiones'], licencia=json_data['licencia'],
                                   valorHora=json_data['valorHora'], horasCont=json_data['horasCont'],
                                   horasObj=json_data['horasObj'], turnosTrab=json_data['turnosTrab'],
                                   bonoColacion=json_data['bonoColacion'], bonoMov=json_data['bonoMov'], bonoResp=json_data['bonoResp'],
                                   idCentro=json_data['idCentro'], idArea=['idArea'], idCargo=json_data['idCargo'],
                                   idContrato=json_data['idContrato'], idCoordinador=json_data['idCoordinador']
                                   )
        datos = {'message': "Success"}
        return JsonResponse(datos)

    def put(self, request, id):
        json_data = json.loads(request.body)
        profesionales = list(Profesional.objects.filter(id=id).values())
        if len(profesionales) > 0:
            profesional = Profesional.objects.get(id=id)
            profesional.nombre = json_data['nombre']
            profesional.rut = json_data['rut']
            profesional.inasistencias = json_data['inasistencias']
            profesional.horasTotales = json_data['horasTotales']
            profesional.horasExtras = json_data['horasExtras']
            profesional.vacaciones = json_data['vacaiones']
            profesional.licencia = json_data['licencia']
            profesional.valorHora = json_data['valorHora']
            profesional.horasCont = json_data['horasCont']
            profesional.horasObj = json_data['horasObj']
            profesional.turnosTrab = json_data['turnosTrab']
            profesional.bonoColacion = json_data['bonoColacion']
            profesional.bonoMov = json_data['bonoMov']
            profesional.bonoResp = json_data['bonoResp']
            profesional.idCentro = json_data['idCentro']
            profesional.idArea = json_data['idArea']
            profesional.idCargo = json_data['idCargo']
            profesional.idContrato = json_data['idContrato']
            profesional.idCoordinador = json_data['idCoordinador']
            profesional.save()
            datos = {'message': "Success"}
        else:
            datos = {'message': "Profesional no encontrado"}
        return JsonResponse(datos)

    def delete(self, request, id):
        profesionales = list(Profesional.objects.filter(id=id).values())
        if len(profesionales) > 0:
            Profesional.objects.filter(id=id).delete()
            datos = {'message': "Success"}
        else:
            datos = {'message': "Profesional no encontrado"}
        return JsonResponse(datos)


class PagoView(View):
    @method_decorator(csrf_exempt)
    def dispatch(self, request: HttpRequest, *args: Any, **kwargs: Any) -> HttpResponse:
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, id=0):
        if (id > 0):
            pagos = list(Pago.objects.filter(id=id).values())
            if len(pagos) > 0:
                pago = pagos[0]
                datos = {'message': "Success", 'pago': pago}
            else:
                datos = {'message': "Pago no encontrado."}
            return JsonResponse(datos)
        else:
            pagos = list(Pago.objects.values())
            if len(pagos) > 0:
                datos = {'message': "Success", 'pagos': pagos}
            else:
                datos = {'message': "Sin pagos."}
            return JsonResponse(datos)

    def post(self, request):
        json_data = json.loads(request.body)
        Pago.objects.create(sueldoBase=json_data['sueldoBase'], gratificacion=json_data['gratificacion'],
                            horaExtra=json_data['horaExtra'], bonos=json_data['bonos'],
                            aguinaldo=json_data['aguinaldo'], vacaciones=json_data['vacaciones'],
                            viatico=json_data['viatico'], asignacionFamiliar=json_data['asignacionFamiliar'],
                            colacion=json_data['colacion'], movilizacion=json_data['movilizacion'],
                            salaCuna=json_data['salaCuna'], totalHaberes=json_data['totalHaberes'],
                            totalImponible=json_data['totalImponible'], afp=json_data['afp'],
                            isapre=json_data['isapre'], fonasa=json_data['fonasa'], segCes=json_data['segCes'],
                            imptoUnico=json_data['imptoUnico'], ctaAfp=json_data['ctaAfp'],
                            anticipos=json_data['anticipos'], descuento=json_data['descuento'], ley3=json_data['ley3'],
                            totalDescuento=json_data['totalDescuento'], liquido=json_data['liquido'],
                            fechaPago=json_data['fechaPago'],
                            idProfesional=json_data['idProfesional'])
        datos = {'message': "Success"}
        return JsonResponse(datos)

    def put(self, request, id):
        json_data = json.loads(request.body)
        pagos = list(Pago.objects.filter(id=id).values())
        if len(pagos) > 0:
            pagos = Pago.objects.get(id=id)
            pagos.sueldoBase = json_data['sueldoBase']
            pagos.gratificacion = json_data['gratificacion']
            pagos.horaExtra = json_data['horaExtra']
            pagos.bonos = json_data['bonos']
            pagos.aguinaldo = json_data['aguinaldo']
            pagos.vacaciones = json_data['vacaciones']
            pagos.viatico = json_data['viatico']
            pagos.asignacionFamiliar = json_data['asignacionFamiliar']
            pagos.colacion = json_data['colacion']
            pagos.movilizacion = json_data['movilizacion']
            pagos.salaCuna = json_data['salaCuna']
            pagos.totalHaberes = json_data['totalHaberes']
            pagos.totalImponible = json_data['totalImponible']
            pagos.afp = json_data['afp']
            pagos.isapre = json_data['isapre']
            pagos.fonasa = json_data['fonasa']
            pagos.segCes = json_data['segCes']
            pagos.imptoUnico = json_data['imptoUnico']
            pagos.ctaAfp = json_data['ctaAfp']
            pagos.anticipos = json_data['anticipos']
            pagos.descuento = json_data['descuento']
            pagos.ley3 = json_data['ley3']
            pagos.totalDescuento = json_data['totalDescuento']
            pagos.liquido = json_data['liquido']
            pagos.fechaPago = json_data['fechaPago']
            pagos.idProfesional = json_data['idProfesional']
            pagos.save()
            datos = {'message': "Success"}
        else:
            datos = {'message': "Pago no encontrado"}
        return JsonResponse(datos)

    def delete(self, request, id):
        pagos = list(Pago.objects.filter(id=id).values())
        if len(pagos) > 0:
            Pago.objects.filter(id=id).delete()
            datos = {'message': "Success"}
        else:
            datos = {'message': "Pago no encontrado"}
        return JsonResponse(datos)


class RegionView(View):
    @method_decorator(csrf_exempt)
    def dispatch(self, request: HttpRequest, *args: Any, **kwargs: Any) -> HttpResponse:
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, id=0):
        if (id > 0):
            regiones = list(Region.objects.filter(id=id).values())
            if len(regiones) > 0:
                region = regiones[0]
                datos = {'message': "Success", 'region': region}
            else:
                datos = {'message': "Region no encontrada."}
            return JsonResponse(datos)
        else:
            regiones = list(Region.objects.values())
            if len(regiones) > 0:
                datos = {'message': "Success", 'regiones': regiones}
            else:
                datos = {'message': "Sin regiones."}
            return JsonResponse(datos)

    def post(self, request):
        json_data = json.loads(request.body)
        Region.objects.create(nombreRegion=json_data['nombreRegion'])
        datos = {'message': "Success"}
        return JsonResponse(datos)

    def put(self, request, id):
        json_data = json.loads(request.body)
        regiones = list(Region.objects.filter(id=id).values())
        if len(regiones) > 0:
            regiones = Region.objects.get(id=id)
            regiones.nombreRegion = json_data['nombreRegion']
            regiones.save()
            datos = {'message': "Success"}
        else:
            datos = {'message': "Region no encontrada"}
        return JsonResponse(datos)

    def delete(self, request, id):
        regiones = list(Region.objects.filter(id=id).values())
        if len(regiones) > 0:
            Region.objects.filter(id=id).delete()
            datos = {'message': "Success"}
        else:
            datos = {'message': "Region no encontrada"}
        return JsonResponse(datos)


class ZonaView(View):
    @method_decorator(csrf_exempt)
    def dispatch(self, request: HttpRequest, *args: Any, **kwargs: Any) -> HttpResponse:
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, id=0):
        if (id > 0):
            zonas = list(Zona.objects.filter(id=id).values())
            if len(zonas) > 0:
                zona = zonas[0]
                datos = {'message': "Success", 'zona': zona}
            else:
                datos = {'message': "Zona no encontrada."}
            return JsonResponse(datos)
        else:
            zonas = list(Zona.objects.values())
            if len(zonas) > 0:
                datos = {'message': "Success", 'zonas': zonas}
            else:
                datos = {'message': "Sin zonas."}
            return JsonResponse(datos)

    def post(self, request):
        json_data = json.loads(request.body)
        Zona.objects.create(nombreZona=json_data['nombreZona'])
        datos = {'message': "Success"}
        return JsonResponse(datos)

    def put(self, request, id):
        json_data = json.loads(request.body)
        zonas = list(Zona.objects.filter(id=id).values())
        if len(zonas) > 0:
            zonas = Zona.objects.get(id=id)
            zonas.nombreZona = json_data['nombreZona']
            zonas.save()
            datos = {'message': "Success"}
        else:
            datos = {'message': "Zona no encontrada"}
        return JsonResponse(datos)

    def delete(self, request, id):
        zonas = list(Zona.objects.filter(id=id).values())
        if len(zonas) > 0:
            Zona.objects.filter(id=id).delete()
            datos = {'message': "Success"}
        else:
            datos = {'message': "Zona no encontrada"}
        return JsonResponse(datos)


class ClienteView(View):
    @method_decorator(csrf_exempt)
    def dispatch(self, request: HttpRequest, *args: Any, **kwargs: Any) -> HttpResponse:
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, id=0):
        if (id > 0):
            clientes = list(Cliente.objects.filter(id=id).values())
            if len(clientes) > 0:
                cliente = clientes[0]
                datos = {'message': "Success", 'cliente': cliente}
            else:
                datos = {'message': "Cliente no encontrado."}
            return JsonResponse(datos)
        else:
            clientes = list(Cliente.objects.values())
            if len(clientes) > 0:
                datos = {'message': "Success", 'clientes': clientes}
            else:
                datos = {'message': "Sin clientes."}
            return JsonResponse(datos)

    def post(self, request):
        json_data = json.loads(request.body)
        Cliente.objects.create(nombreCliente=json_data['nombreCliente'])
        datos = {'message': "Success"}
        return JsonResponse(datos)

    def put(self, request, id):
        json_data = json.loads(request.body)
        clientes = list(Cliente.objects.filter(id=id).values())
        if len(clientes) > 0:
            clientes = Cliente.objects.get(id=id)
            clientes.nombreCliente = json_data['nombreCliente']
            clientes.save()
            datos = {'message': "Success"}
        else:
            datos = {'message': "Cliente no encontrado"}
        return JsonResponse(datos)

    def delete(self, request, id):
        clientes = list(Cliente.objects.filter(id=id).values())
        if len(clientes) > 0:
            Cliente.objects.filter(id=id).delete()
            datos = {'message': "Success"}
        else:
            datos = {'message': "Cliente no encontrado"}
        return JsonResponse(datos)


class TipoTurnoView(View):
    @method_decorator(csrf_exempt)
    def dispatch(self, request: HttpRequest, *args: Any, **kwargs: Any) -> HttpResponse:
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, id=0):
        if (id > 0):
            tipoturnos = list(TipoTurno.objects.filter(id=id).values())
            if len(tipoturnos) > 0:
                tipoturno = tipoturnos[0]
                datos = {'message': "Success", 'tipoturno': tipoturno}
            else:
                datos = {'message': "Tipo turno no encontrado."}
            return JsonResponse(datos)
        else:
            tipoturnos = list(TipoTurno.objects.values())
            if len(tipoturnos) > 0:
                datos = {'message': "Success", 'tipoturnos': tipoturnos}
            else:
                datos = {'message': "Sin tipo turnos."}
            return JsonResponse(datos)

    def post(self, request):
        json_data = json.loads(request.body)
        TipoTurno.objects.create(tipoTurno=json_data['tipoTurno'])
        datos = {'message': "Success"}
        return JsonResponse(datos)

    def put(self, request, id):
        json_data = json.loads(request.body)
        tipoturnos = list(TipoTurno.objects.filter(id=id).values())
        if len(tipoturnos) > 0:
            tipoturno = TipoTurno.objects.get(id=id)
            tipoturno.tipoTurno = json_data['cargo']
            tipoturno.save()
            datos = {'message': "Success"}
        else:
            datos = {'message': "Tipo turno no encontrado"}
        return JsonResponse(datos)

    def delete(self, request, id):
        tipoturnos = list(TipoTurno.objects.filter(id=id).values())
        if len(tipoturnos) > 0:
            TipoTurno.objects.filter(id=id).delete()
            datos = {'message': "Success"}
        else:
            datos = {'message': "Tipo turno no encontrado"}
        return JsonResponse(datos)


class PacienteView(View):
    @method_decorator(csrf_exempt)
    def dispatch(self, request: HttpRequest, *args: Any, **kwargs: Any) -> HttpResponse:
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, id=0):
        if (id > 0):
            try:
                paciente = Paciente.objects.get(id=id)
            except Paciente.DoesNotExist:
                datos = {'message': 'Profesional no encontrado'}
                return JsonResponse(datos, status=404)

            datos_asistencias = []
            asistencias = Asistencia.objects.filter(idPaciente_id=id)
            inasistencias_totales = 0
            asistencias_filtradas = []

            for asistencia in asistencias:
                if asistencia.idProfesional.id not in asistencias_filtradas:
                    id = asistencia.idProfesional.id
                    nombre = asistencia.idProfesional.nombre
                    obj_profesional = [id, nombre]
                    asistencias_filtradas.append(obj_profesional)
                datos_asistencia = {
                    'id': asistencia.id,
                    'fechaAsistencia': asistencia.fechaAsistencia,
                    'asisteProfesional': asistencia.asisteProfesional,
                    'estado': asistencia.estado,
                    #'idTurno_id': asistencia.idTurno.id,
                    'nombreProfesional': asistencia.idProfesional.nombre,
                    'rutProfesional': asistencia.idProfesional.rut,
                    'idProfesional_id': asistencia.idProfesional.id,
                    'idArea_id': asistencia.idProfesional.idArea.id
                }
                datos_asistencias.append(datos_asistencia)
                if asistencia.asisteProfesional == False:
                    inasistencias_totales = inasistencias_totales + 1

            lista_costos = []
            for idprofesional in asistencias_filtradas:
                costototal = 0
                horas = 0
                movilizacion = 0
                colacion = 0
                valorhora = 0
                for asistencia in asistencias:
                    if idprofesional[0] == asistencia.idProfesional.id:
                        movilizacion = movilizacion + asistencia.movilizacion
                        horas = horas + asistencia.horas
                        colacion = colacion + asistencia.colacion
                        valorhora = asistencia.idProfesional.valorHora
                        costototal = movilizacion + colacion + (valorhora * horas)
                costo = {
                    'valorHora': valorhora,
                    'horas': horas,
                    'movilizacion': movilizacion,
                    'colacion': colacion,
                    'costototal': costototal,
                    'id': idprofesional[0],
                    'nombre': idprofesional[1]
                }
                lista_costos.append(costo)

            datos_paciente = {
                'nombre': paciente.nombre,
                'tipoTurno': paciente.idTipoTurno.tipoTurno,
                'fechaInicioAtencion': paciente.fechaInicioAtencion,
                'vigente': paciente.vigente,
                'costo': lista_costos,
                'inasistencias_totales': inasistencias_totales,
                'total_profesionales': len(asistencias_filtradas),
                'idZona_id': paciente.idZona.id,
                'idRegion_id': paciente.idRegion.id,
                'idCliente_id': paciente.idCliente.id,
                'idTipoTurno_id': paciente.idTipoTurno.id,
                'idCoordinador_id': paciente.idCoordinador.id,
                'nombreCoordinador': paciente.idCoordinador.nombre,
                'asistencias': datos_asistencias,
                'zona': paciente.idZona.nombreZona,
                'region': paciente.idRegion.nombreRegion
            }

            datos = {'message': 'Success', 'paciente': datos_paciente}
            return JsonResponse(datos)
        else:
            pacientes = list(Paciente.objects.values())
            if len(pacientes) > 0:
                datos = {'message': "Success", 'pacientes': pacientes}
            else:
                datos = {'message': "Sin pacientes."}
            return JsonResponse(datos)

    def post(self, request):
        json_data = json.loads(request.body)
        Paciente.objects.create(nombre=json_data['nombre'],
                                fechaInicioAtencion=json_data['fechaInicioAtencion'],
                                vigente=json_data['vigente'], gasto=json_data['gasto'],
                                idZona=json_data['idZona'], idRegion=json_data['idRegion'],
                                idCliente=json_data['idCliente'], idTipoTurno=json_data['idTipoTurno'],
                                idCoordinador=json_data['idCoordinador'])
        datos = {'message': "Success"}
        return JsonResponse(datos)

    def put(self, request, id):
        json_data = json.loads(request.body)
        pacientes = list(Paciente.objects.filter(id=id).values())
        if len(pacientes) > 0:
            paciente = Paciente.objects.get(id=id)
            paciente.nombre = json_data['nombre']
            paciente.fechaInicioAtencion = json_data['fechaInicioAtencion']
            paciente.vigente = json_data['vigente']
            paciente.gasto = json_data['gasto']
            paciente.idZona = json_data['idZona']
            paciente.idRegion = json_data['idRegion']
            paciente.idCliente = json_data['idCliente']
            paciente.idTipoTurno = json_data['idTipoTurno']
            paciente.idCoordinador = json_data['idCoordinador']
            paciente.save()
            datos = {'message': "Success"}
        else:
            datos = {'message': "Paciente no encontrado"}
        return JsonResponse(datos)

    def delete(self, request, id):
        pacientes = list(Paciente.objects.filter(id=id).values())
        if len(pacientes) > 0:
            Paciente.objects.filter(id=id).delete()
            datos = {'message': "Success"}
        else:
            datos = {'message': "Paciente no encontrado"}
        return JsonResponse(datos)


class TurnoView(View):
    @method_decorator(csrf_exempt)
    def dispatch(self, request: HttpRequest, *args: Any, **kwargs: Any) -> HttpResponse:
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, id=0):
        if (id > 0):
            turnos = list(Turno.objects.filter(id=id).values())
            if len(turnos) > 0:
                turno = turnos[0]
                datos = {'message': "Success", 'turno': turno}
            else:
                datos = {'message': "Turno no encontrado."}
            return JsonResponse(datos)
        else:
            turnos = list(Turno.objects.values())
            if len(turnos) > 0:
                datos = {'message': "Success", 'turnos': turnos}
            else:
                datos = {'message': "Sin turnos."}
            return JsonResponse(datos)

    def post(self, request):
        json_data = json.loads(request.body)
        Turno.objects.create(fechaInicio=json_data['fechaInicio'],
                             fechaTermino=json_data['fechaTermino'], horas=json_data['horas'],
                             idPaciente=json_data['idPaciente'], idProfesional=json_data['idProfesional'])
        datos = {'message': "Success"}
        return JsonResponse(datos)

    def put(self, request, id):
        json_data = json.loads(request.body)
        turnos = list(Turno.objects.filter(id=id).values())
        if len(turnos) > 0:
            turnos = Turno.objects.get(id=id)
            turnos.fechaInicio = json_data['fechaInicio']
            turnos.fechaTermino = json_data['fechaTermino']
            turnos.horas = json_data['horas']
            turnos.idPaciente = json_data['idPaciente']
            turnos.idProfesional = json_data['idProfesional']
            turnos.save()
            datos = {'message': "Success"}
        else:
            datos = {'message': "Turno no encontrado"}
        return JsonResponse(datos)

    def delete(self, request, id):
        turnos = list(Turno.objects.filter(id=id).values())
        if len(turnos) > 0:
            Turno.objects.filter(id=id).delete()
            datos = {'message': "Success"}
        else:
            datos = {'message': "Turno no encontrado"}
        return JsonResponse(datos)


class AsistenciaView(View):
    @method_decorator(csrf_exempt)
    def dispatch(self, request: HttpRequest, *args: Any, **kwargs: Any) -> HttpResponse:
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, id=0):
        if (id > 0):
            asistencias = list(Asistencia.objects.filter(id=id).values())
            if len(asistencias) > 0:
                asistencia = asistencias[0]
                datos = {'message': "Success", 'asistencia': asistencia}
            else:
                datos = {'message': "Asistencia no encontrada"}
            return JsonResponse(datos)
        else:
            asistencias = list(Asistencia.objects.values())
            if len(asistencias) > 0:
                datos = {'message': "Success", 'asistencias': asistencias}
            else:
                datos = {'message': "Sin asistencias"}
            return JsonResponse(datos)

    def post(self, request):
        json_data = json.loads(request.body)
        Asistencia.objects.create(fechaAsistencia=json_data['fechaAsistencia'],
                                  asisteProfesional=json_data['asisteProfesional'], estado=json_data['estado'],
                                  horas=json_data['horas'], movilizacion=json_data['movilizacion'],
                                  colacion=json_data['colacion'],
                                  idProfesional=json_data['idProfesional'], idPaciente=json_data['idPaciente'],)
        datos = {'message': "Success"}
        return JsonResponse(datos)

    def put(self, request, id):
        json_data = json.loads(request.body)
        asistencias = list(Asistencia.objects.filter(id=id).values())
        if len(asistencias) > 0:
            asistencias = Asistencia.objects.get(id=id)
            asistencias.fechaAsistencia = json_data['fechaAsistencia']
            asistencias.asisteProfesional = json_data['asisteProfesional']
            asistencias.estado = json_data['estado']
            asistencias.horas = json_data['horas']
            asistencias.movilizacion = json_data['movilizacion']
            asistencias.colacion = json_data['colacion'],
            asistencias.idProfesional = json_data['idProfesional']
            asistencias.idPaciente = json_data['idPaciente']
            asistencias.save()
            datos = {'message': "Success"}
        else:
            datos = {'message': "Asistencia no encontrada."}
        return JsonResponse(datos)

    def delete(self, request, id):
        asistencias = list(Asistencia.objects.filter(id=id).values())
        if len(asistencias) > 0:
            Asistencia.objects.filter(id=id).delete()
            datos = {'message': "Success"}
        else:
            datos = {'message': "Asistencia no encontrada"}
        return JsonResponse(datos)

class TipoAlertaView(View):
    @method_decorator(csrf_exempt)
    def dispatch(self, request: HttpRequest, *args: Any, **kwargs: Any) -> HttpResponse:
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, id=0):
        if (id > 0):
            tipoalertas = list(TipoAlerta.objects.filter(id=id).values())
            if len(tipoalertas) > 0:
                tipoalerta = tipoalertas[0]
                datos = {'message': "Success", 'tipoalerta': tipoalerta}
            else:
                datos = {'message': "Tipo alerta no encontrado."}
            return JsonResponse(datos)
        else:
            tipoalertas = list(TipoAlerta.objects.values())
            if len(tipoalertas) > 0:
                datos = {'message': "Success", 'tipoalertas': tipoalertas}
            else:
                datos = {'message': "Sin tipo alertas."}
            return JsonResponse(datos)

    def post(self, request):
        json_data = json.loads(request.body)
        TipoAlerta.objects.create(tipoAlerta=json_data['tipoAlerta'])
        datos = {'message': "Success"}
        return JsonResponse(datos)

    def put(self, request, id):
        json_data = json.loads(request.body)
        tipoalertas = list(TipoAlerta.objects.filter(id=id).values())
        if len(tipoalertas) > 0:
            tipoalerta = TipoAlerta.objects.get(id=id)
            tipoalerta.tipoAlerta = json_data['tipoAlerta']
            tipoalerta.save()
            datos = {'message': "Success"}
        else:
            datos = {'message': "Tipo alerta no encontrado"}
        return JsonResponse(datos)

    def delete(self, request, id):
        tipoalertas = list(TipoAlerta.objects.filter(id=id).values())
        if len(tipoalertas) > 0:
            TipoAlerta.objects.filter(id=id).delete()
            datos = {'message': "Success"}
        else:
            datos = {'message': "Tipo alerta no encontrado"}
        return JsonResponse(datos)

class AlertaView(View):
    @method_decorator(csrf_exempt)
    def dispatch(self, request: HttpRequest, *args: Any, **kwargs: Any) -> HttpResponse:
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, id=0):
        if (id > 0):
            try:
                alerta = Alerta.objects.get(id=id)
            except Alerta.DoesNotExist:
                datos = {'message': 'Alerta no encontrada'}
                return JsonResponse(datos, status=404)

            datos_alerta = {
                'id': alerta.id,
                'fechaAlerta': alerta.fechaAlerta,
                'descripcion': alerta.descripcion,
                'idPaciente_id': alerta.idPaciente.id,
                'nombrePaciente': alerta.idPaciente.nombre,
                'idProfesional_id': alerta.idProfesional.id,
                'nombreProfesional': alerta.idProfesional.nombre,
                'rutProfesional': alerta.idProfesional.rut,
                'idTipoAlerta_id': alerta.idTipoAlerta.id,
            }

            datos = {'message': 'Success', 'alerta': datos_alerta}
            return JsonResponse(datos)
        else:
            alertas = list(Alerta.objects.values())

            idAlertas = list(Alerta.objects.all().values_list('id', flat=True))
            nuevasalertas =[]
            for ida in idAlertas:
                alerta = Alerta.objects.get(id=ida)
                datos_alerta = {
                    'id': ida,
                    'fechaAlerta': alerta.fechaAlerta,
                    'descripcion': alerta.descripcion,
                    'idPaciente_id': alerta.idPaciente.id,
                    'nombrePaciente': alerta.idPaciente.nombre,
                    'idProfesional_id': alerta.idProfesional.id,
                    'nombreProfesional': alerta.idProfesional.nombre,
                    'rutProfesional': alerta.idProfesional.rut,
                    'idTipoAlerta_id': alerta.idTipoAlerta.id,
                }
                nuevasalertas.append(datos_alerta)

            if len(alertas) > 0:
                datos = {'message': "Success", 'alertas': nuevasalertas}
            else:
                datos = {'message': "Sin alertas"}
            return JsonResponse(datos)

    def post(self, request):
        json_data = json.loads(request.body)
        Alerta.objects.create(fechaAlerta=json_data['fechaAlerta'], descripcion=json_data['descripcion'],
                              #profesionales=json_data['profesionales'], pacientes=json_data['pacientes'],
                              idPaciente=json_data['idPaciente'], idAsistencia=json_data['idAsistencia'],
                              idProfesional=json_data['idProfesional'], idTipoAlerta=json_data['idTipoAlerta'])
        datos = {'message': "Success"}
        return JsonResponse(datos)

    def put(self, request, id):
        json_data = json.loads(request.body)
        alertas = list(Alerta.objects.filter(id=id).values())
        if len(alertas) > 0:
            alerta = Alerta.objects.get(id=id)
            alerta.fechaAlerta = json_data['fechaAlerta']
            alerta.descripcion = json_data['descripcion']
            #alerta.profesionales = json_data['profesionales']
            #alerta.pacientes = json_data['pacientes']
            alerta.idPaciente = json_data['idPaciente']
            alerta.idAsistencia = json_data['idAsistencia']
            alerta.idProfesional = json_data['idProfesional']
            alerta.idTipoAlerta = json_data['idTipoAlerta']
            alerta.save()
            datos = {'message': "Success"}
        else:
            datos = {'message': "Alerta no encontrada."}
        return JsonResponse(datos)

    def delete(self, request, id):
        alertas = list(Alerta.objects.filter(id=id).values())
        if len(alertas) > 0:
            Alerta.objects.filter(id=id).delete()
            datos = {'message': "Success"}
        else:
            datos = {'message': "Alerta no encontrada"}
        return JsonResponse(datos)



#############################################################################################
#############################################################################################
#############################################################################################

# FUNCIONALIDADES

class SearchView(View):
    @method_decorator(csrf_exempt)
    def dispatch(self, request: HttpRequest, *args: Any, **kwargs: Any) -> HttpResponse:
        return super().dispatch(request, *args, **kwargs)

    def get(self, request):
        query = request.GET.get('query', '')
        profesionales = Profesional.objects.filter(
            Q(nombre__icontains=query) | Q(rut__icontains=query)
        ).values()

        if profesionales.exists:
            datos = {'message': 'Success',
                     'profesionales': list(profesionales)}
        else:
            datos = {'message': 'No se encontraron coincidencias'}

        return JsonResponse(datos)


class FilterAreaView(View):
    @method_decorator(csrf_exempt)
    def dispatch(self, request: HttpRequest, *args: Any, **kwargs: Any) -> HttpResponse:
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, id_area=0):
        profesionales = Profesional.objects.filter(idArea_id=id_area)

        datos_profesionales = []

        for profesional in profesionales:
            datos_profesional = {
                'id': profesional.id,
                'nombre': profesional.nombre,
                'rut': profesional.rut,
                'idCentro_id': profesional.idCentro.id,
                'idArea_id': profesional.idArea.id,
                'idCargo_id': profesional.idCargo.id,
                # 'idCoordinador': profesional.idCoordinador.id,
            }

            datos_profesionales.append(datos_profesional)

        datos = {'message': 'Success', 'profesionales': datos_profesionales}
        return JsonResponse(datos)


class FilterCenterView(View):
    @method_decorator(csrf_exempt)
    def dispatch(self, request: HttpRequest, *args: Any, **kwargs: Any) -> HttpResponse:
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, id_centro):
        profesionales = Profesional.objects.filter(idCentro_id=id_centro)

        datos_profesionales = []

        for profesional in profesionales:
            datos_profesional = {
                'id': profesional.id,
                'nombre': profesional.nombre,
                'rut': profesional.rut,
                'idCentro_id': profesional.idCentro.id,
                'idArea_id': profesional.idArea.id,
                'idCargo_id': profesional.idCargo.id,
                # 'idCoordinador': profesional.idCoordinador.id,
            }

            datos_profesionales.append(datos_profesional)

        datos = {'message': 'Success', 'profesionales': datos_profesionales}
        return JsonResponse(datos)


class SearchPacienteView(View):
    @method_decorator(csrf_exempt)
    def dispatch(self, request: HttpRequest, *args: Any, **kwargs: Any) -> HttpResponse:
        return super().dispatch(request, *args, **kwargs)

    def get(self, request):
        query = request.GET.get('query', '')
        pacientes = Paciente.objects.filter(
            Q(nombre__icontains=query) | Q(rut__icontains=query)
        ).values()

        if pacientes.exists:
            datos = {'message': 'Success', 'pacientes': list(pacientes)}
        else:
            datos = {'message': 'No se encontraron coincidencias'}

        return JsonResponse(datos)


class FilterTipoClienteView(View):
    @method_decorator(csrf_exempt)
    def dispatch(self, request: HttpRequest, *args: Any, **kwargs: Any) -> HttpResponse:
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, id_cliente=0):
        pacientes = Paciente.objects.filter(idCliente_id=id_cliente)

        datos_pacientes = []

        for paciente in pacientes:
            datos_paciente = {
                'id': paciente.id,
                'nombre': paciente.nombre,
                'rut': paciente.rut,
                'tipoTurno': paciente.tipoTurno,
                'fechaInicioAtencion': paciente.fechaInicioAtencion,
                'vigente': paciente.vigente,
                'idZona_id': paciente.idZona.id,
                'idRegion_id': paciente.idRegion.id,
                'idCliente_id': paciente.idCliente.id,
            }

            datos_pacientes.append(datos_paciente)

        datos = {'message': 'Success', 'pacientes': datos_pacientes}
        return JsonResponse(datos)


class FilterTipoTurnoView(View):
    @method_decorator(csrf_exempt)
    def dispatch(self, request: HttpRequest, *args: Any, **kwargs: Any) -> HttpResponse:
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, id_turno=0):
        pacientes = Paciente.objects.filter(idTipoTurno_id=id_turno)

        datos_pacientes = []

        for paciente in pacientes:
            datos_paciente = {
                'id': paciente.id,
                'nombre': paciente.nombre,
                'idTipoTurno_id': paciente.idTipoTurno.id,
                'fechaInicioAtencion': paciente.fechaInicioAtencion,
                'vigente': paciente.vigente,
                'idZona_id': paciente.idZona.id,
                'idRegion_id': paciente.idRegion.id,
                'idCliente_id': paciente.idCliente.id,
            }

            datos_pacientes.append(datos_paciente)

        datos = {'message': 'Success', 'pacientes': datos_pacientes}
        return JsonResponse(datos)


class CargaExcelView(View):
    # parser_classes = [MultiPartParser]
    @method_decorator(csrf_exempt)
    def dispatch(self, request: HttpRequest, *args: Any, **kwargs: Any) -> HttpResponse:
        return super().dispatch(request, *args, **kwargs)

    def post(self, request):
        try:
            title = request.POST.get('title')
            print(title)
            date = request.POST.get('date')
            print(date)
            file = request.FILES['excel']
            print(file.name)

            # ROTATIVA MENSUAL Y EVENTOS

            #archivos = request.FILES.getlist('excel')  # Obtener la lista de archivos desde el formulario
            archivos = request.FILES['excel']


            contrato_map= {
                'contrato': 'Normal',
                'contrato v2' : 'V2',
                'contrato NC' : 'NC',
                'honorarios' : 'Honorarios'
            }

            centro_map={
                '' : 'Todos',
                'Cuidados' : 'Cuidados',
                'SMI' : 'SMI',
                'Regiones' : 'Otro',
                'Residencia' : 'Residencia',
                'Administración' : 'Administración',
                'Hotel Clínico' : 'Hotel Clínico',
            }
            '''
            area_map={
                'Todos' : 'Todos',
                'administrador' : 'Administradores',
                'auxiliar' : 'Auxiliares',
                'coordinador' : 'Coordinadores',
                'cuidador' : 'Cuidadores',
                'cuidadora' : 'Cuidadores',
                'enfermero' : 'Enfermeros',
                'fonoaudiologos'
                'tens' : 'TENS'
            }
            '''

            coordinadores_set=[]

            #for archivo in archivos:
            df = pd.read_excel(archivos)  # Leer el archivo
            columnas1 = ['Profesional', 'RUT', 'vac.', 'lic', 'Fecha Ingreso', 'Fecha Salida',
                         'valor hora', 'Horas cont.', 'Horas obj.', 'Horas trab.',
                         'turnos trab.', 'horas extra', 'Bono Colación', 'Bono mov.',
                         'Bono Respons.', 'Total']

            # MYRASALUD 65
            if 'bono' in df.columns:
                # df['asisteProfesional']=None
                df['horasTurno'] = None
                #print(df)
                rutsProfesionales = df['RUT'].unique()
                nombresPacientes = df['paciente'].unique()

                # REGISTRO COORDINADORES

                Coordinador.objects.all().delete()
                with connection.cursor() as cursor:
                    cursor.execute("ALTER TABLE api_coordinador AUTO_INCREMENT = 1;")

                Paciente.objects.all().delete()
                with connection.cursor() as cursor:
                    cursor.execute("ALTER TABLE api_paciente AUTO_INCREMENT = 1;")

                Asistencia.objects.all().delete()
                with connection.cursor() as cursor:
                    cursor.execute("ALTER TABLE api_asistencia AUTO_INCREMENT = 1;")

                coordinadores= df['Coordinadora'].unique()
                '''
                for coordinador in coordinadores:
                    if not df.loc[df['Coordinadora'] == coordinador].empty:
                        tupla3 = df.loc[df['Coordinadora'] == coordinador].iloc[0]
                        coordinadorNombre=tupla3['Coordinadora']
                        cargo_prefix='coor'
                        try:
                            idArea = Area.objects.get(nombreArea__startswith=cargo_prefix)
                        except Area.DoesNotExist:
                            # Si el área no se encuentra, devolvemos None
                            idArea = Area.objects.get(nombreArea='Otros')
                        coordinadorNuevo=Coordinador.objects.create(nombre=coordinadorNombre,idArea=idArea)
                        coordinadorNuevo.save()
                '''

                for coordinador in coordinadores:
                    cargo_prefix='coor'
                    try:
                        idArea = Area.objects.get(nombreArea__startswith=cargo_prefix)
                    except Area.DoesNotExist:
                        # Si el área no se encuentra, devolvemos None
                        idArea = Area.objects.get(nombreArea='Otros')
                    coordinadorNuevo=Coordinador.objects.create(nombre=coordinador,idArea=idArea)
                    coordinadorNuevo.save()

                # REGISTRO PROFESIONALES

                #print(df.columns)
                Profesional.objects.all().delete()
                with connection.cursor() as cursor:
                    cursor.execute("ALTER TABLE api_profesional AUTO_INCREMENT = 1;")

                for rut in rutsProfesionales:
                    if not df.loc[df['RUT'] == rut].empty:
                        tupla = df.loc[df['RUT'] == rut].iloc[0]
                        profesional = tupla['profesional']
                        profesional=profesional.replace('V2- ', '').replace('Nc- ', '')
                        #print('alo')
                        rut_profesional = tupla['RUT']
                        cargo_profesional = tupla['cargo']
                        contrato = tupla['contrato']
                        centro = tupla['centro']
                        coordinador = tupla['Coordinadora']
                        horas = tupla['horas']
                        suma = tupla['suma']
                        extra_rotativa = tupla['Extra rotativa']
                        turnos_extra = tupla['Turnos Extra']
                        bono = tupla['bono']
                        bono_festivo = tupla['Bono Festivo Irrenunciable']
                        colacion = tupla['Colación']
                        movilizacion = tupla['Movilización']
                        total = tupla['total']
                        #print('alo2')
                        cargo_prefix = cargo_profesional[:4].lower().capitalize()
                        #dupla=[coordinador, profesional.replace('V2- ', '').replace('Nc- ', '')]
                        #coordinadores_set.append(dupla)
                        #print('alo3')

                        # NORMALIZACIÓN DE DATOS
                        try:
                            idCargo = Cargo.objects.get(cargo__icontains=cargo_profesional)
                        except:
                            idCargo = Cargo(cargo=cargo_profesional)
                            idCargo.save()
                        #print('hola')

                        # Buscar el área en la base de datos que coincida con el prefijo
                        try:
                            idArea = Area.objects.get(nombreArea__startswith=cargo_prefix)
                        except Area.DoesNotExist:
                            # Si el área no se encuentra, devolvemos None
                            idArea = Area.objects.get(nombreArea='Otros')
                        #print('hola2')
                        if centro in centro_map:
                            centroProf = centro_map[centro]
                            idCentro = Centro.objects.get(nombreCentro=centroProf)
                        else:
                            hola = 1
                            idCentro = Centro.objects.get(nombreCentro='Otro')
                            # CENTRO NO ENCONTRADO
                        #print('hola3')

                        tipo_contrato = contrato_map[contrato]
                        idContrato = Contrato.objects.get(tipoContrato=tipo_contrato)
                        idCoordinador = Coordinador.objects.get(nombre=coordinador)
                        #print('hola4')
                        #print(profesional, rut_profesional, idCentro.id,idContrato.id,idCargo.id,idArea.id,idCoordinador.id)
                        #print('hola4.1')


                        try:
                            # Código para crear un profesional
                            profesionalAct = Profesional.objects.create(nombre=profesional, rut=rut_profesional,inasistencias=0,horasTotales=0,horasExtras=0,vacaciones=0,licencia=0,valorHora=0,horasCont=0,horasObj=0,turnosTrab=0,bonoColacion=0,bonoMov=0,bonoResp=0, idCentro=idCentro, idArea=idArea, idCargo=idCargo, idContrato=idContrato,idCoordinador=idCoordinador)
                        except IntegrityError as integrity_error:
                            print("Error de integridad:", integrity_error)
                        except ValidationError as validation_error:
                            print("Error de validación:", validation_error)
                        except Exception as error:
                            print("Error no esperado:", error)
                        #profesionalAct = Profesional.objects.create(nombre=profesional, rut=rut_profesional,inasistencias=0,horasTotales=0,horasExtras=0,vacaciones=0,licencia=0,valorHora=0,horasCont=0,horasObj=0,turnosTrab=0,bonoColacion=0,bonoMov=0,bonoResp=0, idCentro=idCentro, idArea=idArea, idCargo=idCargo, idContrato=idContrato,idCoordinador=idCoordinador)
                        #print("Hola4.2")
                        profesionalAct.save()



                # REGISTRO PACIENTES
                #print("Hola7")
                for nombre in nombresPacientes:
                    if not df.loc[df['paciente'] == nombre].empty:
                        tupla2 = df.loc[df['paciente'] == nombre].iloc[0]
                        #print("hola")
                        fecha = tupla2['Fecha']
                        cliente = tupla2['cliente']
                        region = tupla2['region']
                        paciente = tupla2['paciente']
                        coordinador = tupla2['Coordinadora']
                        try:
                            if region == 'Libertador General Bernardo O Higgins':
                                #print("ojito")
                                region='Libertador'
                                idRegion = Region.objects.get(nombreRegion__icontains=region)
                            else:
                                idRegion = Region.objects.get(nombreRegion__icontains=region)
                        except Region.DoesNotExist:
                            print("no existe region ",region)
                            # Manejar el caso cuando no se encuentra ninguna coincidencia
                        except Region.MultipleObjectsReturned:
                            print("muchas regiones")
                            # Manejar el caso cuando se encuentran múltiples coincidencias
                        #print("cliente")
                        try:
                            idCliente = Cliente.objects.get(nombreCliente__icontains=cliente)
                        except Cliente.DoesNotExist:
                            print("no existe cliente")
                            # Manejar el caso cuando no se encuentra ninguna coincidencia
                        except Cliente.MultipleObjectsReturned:
                            print("muchos clientes")
                            # Manejar el caso cuando se encuentran múltiples coincidencias
                        #idCliente = Cliente.objects.filter(nombreCliente__icontains=cliente)
                        #idRegion = Cliente.objects.filter(nombreRegion__icontains=region)

                        coordinadorAyuda = Coordinador.objects.get(nombre=coordinador)

                        # TURNO = HORAS MAS COMUN EN EL PACIENTE
                        #print("hola2")
                        tupla3 = df.loc[df['paciente'] == nombre]
                        columna_filtrada = tupla3[tupla3['horas'] > 0]['horas']
                        horas_turno = columna_filtrada.value_counts().idxmax()
                        df.loc[df['paciente'] == nombre, 'horasTurno'] = horas_turno
                        horas_turno = int(horas_turno)
                        #print("hola3 ",horas_turno)
                        tipo_turno_string=str(horas_turno)+" Hrs"
                        try:
                            #print("si entro")
                            idTipoTurno = TipoTurno.objects.get(tipoTurno=tipo_turno_string)
                            #print("y lo encontro")
                        except Exception as e:
                            #print("No lo encontró")
                            #print("Error en la base de datos: ",e)
                            idTipoTurno = TipoTurno.objects.get(tipoTurno='Otro')
                        #print("hola8")
                        try:
                            # Código para crear un profesional
                            #print("lo intenta")
                            pacienteAct = Paciente.objects.create(nombre=paciente, fechaInicioAtencion=None,
                                                                  vigente=None, gasto=0, idZona=None, idRegion=idRegion,
                                                                  idCliente=idCliente,
                                                                  idCoordinador=coordinadorAyuda,
                                                                  idTipoTurno=idTipoTurno)
                            #print("lo logra")
                        except IntegrityError as integrity_error:
                            print("Error de integridad:", integrity_error)
                        except ValidationError as validation_error:
                            print("Error de validación:", validation_error)
                        except Exception as error:
                            print("Error no esperado:", error)
                        #pacienteAct = Paciente.objects.create(nombre=paciente, fechaInicioAtencion=None, vigente=None, gasto=0, idZona=None, idRegion=idRegion, idCliente=idCliente,idCoordinador=coordinadorAyuda, idTipoTurno=idTipoTurno)
                        #print("hola")
                        pacienteAct.save()

                # CALCULO HORAS EXTRA CONTRATO NORMAL

                #print("si termino")
                for rut in rutsProfesionales:
                    tuplasProf = df.loc[df['RUT'] == rut]
                    horas_extra = 0
                    inasistencias = 0
                    for index, row in tuplasProf.iterrows():
                        fecha = row['Fecha']
                        cliente = row['cliente']
                        region = row['region']
                        paciente = row['paciente']
                        profesional = row['profesional']
                        rut_profesional = row['RUT']
                        cargo_profesional = row['cargo']
                        codigo_sis = row['Código SIS']
                        contrato = row['contrato']
                        centro = row['centro']
                        coordinador = row['Coordinadora']
                        horas = row['horas']
                        suma = row['suma']
                        extra_rotativa = row['Extra rotativa']
                        turnos_extra = row['Turnos Extra']
                        bono = row['bono']
                        bono_festivo = row['Bono Festivo Irrenunciable']
                        colacion = row['Colación']
                        movilizacion = row['Movilización']
                        total = row['total']
                        if contrato == 'contrato' and turnos_extra > 0:
                            horas_extra = horas_extra + horas
                        if horas > -100 and horas < -24:
                            inasistencias = inasistencias + 1
                    profesionalAct = Profesional.objects.get(rut=rut)
                    profesionalAct.horasExtras = horas_extra
                    profesionalAct.inasistencias = inasistencias
                    profesionalAct.save()
                #print("si")

                for index, row in df.iterrows():
                    fecha = row['Fecha']
                    cliente = row['cliente']
                    region = row['region']
                    paciente = row['paciente']
                    profesional = row['profesional']
                    rut_profesional = row['RUT']
                    cargo_profesional = row['cargo']
                    codigo_sis = row['Código SIS']
                    contrato = row['contrato']
                    centro = row['centro']
                    coordinador = row['Coordinadora']
                    horas = row['horas']
                    suma = row['suma']
                    extra_rotativa = row['Extra rotativa']
                    turnos_extra = row['Turnos Extra']
                    bono = row['bono']
                    bono_festivo = row['Bono Festivo Irrenunciable']
                    colacion = row['Colación']
                    movilizacion = row['Movilización']
                    horasTurno = row['horasTurno']
                    total = row['total']
                    # Realizar acciones con los datos obtenidos
                    #print(horas)
                    if horas > 0:
                        asisteProfesional = True
                        estado = 1
                    elif horas < 0 and horas + horasTurno > 0:
                        asisteProfesional = True
                        estado = 1
                    elif horas == 0 or math.isnan(horas):
                        horas=0
                        asisteProfesional = False
                        estado = 0
                    elif horas > -100:
                        asisteProfesional = False
                        estado = 0
                    else:
                        asisteProfesional = False
                        estado = 2
                    profesionalAct = Profesional.objects.get(rut=rut_profesional)
                    pacienteAct = Paciente.objects.get(nombre=paciente)
                    try:
                        #print("se intenta")
                        asistencia = Asistencia.objects.create(fechaAsistencia=fecha, asisteProfesional=asisteProfesional, estado=estado,
                                            horas=horas, movilizacion=movilizacion, colacion=colacion,
                                            idProfesional=profesionalAct, idPaciente=pacienteAct)
                        #print("registrada")
                    except Exception as error:
                        print(asisteProfesional,estado,horas,movilizacion,colacion)
                        print("Error no esperado:", error)
                    asistencia.save()



            # MYRASALUD 66
            elif all(col in df.columns for col in columnas1):
                #print("si")
                for index, row in df.iterrows():
                    nombre_profesional = row['Profesional']
                    rut = row['RUT']
                    vacaciones = row['vac.']
                    licencias = row['lic']
                    fecha_ingreso = row['Fecha Ingreso']
                    fecha_salida = row['Fecha Salida']
                    valor_hora = row['valor hora']
                    horas_contrato = row['Horas cont.']
                    horas_objetivo = row['Horas obj.']
                    horas_trabajadas = row['Horas trab.']
                    turnos_trabajados = row['turnos trab.']
                    horas_extra = row['horas extra']
                    bono_colacion = row['Bono Colación']
                    bono_movilizacion = row['Bono mov.']
                    bono_responsabilidad = row['Bono Respons.']
                    total = row['Total']
                    #print("si2")
                    contrato=''
                    if math.isnan(vacaciones):
                        vacaciones=0
                        horas_trabajadas=0
                        turnos_trabajados=0
                        licencias=0

                    if nombre_profesional !=nombre_profesional.replace('V2- ', ''):
                        nombre_profesional=nombre_profesional.replace('V2- ', '')
                        tipo_contrato='contrato v2'
                        contrato = contrato_map[tipo_contrato]
                    elif nombre_profesional != nombre_profesional.replace('Nc- ', ''):
                        nombre_profesional=nombre_profesional.replace('Nc- ', '')
                        tipo_contrato='contrato NC'
                        contrato = contrato_map[tipo_contrato]

                    if contrato !='':
                        idContrato = Contrato.objects.get(tipoContrato=contrato)
                    else:
                        idContrato=None



                    # Realizar acciones con los datos obtenidos
                    try:
                        profesional = Profesional.objects.get(rut=rut)
                    except Profesional.DoesNotExist:
                        #print("no existe")
                        try:
                            profesional = Profesional.objects.create(nombre=nombre_profesional, rut=rut,
                                                                    inasistencias=0, horasTotales=0, horasExtras=0,
                                                                    vacaciones=0, licencia=0, valorHora=0, horasCont=0,
                                                                    horasObj=0, turnosTrab=0, bonoColacion=0, bonoMov=0,
                                                                    bonoResp=0, idCentro=None, idArea=None,
                                                                    idCargo=None, idContrato=idContrato,
                                                                    idCoordinador=None)
                            #print("creado")
                        except Exception as error:
                            print("Error no esperado:", error)
                    except Exception as error:
                        print("Error no esperado:", error)

                    profesional.horasTotales = horas_trabajadas
                    profesional.horasCont = horas_contrato
                    profesional.horasObj = horas_objetivo
                    profesional.bonoMov = bono_movilizacion
                    profesional.bonoResp = bono_responsabilidad
                    profesional.bonoColacion = bono_colacion
                    profesional.turnosTrab = turnos_trabajados
                    #print("hola2")
                    try:
                        tipoContrato=profesional.idContrato.tipoContrato
                    except Exception as error:
                        #print("Error no esperado:", error)
                        tipoContrato=None

                    if tipoContrato != 'contrato' or tipoContrato is None:
                        profesional.horasExtras = horas_extra
                    profesional.vacaciones = vacaciones
                    profesional.licencia = licencias
                    #print("hola3")
                    ''''
                    profesional = Profesional(
                        nombre=nombre_profesional,
                        rut=rut,
                        licencias=licencias,
                        horasExtra=horas_extra,
                        horasTotales=horas_objetivo,
                        vacaciones=vacaciones
                    )
                    '''
                    try:
                        profesional.save()
                    except Exception as error:
                        print("Error no esperado:", error)
            datos = {'message': 'success'}
            return JsonResponse(datos, status=status.HTTP_201_CREATED)
        except:
            datos = {'message': 'fail'}
            return JsonResponse(datos, status=status.HTTP_409_CONFLICT)

class ReporteProfesionalView(View):
    @method_decorator(csrf_exempt)
    def dispatch(self, request: HttpRequest, *args: Any, **kwargs: Any) -> HttpResponse:
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, id_profesional):
        try:
            profesional = list(Profesional.objects.filter(
                id=id_profesional).values())
            datos = {'message': 'success', 'data': profesional}
            return JsonResponse(datos, status=200)
        except Profesional.DoesNotExist or not (id_profesional.isdigit()) or id_profesional <= 0:
            datos = {'message': 'fail'}
            return JsonResponse(datos, status=404)


#############################################################################################
#############################################################################################
#############################################################################################

# USUARIO

class UserRegister(APIView):
    """
    An endpoint for the client to create a new User.
    """
    permission_classes = [AllowAny,]

    def post(self, request):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            data = serializer.data
            return Response(data, status=status.HTTP_201_CREATED)
        except Exception as error:
            data = {'Error': str(error)}
            return Response(data, status=status.HTTP_400_BAD_REQUEST)

#UserLogin está cubierto por la clase de JWT que genera los tokens

class UserLogout(APIView):
    """
    An endpoint to logout users.
    """
    authentication_classes = [JWTAuthentication,]
    permission_classes = [IsAuthenticated,]

    def post(self, request):
        try:
            print("Request user: ")
            print(request.user)
            refresh_token = request.data["refresh"]
            print(refresh_token)
            token = RefreshToken(refresh_token)
            print("Token a mandar a blacklist:", token)
            token.blacklist()
            #logout(request)
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as error:
            data = {'Error': str(error)}
            return Response(data, status=status.HTTP_400_BAD_REQUEST)

class UserView(APIView): #En desuso temporalmente
    """
    Get user information
    """
    permission_classes = [IsAuthenticatedOrReadOnly]
    authentication_classes = [JWTAuthentication,]
    #serializer_class = serializers.CustomUserSerializer

    def get(self, request):
        try:
            print(request)
            #print(request.data)
            print(request.user)
            serializer = UserSerializer(request.user)
            return Response({'user': serializer.data}, status=status.HTTP_200_OK)
        except Exception as error:
            data = {'Error': str(error),'user': 'No hay sesión iniciada'}
            return Response(data, status=status.HTTP_404_NOT_FOUND)
