import json

from django.test import TestCase
from api.models import *
from api.views import *
from django.urls import reverse
import datetime

class ContratoTestView(TestCase):
    @classmethod
    def setUpTestData(cls):
        Contrato.objects.create(tipoContrato='Contrato 2')

    def test_url_exists(self):
        resp = self.client.get('/api/contrato/')
        self.assertEqual(resp.status_code, 200)

    def test_get_id_true(self):
        resp = self.client.get('/api/contrato/2')
        self.assertEqual(resp.status_code, 200)

    def test_get_id_false(self):
        resp = self.client.get('/api/contrato/3')
        self.assertEqual(resp.status_code, 200)

    def test_get(self):
        self.assertEqual(Contrato.objects.get(id=2).tipoContrato, 'Contrato 2')

    def test_get_false(self):
        self.assertNotEquals(Contrato.objects.get(id=2).tipoContrato, 'v2')

    def test_put_false(self):
        print(Contrato.objects.all())
        resp = self.client.put('/api/contrato/3', json.dumps({'tipoContrato': "contrato2"}))
        self.assertEqual(resp.status_code, 200)

    def test_put_true(self):
        print(Contrato.objects.all())
        resp = self.client.put('/api/contrato/2', json.dumps({'tipoContrato': "contrato2"}))
        self.assertEqual(resp.status_code, 200)

    def test_delete(self):
        resp = self.client.delete('/api/contrato/2')
        self.assertEqual(resp.status_code, 200)

    def test_delete_false(self):
        resp = self.client.delete('/api/contrato/10')
        self.assertEqual(resp.status_code, 200)
