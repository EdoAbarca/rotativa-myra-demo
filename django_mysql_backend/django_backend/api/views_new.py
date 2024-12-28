from .models import *
from json import dumps, loads
import pandas as pd
from django.db.models import Q
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import *
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication

#############################################################################################
#############################################################################################
#############################################################################################

# CRUD

class CargoView(APIView):
    permission_classes=[IsAdminUser]
    def post(self, request):
        serializer = CargoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def get(self, request, id=0):
        if(not(id.isdigit())):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        if (id > 0):
            cargo = Cargo.objects.get(id=id)
            serializer = CargoSerializer(cargo)
            return Response(serializer.data, status=status.HTTP_200_OK)
        elif (id == 0):
            cargos = Cargo.objects.all()
            serializer = CargoSerializer(cargos, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(status=status.HTTP_501_NOT_IMPLEMENTED)
        
    def put(self, request, id):
        if (not(id.isdigit())):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        cargo = Cargo.objects.get(id=id)
        if (cargo is None):
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = CargoSerializer(cargo, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, id):
        if (not(id.isdigit())):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        cargo = Cargo.objects.get(id=id)
        if (cargo is None):
            return Response(status=status.HTTP_404_NOT_FOUND)
        cargo.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class ContratoView(APIView):
    permission_classes=[IsAdminUser]
    def post(self, request):
        serializer = ContratoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def get(self, request, id=0):
        if(not(id.isdigit())):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        if (id > 0):
            contrato = Contrato.objects.get(id=id)
            serializer = ContratoSerializer(contrato)
            return Response(serializer.data, status=status.HTTP_200_OK)
        elif (id == 0):
            contratos = Contrato.objects.all()
            serializer = ContratoSerializer(contratos, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(status=status.HTTP_501_NOT_IMPLEMENTED)
        
    def put(self, request, id):
        if (not(id.isdigit())):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        contrato = Contrato.objects.get(id=id)
        if (contrato is None):
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = ContratoSerializer(contrato, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, id):
        if (not(id.isdigit())):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        contrato = Contrato.objects.get(id=id)
        if (contrato is None):
            return Response(status=status.HTTP_404_NOT_FOUND)
        contrato.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class CentroView(APIView):
    permission_classes=[IsAdminUser]
    def post(self, request):
        serializer = CentroSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def get(self, request, id=0):
        if(not(id.isdigit())):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        if (id > 0):
            centro = Centro.objects.get(id=id)
            serializer = CentroSerializer(centro)
            return Response(serializer.data, status=status.HTTP_200_OK)
        elif (id == 0):
            centros = Centro.objects.all()
            serializer = CentroSerializer(centros, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(status=status.HTTP_501_NOT_IMPLEMENTED)
        
    def put(self, request, id):
        if (not(id.isdigit())):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        centro = Centro.objects.get(id=id)
        if (centro is None):
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = CentroSerializer(centro, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, id):
        if (not(id.isdigit())):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        centro = Centro.objects.get(id=id)
        if (centro is None):
            return Response(status=status.HTTP_404_NOT_FOUND)
        centro.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class CoordinadorView(APIView):
    permission_classes=[IsAdminUser]
    def post(self, request):
        serializer = CoordinadorSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def get(self, request, id=0):
        if(not(id.isdigit())):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        if (id > 0):
            coordinador = Coordinador.objects.get(id=id)
            serializer = CoordinadorSerializer(coordinador)
            return Response(serializer.data, status=status.HTTP_200_OK)
        elif (id == 0):
            coordinadores = Coordinador.objects.all()
            serializer = CoordinadorSerializer(coordinadores, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(status=status.HTTP_501_NOT_IMPLEMENTED)
        
    def put(self, request, id):
        if (not(id.isdigit())):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        coordinador = Coordinador.objects.get(id=id)
        if (coordinador is None):
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = CoordinadorSerializer(coordinador, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, id):
        if (not(id.isdigit())):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        coordinador = Coordinador.objects.get(id=id)
        if (coordinador is None):
            return Response(status=status.HTTP_404_NOT_FOUND)
        coordinador.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class AreaView(APIView):
    permission_classes=[IsAdminUser]
    def post(self, request):
        serializer = AreaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def get(self, request, id=0):
        if(not(id.isdigit())):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        if (id > 0):
            area = Area.objects.get(id=id)
            serializer = AreaSerializer(area)
            return Response(serializer.data, status=status.HTTP_200_OK)
        elif (id == 0):
            areas = Area.objects.all()
            serializer = AreaSerializer(areas, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(status=status.HTTP_501_NOT_IMPLEMENTED)
        
    def put(self, request, id):
        if (not(id.isdigit())):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        area = Area.objects.get(id=id)
        if (area is None):
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = AreaSerializer(area, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, id):
        if (not(id.isdigit())):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        area = Area.objects.get(id=id)
        if (area is None):
            return Response(status=status.HTTP_404_NOT_FOUND)
        area.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
        pass

class ProfesionalView(APIView):
    permission_classes=[IsAdminUser]
    def post(self, request):
        serializer = ProfesionalSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def get(self, request, id=0):
        if(not(id.isdigit())):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        if (id > 0):
            profesional = Profesional.objects.get(id=id)
            serializer = ProfesionalSerializer(profesional)
            return Response(serializer.data, status=status.HTTP_200_OK)
        elif (id == 0):
            profesionales = Profesional.objects.all()
            serializer = ProfesionalSerializer(profesionales, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(status=status.HTTP_501_NOT_IMPLEMENTED)
        
    def put(self, request, id):
        if (not(id.isdigit())):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        profesional = Profesional.objects.get(id=id)
        if (profesional is None):
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = ProfesionalSerializer(profesional, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, id):
        if (not(id.isdigit())):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        profesional = Profesional.objects.get(id=id)
        if (profesional is None):
            return Response(status=status.HTTP_404_NOT_FOUND)
        profesional.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class PagoView(APIView):
    permission_classes=[IsAdminUser]
    def post(self, request):
        serializer = PagoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def get(self, request, id=0):
        if(not(id.isdigit())):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        if (id > 0):
            pago = Pago.objects.get(id=id)
            serializer = PagoSerializer(pago)
            return Response(serializer.data, status=status.HTTP_200_OK)
        elif (id == 0):
            pagos = Pago.objects.all()
            serializer = PagoSerializer(pagos, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(status=status.HTTP_501_NOT_IMPLEMENTED)
        
    def put(self, request, id):
        if (not(id.isdigit())):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        pago = Pago.objects.get(id=id)
        if (pago is None):
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = PagoSerializer(pago, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, id):
        if (not(id.isdigit())):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        pago = Pago.objects.get(id=id)
        if (pago is None):
            return Response(status=status.HTTP_404_NOT_FOUND)
        pago.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class RegionView(APIView):
    permission_classes=[IsAdminUser]
    def post(self, request):
        serializer = RegionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def get(self, request, id=0):
        if(not(id.isdigit())):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        if (id > 0):
            region = Region.objects.get(id=id)
            serializer = RegionSerializer(region)
            return Response(serializer.data, status=status.HTTP_200_OK)
        elif (id == 0):
            regiones = Region.objects.all()
            serializer = RegionSerializer(regiones, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(status=status.HTTP_501_NOT_IMPLEMENTED)
        
    def put(self, request, id):
        if (not(id.isdigit())):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        region = Region.objects.get(id=id)
        if (region is None):
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = RegionSerializer(region, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, id):
        if (not(id.isdigit())):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        region = Region.objects.get(id=id)
        if (region is None):
            return Response(status=status.HTTP_404_NOT_FOUND)
        region.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class ZonaView(APIView):
    permission_classes=[IsAdminUser]
    def post(self, request):
        serializer = ZonaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def get(self, request, id=0):
        if(not(id.isdigit())):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        if (id > 0):
            zona = Zona.objects.get(id=id)
            serializer = ZonaSerializer(zona)
            return Response(serializer.data, status=status.HTTP_200_OK)
        elif (id == 0):
            zonas = Zona.objects.all()
            serializer = ZonaSerializer(zonas, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(status=status.HTTP_501_NOT_IMPLEMENTED)
        
    def put(self, request, id):
        if (not(id.isdigit())):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        zona = Zona.objects.get(id=id)
        if (zona is None):
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = ZonaSerializer(zona, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, id):
        if (not(id.isdigit())):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        zona = Zona.objects.get(id=id)
        if (zona is None):
            return Response(status=status.HTTP_404_NOT_FOUND)
        zona.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class TipoTurnoView(APIView):
    permission_classes=[IsAdminUser]
    def post(self, request):
        serializer = TipoTurnoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def get(self, request, id=0):
        if(not(id.isdigit())):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        if (id > 0):
            tipoturno = TipoTurno.objects.get(id=id)
            serializer = TipoTurnoSerializer(tipoturno)
            return Response(serializer.data, status=status.HTTP_200_OK)
        elif (id == 0):
            tipoturnos = TipoTurno.objects.all()
            serializer = TipoTurnoSerializer(tipoturnos, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(status=status.HTTP_501_NOT_IMPLEMENTED)
        
    def put(self, request, id):
        if (not(id.isdigit())):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        tipoturno = TipoTurno.objects.get(id=id)
        if (tipoturno is None):
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = TipoTurnoSerializer(tipoturno, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, id):
        if (not(id.isdigit())):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        tipoturno = TipoTurno.objects.get(id=id)
        if (tipoturno is None):
            return Response(status=status.HTTP_404_NOT_FOUND)
        tipoturno.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class PacienteView(APIView):
    permission_classes=[IsAdminUser]
    def post(self, request):
        serializer = PacienteSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def get(self, request, id=0):
        if(not(id.isdigit())):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        if (id > 0):
            paciente = Paciente.objects.get(id=id)
            serializer = PacienteSerializer(paciente)
            return Response(serializer.data, status=status.HTTP_200_OK)
        elif (id == 0):
            pacientes = Paciente.objects.all()
            serializer = PacienteSerializer(pacientes, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(status=status.HTTP_501_NOT_IMPLEMENTED)
        
    def put(self, request, id):
        if (not(id.isdigit())):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        paciente = Paciente.objects.get(id=id)
        if (paciente is None):
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = PacienteSerializer(paciente, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, id):
        if (not(id.isdigit())):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        paciente = Paciente.objects.get(id=id)
        if (paciente is None):
            return Response(status=status.HTTP_404_NOT_FOUND)
        paciente.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class TurnoView(APIView):
    permission_classes=[IsAdminUser]
    def post(self, request):
        serializer = TurnoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def get(self, request, id=0):
        if(not(id.isdigit())):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        if (id > 0):
            turno = Turno.objects.get(id=id)
            serializer = TurnoSerializer(turno)
            return Response(serializer.data, status=status.HTTP_200_OK)
        elif (id == 0):
            turnos = Turno.objects.all()
            serializer = TurnoSerializer(turnos, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(status=status.HTTP_501_NOT_IMPLEMENTED)
        
    def put(self, request, id):
        if (not(id.isdigit())):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        turno = Turno.objects.get(id=id)
        if (turno is None):
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = TurnoSerializer(turno, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, id):
        if (not(id.isdigit())):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        turno = Turno.objects.get(id=id)
        if (turno is None):
            return Response(status=status.HTTP_404_NOT_FOUND)
        turno.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class AsistenciaView(APIView):
    permission_classes=[IsAdminUser]
    def post(self, request):
        serializer = AsistenciaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def get(self, request, id=0):
        if(not(id.isdigit())):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        if (id > 0):
            asistencia = Asistencia.objects.get(id=id)
            serializer = AsistenciaSerializer(asistencia)
            return Response(serializer.data, status=status.HTTP_200_OK)
        elif (id == 0):
            asistencias = Asistencia.objects.all()
            serializer = AsistenciaSerializer(asistencias, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(status=status.HTTP_501_NOT_IMPLEMENTED)
        
    def put(self, request, id):
        if (not(id.isdigit())):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        asistencia = Asistencia.objects.get(id=id)
        if (asistencia is None):
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = AsistenciaSerializer(asistencia, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, id):
        if (not(id.isdigit())):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        asistencia = Asistencia.objects.get(id=id)
        if (asistencia is None):
            return Response(status=status.HTTP_404_NOT_FOUND)
        asistencia.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class AlertaView(APIView):
    permission_classes=[IsAdminUser]
    def post(self, request):
        serializer = AlertaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def get(self, request, id=0):
        if(not(id.isdigit())):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        if (id > 0):
            alerta = Alerta.objects.get(id=id)
            serializer = AlertaSerializer(alerta)
            return Response(serializer.data, status=status.HTTP_200_OK)
        elif (id == 0):
            alertas = Alerta.objects.all()
            serializer = AlertaSerializer(alertas, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(status=status.HTTP_501_NOT_IMPLEMENTED)
        
    def put(self, request, id):
        if (not(id.isdigit())):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        alerta = Alerta.objects.get(id=id)
        if (alerta is None):
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = AlertaSerializer(alerta, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, id):
        if (not(id.isdigit())):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        alerta = Alerta.objects.get(id=id)
        if (alerta is None):
            return Response(status=status.HTTP_404_NOT_FOUND)
        alerta.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

#############################################################################################
#############################################################################################
#############################################################################################

# FUNCIONALIDADES

class SearchView(APIView):
    permission_classes=[IsAuthenticated]
    def get(self, request):
        query = request.GET.get('query', '')
        profesionales = Profesional.objects.filter(
            Q(nombre__icontains=query) | Q(rut__icontains=query)
        ).values()

        if profesionales.exists:
            datos = {'message': 'Success',
                     'profesionales': list(profesionales)}
            return Response(datos, status=status.HTTP_200_OK)
        else:
            datos = {'message': 'No se encontraron coincidencias'}
            return Response(datos, status=status.HTTP_404_NOT_FOUND)


class FilterAreaView(APIView):
    permission_classes=[IsAuthenticated]
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
        return Response(datos, status=status.HTTP_200_OK)


class FilterCenterView(APIView):
    permission_classes=[IsAuthenticated]
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
        return Response(datos)


class SearchPacienteView(APIView):
    permission_classes=[IsAuthenticated]

    def get(self, request):
        query = request.GET.get('query', '')
        pacientes = Paciente.objects.filter(
            Q(nombre__icontains=query) | Q(rut__icontains=query)
        ).values()

        if pacientes.exists:
            datos = {'message': 'Success', 'pacientes': list(pacientes)}
            return Response(datos, status=status.HTTP_200_OK)
        else:
            datos = {'message': 'No se encontraron coincidencias'}
            return Response(datos, status=status.HTTP_404_NOT_FOUND)


class FilterTipoClienteView(APIView):
    permission_classes=[IsAuthenticated]

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
        return Response(datos, status=status.HTTP_200_OK)


class FilterTipoTurnoView(APIView):
    permission_classes=[IsAuthenticated]
    def get(self, request, id_turno=0):
        pacientes = Paciente.objects.filter(idTurno_id=id_turno)

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
        return Response(datos, status=status.HTTP_200_OK)


class CargaExcelView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes=[IsAuthenticated]
    
    def post(self, request):
        try:
            title = request.POST.get('title')
            print(title)
            date = request.POST.get('date')
            print(date)
            file = request.FILES['excel']
            print(file.name)
            df = pd.read_excel(file, sheet_name=2)
            # df = pd.read_excel(file)
            print(df)
            for row in df.iloc[4:].head(100).itertuples(index=True, name=None):
                print(row)
                #print(row[0])
                #print(row[1])
            datos = {'message': 'success'}
            return Response(datos, status=status.HTTP_201_CREATED)
        except:
            datos = {'message': 'fail'}
            return Response(datos, status=status.HTTP_409_CONFLICT)

#A rescatar desde el CRUD

class ProfesionalGestionView(APIView):
    permission_classes=[IsAuthenticated]
    def get(self, request, id=0):
        if (id > 0):
            try:
                profesional = Profesional.objects.get(id=id)
            except Profesional.DoesNotExist:
                datos = {'message': 'Profesional no encontrado'}
                return Response(datos, status=status.HTTP_404_NOT_FOUND)

            
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
                'idCentro_id': profesional.idCentro.id,
                'idArea_id': profesional.idArea.id,
                'idCargo_id': profesional.idCargo.id,
                'idContrato_id': profesional.idContrato.id,
                'tipoContrato': profesional.idContrato.tipoContrato,
                'idCoordinador_id': profesional.idCoordinador.id,
                'nombreCoordinador': profesional.idCoordinador.nombre,
                'asistencias': [
                    {'id': asistencia.id, 'fechaAsistencia': asistencia.fechaAsistencia, 'asisteProfesional': asistencia.asisteProfesional,
                     'estado': asistencia.estado, 'nombrePaciente': asistencia.idPaciente.nombre,
                     'idTurno_id': asistencia.idTurno.id} for asistencia in asistencias],
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
            return Response(datos, status=status.HTTP_200_OK)
        else:
            profesionales = list(Profesional.objects.values())
            if len(profesionales) > 0:
                datos = {'message': "Success", 'profesionales': profesionales}
                return Response(datos, status=status.HTTP_200_OK)
            else:
                datos = {'message': "Sin profesionales."}
                return Response(datos, status=status.HTTP_404_NOT_FOUND)

class PacienteGestionView(APIView):
    permission_classes=[IsAuthenticated]
    def get(self, request, id=0):
        if (id > 0):
            try:
                paciente = Paciente.objects.get(id=id)
            except Paciente.DoesNotExist:
                datos = {'message': 'Profesional no encontrado'}
                return Response(datos, status=status.HTTP_404_NOT_FOUND)

            datos_asistencias = []
            asistencias = Asistencia.objects.filter(idPaciente_id=id)
            for asistencia in asistencias:
                datos_asistencia = {
                    'id': asistencia.id,
                    'fechaAsistencia': asistencia.fechaAsistencia,
                    'asisteProfesional': asistencia.asisteProfesional,
                    'estado': asistencia.estado,
                    'idTurno_id': asistencia.idTurno.id,
                    'nombreProfesional': asistencia.idProfesional.nombre,
                    'rutProfesional': asistencia.idProfesional.rut,
                    'idArea_id': asistencia.idProfesional.idArea.id
                }
                datos_asistencias.append(datos_asistencia)

            datos_paciente = {
                'nombre': paciente.nombre,
                'tipoTurno': paciente.idTipoTurno.tipoTurno,
                'fechaInicioAtencion': paciente.fechaInicioAtencion,
                'vigente': paciente.vigente,
                'gasto': paciente.gasto,
                'idZona_id': paciente.idZona.id,
                'idRegion_id': paciente.idRegion.id,
                'idCliente_id': paciente.idCliente.id,
                'idTipoTurno_id': paciente.idTipoTurno.id,
                'asistencias': datos_asistencias,
                'zona': paciente.idZona.nombreZona,
                'region': paciente.idRegion.nombreRegion
            }

            datos = {'message': 'Success', 'paciente': datos_paciente}
            return Response(datos, status=status.HTTP_200_OK)
        else:
            pacientes = list(Paciente.objects.values())
            if len(pacientes) > 0:
                datos = {'message': "Success", 'pacientes': pacientes}
                return Response(datos, status=status.HTTP_200_OK)
            else:
                datos = {'message': "Sin pacientes."}
                return Response(datos, status=status.HTTP_404_NOT_FOUND)

class CoordinadorGestionView(APIView):
    permission_classes=[IsAuthenticated]
    def get(self, request):
        pass

class AlertaGestionView(APIView):
    permission_classes=[IsAuthenticated]
    def get(self, request):
        pass

#############################################################################################
#############################################################################################
#############################################################################################

# USUARIO

class UserRegister(APIView):
    """
    An endpoint for the client to create a new User.
    """
    permission_classes = [AllowAny,]
    #permission_classes = [IsAuthenticated,]

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

class UpdatePasswordView(APIView):
    permission_classes = [IsAdminUser,]
    def put(self, request):
        try:
            print(request.data) #Nueva contraseña
            new_password = request.data['password']
            print(new_password)
            print(request.user) #Usuario que hace la petición (probar para ver qué campo en específico tiene el id de usuario)
            user_request = request.user
            #username = user_list[0]+" "+user_list[1]+" "+user_list[2]
            #user = User.objects.get(username=user_request)
            #print(user)
            #user.set_password(request.data['password'])
            #user.save()
            return Response(status=status.HTTP_200_OK)
        except Exception as error:
            data = {'Error': str(error)}
            return Response(data, status=status.HTTP_400_BAD_REQUEST)