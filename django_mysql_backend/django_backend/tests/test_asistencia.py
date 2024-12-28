import json

from django.test import TestCase
from api.models import *
from api.views import *
from django.urls import reverse
import datetime

class AsistenciaTestView(TestCase):
    @classmethod
    def setUpTestData(cls):
        Zona.objects.create(nombreZona='Zona 1')
        Region.objects.create(nombreRegion='Region 1')
        Cliente.objects.create(nombreCliente='Cliente 1')
        Centro.objects.create(nombreCentro='Centro 1')
        Area.objects.create(nombreArea='Area 2')
        Cargo.objects.create(cargo='Cargo 1')
        Cargo.objects.create(cargo='Cargo 2')
        Contrato.objects.create(tipoContrato='contrato 1')
        Coordinador.objects.create(nombre='Coordinador ejemplo 1', rut='10111111-1', idCargo=Cargo.objects.get(id=2),
                                   idCentro=Centro.objects.get(id=1))
        Profesional.objects.create(nombre='Nombre Ejemplo', rut='20237081-0', inasistencias=0,
                                   horasTotales=280, horasExtras=0, vacaciones=0, licencia=0,
                                   idCentro=Centro.objects.get(id=1),
                                   idArea=Area.objects.get(id=2), idCargo=Cargo.objects.get(id=1),
                                   idContrato=Contrato.objects.get(id=1),
                                   idCoordinador=Coordinador.objects.get(id=1))
        Paciente.objects.create(nombre='Paciente 1', rut='20222333-1', tipoTurno="24", fechaInicioAtencion="2023-02-01",
                                vigente=True, idZona=Zona.objects.get(id=1), idRegion=Region.objects.get(id=1),
                                idCliente=Cliente.objects.get(id=1))
        Turno.objects.create(fechaInicio="2023-03-02", fechaTermino="2023-03-04", horas=24, idPaciente=Paciente.objects.get(id=1),
                             idProfesional=Profesional.objects.get(id=1))
        Asistencia.objects.create(fechaAsistencia="2023-03-02", asisteProfesional=True, estado=1, idProfesional=Profesional.objects.get(id=1),
                                  idPaciente=Paciente.objects.get(id=1), idTurno=Turno.objects.get(id=1))

    def test_url_exists(self):
        resp = self.client.get('/api/asistencia/')
        self.assertEqual(resp.status_code, 200)

    def test_get_id_true(self):
        resp = self.client.get('/api/asistencia/1')
        self.assertEqual(resp.status_code, 200)

    def test_get_id_false(self):
        resp = self.client.get('/api/asistencia/2')
        self.assertEqual(resp.status_code, 200)

    def test_get(self):
        self.assertEqual(Asistencia.objects.get(id=1).fechaAsistencia, datetime.date(2023,3,2))

    def test_get_false(self):
        self.assertNotEquals(Asistencia.objects.get(id=1).fechaAsistencia, datetime.date(2023,3,3))

    def test_put(self):
        print(Asistencia.objects.all())
        resp = self.client.put('/api/asistencia/2',json.dumps({'fechaAsistencia': "2023-04-03",
                                                                'asisteProfesional': True, 'estado': 1, 'idProfesional': 1,
                                                                'idPaciente': 1, 'idTurno': 1}))
        self.assertEqual(resp.status_code, 200)

    def test_delete(self):
        resp = self.client.delete('/api/asistencia/1')
        self.assertEqual(resp.status_code, 200)

    def test_delete_false(self):
        resp = self.client.delete('/api/asistencia/10')
        self.assertEqual(resp.status_code, 200)

