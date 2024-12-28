import json

from django.test import TestCase
from api.models import *
from api.views import *
from django.urls import reverse
import datetime

class TurnoTestView(TestCase):
    @classmethod
    def setUpTestData(cls):
        Zona.objects.create(nombreZona='Zona 3')
        Region.objects.create(nombreRegion='Region 4')
        Cliente.objects.create(nombreCliente='Cliente 4')
        Centro.objects.create(nombreCentro='Centro 6')
        Area.objects.create(nombreArea='Area 5')
        Cargo.objects.create(cargo='Cargo 8')
        Cargo.objects.create(cargo='Cargo 9')
        Contrato.objects.create(tipoContrato='contrato 5')
        Coordinador.objects.create(nombre='Coordinador ejemplo turno', rut='12111111-1', idCargo=Cargo.objects.get(id=9),
                                   idCentro=Centro.objects.get(id=6))
        Profesional.objects.create(nombre='Nombre Ejemplo', rut='24237081-0', inasistencias=0,
                                   horasTotales=280, horasExtras=0, vacaciones=0, licencia=0,
                                   idCentro=Centro.objects.get(id=6),
                                   idArea=Area.objects.get(id=5), idCargo=Cargo.objects.get(id=10),
                                   idContrato=Contrato.objects.get(id=5),
                                   idCoordinador=Coordinador.objects.get(id=5))
        Paciente.objects.create(nombre='Paciente 3', rut='27222333-1', tipoTurno="24", fechaInicioAtencion="2023-02-01",
                                vigente=True, idZona=Zona.objects.get(id=3), idRegion=Region.objects.get(id=4),
                                idCliente=Cliente.objects.get(id=4))
        Turno.objects.create(fechaInicio="2023-03-02", fechaTermino="2023-03-04", horas=24, idPaciente=Paciente.objects.get(id=3),
                             idProfesional=Profesional.objects.get(id=4))

    def test_url_exists(self):
        resp = self.client.get('/api/turno/')
        self.assertEqual(resp.status_code, 200)

    def test_get_id_true(self):
        resp = self.client.get('/api/turno/1')
        self.assertEqual(resp.status_code, 200)

    def test_get_id_false(self):
        resp = self.client.get('/api/turno/2')
        self.assertEqual(resp.status_code, 200)

    def test_get(self):
        self.assertEqual(Turno.objects.get(id=2).fechaInicio, datetime.date(2023,3,2))

    def test_get_false(self):
        self.assertNotEquals(Turno.objects.get(id=2).fechaInicio, datetime.date(2023,3,3))

    def test_put(self):
        print(Turno.objects.all())
        resp = self.client.put('/api/turno/3',json.dumps({'fechaInicio': "2023-04-03",'fechaTermino': "2023-04-05",
                                                                'horas': 24,'idPaciente': 4, 'idProfesional': 4}))
        self.assertEqual(resp.status_code, 200)

    def test_delete(self):
        resp = self.client.delete('/api/turno/1')
        self.assertEqual(resp.status_code, 200)

    def test_delete_false(self):
        resp = self.client.delete('/api/turno/10')
        self.assertEqual(resp.status_code, 200)

