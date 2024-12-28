import json

from django.test import TestCase
from api.models import *
from api.views import *
from django.urls import reverse
import datetime

class ProfesionalTestView(TestCase):
    @classmethod
    def setUpTestData(cls):
        Centro.objects.create(nombreCentro='Centro 5')
        Area.objects.create(nombreArea='Area 4')
        Cargo.objects.create(cargo='Cargo 6')
        Cargo.objects.create(cargo='Cargo 7')
        Contrato.objects.create(tipoContrato='Contrato 4')
        Coordinador.objects.create(nombre='Coordinador ejemplo', rut='20111111-1', idCargo=Cargo.objects.get(id=8),
                                   idCentro=Centro.objects.get(id=5))
        Profesional.objects.create(nombre='Nombre Ejemplo', rut='20237081-0', inasistencias=0,
                                   horasTotales=280, horasExtras=0, vacaciones=0, licencia=0,
                                   idCentro=Centro.objects.get(id=5),
                                   idArea=Area.objects.get(id=4), idCargo=Cargo.objects.get(id=7),
                                   idContrato=Contrato.objects.get(id=4),
                                   idCoordinador=Coordinador.objects.get(id=4))

    def test_url_exists(self):
        resp = self.client.get('/api/profesional/')
        self.assertEqual(resp.status_code, 200)

    def test_get_id_true(self):
        resp = self.client.get('/api/profesional/3')
        self.assertEqual(resp.status_code, 200)

    def test_get_id_false(self):
        resp = self.client.get('/api/profesional/4')
        self.assertEqual(resp.status_code, 404)

    def test_get(self):
        self.assertEqual(Profesional.objects.get(id=3).rut, '20237081-0')

    def test_get_false(self):
        self.assertNotEquals(Profesional.objects.get(id=3).rut, '20237081-1')

    def test_put(self):
        print(Profesional.objects.all())
        resp = self.client.put('/api/profesional/4',json.dumps({'nombre': "profesional ejemplo",
                                                                'rut': '20237082-0', 'inasistencias': 0, 'horasTotales': 0,
                                                                'horasExtras': 0, 'vacaciones': 0, 'licencia': 0,
                                                                'idCentro': 5, 'idArea': 4, 'idCargo': 6, 'idContrato': 4,
                                                                'idCoordinador': 4}))
        self.assertEqual(resp.status_code, 200)

    def test_delete(self):
        resp = self.client.delete('/api/profesional/3')
        self.assertEqual(resp.status_code, 200)

    def test_delete_false(self):
        resp = self.client.delete('/api/profesional/10')
        self.assertEqual(resp.status_code, 200)

