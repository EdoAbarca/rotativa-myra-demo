import json

from django.test import TestCase
from api.models import *
from api.views import *
from django.urls import reverse
import datetime

class ZonaTestView(TestCase):
    @classmethod
    def setUpTestData(cls):
        Zona.objects.create(nombreZona='Zona 4')

    def test_url_exists(self):
        resp = self.client.get('/api/zona/')
        self.assertEqual(resp.status_code, 200)

    def test_get_id_true(self):
        resp = self.client.get('/api/zona/4')
        self.assertEqual(resp.status_code, 200)

    def test_get_id_false(self):
        resp = self.client.get('/api/zona/5')
        self.assertEqual(resp.status_code, 200)

    def test_get(self):
        self.assertEqual(Zona.objects.get(id=4).nombreZona, 'Zona 4')

    def test_get_false(self):
        self.assertNotEquals(Zona.objects.get(id=4).nombreZona, 'Zona ejemplo')

    def test_put_false(self):
        print(Zona.objects.all())
        resp = self.client.put('/api/zona/5', json.dumps({'nombreZona': "zona"}))
        self.assertEqual(resp.status_code, 200)

    def test_put_true(self):
        print(Zona.objects.all())
        resp = self.client.put('/api/zona/4', json.dumps({'nombreZona': "zona"}))
        self.assertEqual(resp.status_code, 200)

    def test_delete(self):
        resp = self.client.delete('/api/zona/4')
        self.assertEqual(resp.status_code, 200)

    def test_delete_false(self):
        resp = self.client.delete('/api/zona/10')
        self.assertEqual(resp.status_code, 200)
