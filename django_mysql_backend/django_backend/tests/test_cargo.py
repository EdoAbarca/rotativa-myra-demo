import json

from django.test import TestCase
from api.models import *
from api.views import *
from django.urls import reverse
import datetime


#post: falta 1 caso
#put: falta 1 caso

#una vez listo, replicar para las demas clases

class CargoTestView(TestCase):
    @classmethod
    def setUpTestData(cls):
        Cargo.objects.create(cargo='Cargo 3')

    def test_url_exists(self):
        resp = self.client.get('/api/cargo/')
        self.assertEqual(resp.status_code, 200)

    def test_get_id_true(self):
        resp = self.client.get('/api/cargo/3')
        self.assertEqual(resp.status_code, 200)

    def test_get_id_false(self):
        resp = self.client.get('/api/cargo/4')
        self.assertEqual(resp.status_code, 200)

    def test_get(self):
        self.assertEqual(Cargo.objects.get(id=3).cargo, 'Cargo 3')

    def test_get_false(self):
        self.assertNotEquals(Cargo.objects.get(id=3).cargo, 'Coordinador')

    def test_put_false(self):
        print(Cargo.objects.all())
        resp = self.client.put('/api/cargo/4',json.dumps({'cargo':"nuevoCargo2"}))
        self.assertEqual(resp.status_code, 200)

    def test_put_true(self):
        print(Cargo.objects.all())
        resp = self.client.put('/api/cargo/3',json.dumps({'cargo':"nuevoCargo2"}))
        self.assertEqual(resp.status_code, 200)

    def test_delete(self):
        resp = self.client.delete('/api/cargo/3')
        self.assertEqual(resp.status_code, 200)

    def test_delete_false(self):
        resp = self.client.delete('/api/cargo/10')
        self.assertEqual(resp.status_code, 200)
