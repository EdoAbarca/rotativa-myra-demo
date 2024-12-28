import json

from django.test import TestCase
from api.models import *
from api.views import *
from django.urls import reverse
import datetime

class AreaTestView(TestCase):
    @classmethod
    def setUpTestData(cls):
        Area.objects.create(nombreArea='Cuidados')

    def test_url_exists(self):
        resp = self.client.get('/api/area/')
        self.assertEqual(resp.status_code, 200)

    def test_get_id_true(self):
        resp = self.client.get('/api/area/1')
        self.assertEqual(resp.status_code, 200)

    def test_get_id_false(self):
        resp = self.client.get('/api/area/2')
        self.assertEqual(resp.status_code, 200)

    def test_get(self):
        self.assertEqual(Area.objects.get(id=1).nombreArea, 'Cuidados')

    def test_get_false(self):
        self.assertNotEquals(Area.objects.get(id=1).nombreArea, 'Cuidado')

    def test_put_false(self):
        print(Area.objects.all())
        resp = self.client.put('/api/area/2', json.dumps({'nombreArea': "Administracion"}))
        self.assertEqual(resp.status_code, 200)

    def test_put_true(self):
        print(Area.objects.all())
        resp = self.client.put('/api/area/1', json.dumps({'nombreArea': "Administracion"}))
        self.assertEqual(resp.status_code, 200)

    def test_delete(self):
        resp = self.client.delete('/api/area/1')
        self.assertEqual(resp.status_code, 200)

    def test_delete_false(self):
        resp = self.client.delete('/api/area/10')
        self.assertEqual(resp.status_code, 200)
