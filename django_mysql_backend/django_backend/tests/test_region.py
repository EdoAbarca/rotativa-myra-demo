import json

from django.test import TestCase
from api.models import *
from api.views import *
from django.urls import reverse
import datetime

class ZonaTestView(TestCase):
    @classmethod
    def setUpTestData(cls):
        Region.objects.create(nombreRegion='Region 3')

    def test_url_exists(self):
        resp = self.client.get('/api/region/')
        self.assertEqual(resp.status_code, 200)

    def test_get_id_true(self):
        resp = self.client.get('/api/region/3')
        self.assertEqual(resp.status_code, 200)

    def test_get_id_false(self):
        resp = self.client.get('/api/region/4')
        self.assertEqual(resp.status_code, 200)

    def test_get(self):
        self.assertEqual(Region.objects.get(id=3).nombreRegion, 'Region 3')

    def test_get_false(self):
        self.assertNotEquals(Region.objects.get(id=3).nombreRegion, 'Region ejemplo')

    def test_put_false(self):
        print(Region.objects.all())
        resp = self.client.put('/api/region/4',json.dumps({'nombreRegion':"nueva region"}))
        self.assertEqual(resp.status_code, 200)

    def test_put_true(self):
        print(Region.objects.all())
        resp = self.client.put('/api/region/3', json.dumps({'nombreRegion': "nueva region"}))
        self.assertEqual(resp.status_code, 200)

    def test_delete(self):
        resp = self.client.delete('/api/region/3')
        self.assertEqual(resp.status_code, 200)

    def test_delete_false(self):
        resp = self.client.delete('/api/region/10')
        self.assertEqual(resp.status_code, 200)
