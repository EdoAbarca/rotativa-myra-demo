import json

from django.test import TestCase
from api.models import *
from api.views import *
from django.urls import reverse
import datetime

class CoordinadorTestView(TestCase):
    @classmethod
    def setUpTestData(cls):
        Centro.objects.create(nombreCentro='Centro 3')
        Cargo.objects.create(cargo='Cargo 4')
        Coordinador.objects.create(nombre='Coordinador de ejemplo', rut='20111111-1', idCargo=Cargo.objects.get(id=4),
                                   idCentro=Centro.objects.get(id=3))

    def test_url_exists(self):
        resp = self.client.get('/api/coordinador/')
        self.assertEqual(resp.status_code, 200)

    def test_get_id_true(self):
        resp = self.client.get('/api/coordinador/2')
        self.assertEqual(resp.status_code, 200)

    def test_get_id_false(self):
        resp = self.client.get('/api/coordinador/3')
        self.assertEqual(resp.status_code, 200)

    def test_get(self):
        self.assertEqual(Coordinador.objects.get(id=2).rut, '20111111-1')

    def test_get_false(self):
        self.assertNotEquals(Coordinador.objects.get(id=2).rut, '20111111-2')

    def test_put(self):
        print(Coordinador.objects.all())
        resp = self.client.put('/api/coordinador/3', json.dumps({'nombre': "Coordinador de ejemplo prueba",
                                                                 'rut': "20111110-1",
                                                                 'idCargo': 2,
                                                                 'idCentro': 2}))
        self.assertEqual(resp.status_code, 200)

    def test_delete(self):
        resp = self.client.delete('/api/coordinador/2')
        self.assertEqual(resp.status_code, 200)

    def test_delete_false(self):
        resp = self.client.delete('/api/coordinador/10')
        self.assertEqual(resp.status_code, 200)
