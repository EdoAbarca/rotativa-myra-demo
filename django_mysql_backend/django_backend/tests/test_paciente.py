import json

from django.test import TestCase
from api.models import *
from api.views import *
from django.urls import reverse
import datetime

class PacienteTestView(TestCase):
    @classmethod
    def setUpTestData(cls):
        Zona.objects.create(nombreZona='Zona 2')
        Region.objects.create(nombreRegion='Region 2')
        Cliente.objects.create(nombreCliente='Cliente 3')
        Paciente.objects.create(nombre='Paciente 2', rut='21222333-1', tipoTurno="24", fechaInicioAtencion="2023-02-02",
                                vigente=True, idZona=Zona.objects.get(id=2), idRegion=Region.objects.get(id=2),
                                idCliente=Cliente.objects.get(id=3))

    def test_url_exists(self):
        resp = self.client.get('/api/paciente/')
        self.assertEqual(resp.status_code, 200)

    def test_get_id_true(self):
        resp = self.client.get('/api/paciente/2')
        self.assertEqual(resp.status_code, 200)

    def test_get_id_false(self):
        resp = self.client.get('/api/paciente/3')
        self.assertEqual(resp.status_code, 404)

    def test_get(self):
        self.assertEqual(Paciente.objects.get(id=2).rut, '21222333-1')

    def test_get_false(self):
        self.assertNotEquals(Paciente.objects.get(id=2).rut, '20237081-1')

    def test_put(self):
        print(Paciente.objects.all())
        resp = self.client.put('/api/paciente/3',json.dumps({'nombre': "paciente ejemplo",
                                                                'rut': '21222333-2', 'tipoTurno': 12, 'fechaInicioAtencion': "2023-04-02",
                                                                'vigente': True, 'idZona': 2, 'idRegion': 2,
                                                                'idCliente': 3}))
        self.assertEqual(resp.status_code, 200)

    def test_delete(self):
        resp = self.client.delete('/api/paciente/2')
        self.assertEqual(resp.status_code, 200)

    def test_delete_false(self):
        resp = self.client.delete('/api/paciente/10')
        self.assertEqual(resp.status_code, 200)

