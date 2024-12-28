import json

from django.test import TestCase
from api.models import *
from api.views import *
from django.urls import reverse
import datetime

class CentroTestView(TestCase):
    @classmethod
    def setUpTestData(cls):
        Centro.objects.create(nombreCentro='Centro 2')

    def test_url_exists(self):
        resp = self.client.get('/api/centro/')
        self.assertEqual(resp.status_code, 200)

    def test_get_id_true(self):
        resp = self.client.get('/api/centro/2')
        self.assertEqual(resp.status_code, 200)

    def test_get_id_false(self):
        resp = self.client.get('/api/centro/3')
        self.assertEqual(resp.status_code, 200)

    def test_get(self):
        self.assertEqual(Centro.objects.get(id=2).nombreCentro, 'Centro 2')

    def test_get_false(self):
        self.assertNotEquals(Centro.objects.get(id=2).nombreCentro, 'v2')

    def test_put_false(self):
        print(Centro.objects.all())
        resp = self.client.put('/api/centro/3', json.dumps({'nombreCentro': "Residencia"}))
        self.assertEqual(resp.status_code, 200)

    def test_put_true(self):
        print(Centro.objects.all())
        resp = self.client.put('/api/centro/2', json.dumps({'nombreCentro': "Residencia"}))
        self.assertEqual(resp.status_code, 200)

    def test_delete(self):
        resp = self.client.delete('/api/centro/2')
        self.assertEqual(resp.status_code, 200)

    def test_delete_false(self):
        resp = self.client.delete('/api/centro/10')
        self.assertEqual(resp.status_code, 200)
