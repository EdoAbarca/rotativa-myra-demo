import json

from django.test import TestCase
from api.models import *
from api.views import *
from django.urls import reverse
import datetime

class ClienteTestView(TestCase):
    @classmethod
    def setUpTestData(cls):
        Cliente.objects.create(nombreCliente='Cliente 2')

    def test_url_exists(self):
        resp = self.client.get('/api/cliente/')
        self.assertEqual(resp.status_code, 200)

    def test_get_id_true(self):
        resp = self.client.get('/api/cliente/2')
        self.assertEqual(resp.status_code, 200)

    def test_get_id_false(self):
        resp = self.client.get('/api/cliente/3')
        self.assertEqual(resp.status_code, 200)

    def test_get(self):
        self.assertEqual(Cliente.objects.get(id=2).nombreCliente, 'Cliente 2')

    def test_get_false(self):
        self.assertNotEquals(Cliente.objects.get(id=2).nombreCliente, 'Cliente ejemplo')

    def test_put_false(self):
        print(Cliente.objects.all())
        resp = self.client.put('/api/cliente/3', json.dumps({'nombreCliente': "Ejemplo de cliente"}))
        self.assertEqual(resp.status_code, 200)

    def test_put_true(self):
        print(Cliente.objects.all())
        resp = self.client.put('/api/cliente/2', json.dumps({'nombreCliente': "Ejemplo de cliente"}))
        self.assertEqual(resp.status_code, 200)

    def test_delete(self):
        resp = self.client.delete('/api/cliente/2')
        self.assertEqual(resp.status_code, 200)

    def test_delete_false(self):
        resp = self.client.delete('/api/cliente/10')
        self.assertEqual(resp.status_code, 200)
