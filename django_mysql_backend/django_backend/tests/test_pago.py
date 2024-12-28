import json

from django.test import TestCase
from api.models import *
from api.views import *
from django.urls import reverse
import datetime

class PagoTestView(TestCase):
    @classmethod
    def setUpTestData(cls):
        Centro.objects.create(nombreCentro='Centro 4')
        Area.objects.create(nombreArea='Area 3')
        Cargo.objects.create(cargo='Cargo 5')
        Cargo.objects.create(cargo='Cargo 6')
        Contrato.objects.create(tipoContrato='Contrato 3')
        Coordinador.objects.create(nombre='Coordinador ejemplo', rut='20111111-1', idCargo=Cargo.objects.get(id=6),
                                   idCentro=Centro.objects.get(id=4))
        Profesional.objects.create(nombre='Nombre Ejemplo', rut='20237081-0', inasistencias=0,
                                   horasTotales=280, horasExtras=0, vacaciones=0, licencia=0,
                                   idCentro=Centro.objects.get(id=4),
                                   idArea=Area.objects.get(id=3), idCargo=Cargo.objects.get(id=5),
                                   idContrato=Contrato.objects.get(id=3),
                                   idCoordinador=Coordinador.objects.get(id=3))
        Pago.objects.create(sueldoBase=440000, gratificacion=0,horaExtra=0,bonos=0,aguinaldo=0,vacaciones=0,viatico=0,
                            asignacionFamiliar=0,colacion=0,movilizacion=0,salaCuna=0,totalHaberes=0,totalImponible=0,afp=0,
                            isapre=0,fonasa=0,segCes=0,imptoUnico=0,ctaAfp=0,anticipos=0,descuento=0,ley3=0,totalDescuento=0,
                            liquido=0,fechaPago="2023-03-03",idProfesional=Profesional.objects.get(id=2))

    def test_url_exists(self):
        resp = self.client.get('/api/pago/')
        self.assertEqual(resp.status_code, 200)

    def test_get_id_true(self):
        resp = self.client.get('/api/pago/1')
        self.assertEqual(resp.status_code, 200)

    def test_get_id_false(self):
        resp = self.client.get('/api/pago/2')
        self.assertEqual(resp.status_code, 200)

    def test_get(self):
        self.assertEqual(Pago.objects.get(id=1).sueldoBase, 440000)

    def test_get_false(self):
        self.assertNotEquals(Pago.objects.get(id=1).sueldoBase, 440001)

    def test_put(self):
        print(Pago.objects.all())
        resp = self.client.put('/api/pago/2',json.dumps({'sueldoBase':440000, 'gratificacion':0,'horaExtra':0,'bonos':0,
                                                         'aguinaldo':0, 'vacaciones':0, 'viatico':0, 'asignacionFamiliar':0,
                                                         'colacion':0, 'movilizacion':0, 'salaCuna':0, 'totalHaberes':0,
                                                         'totalImponible':0, 'afp':0, 'isapre':0, 'fonasa':0, 'segCes':0,
                                                         'imptoUnico':0, 'ctaAfp':0, 'anticipos':0, 'descuento':0, 'ley3':0,
                                                         'totalDescuento':0, 'liquido':0, 'fechaPago':"2023-03-04", 'idProfesional':2}))
        self.assertEqual(resp.status_code, 200)

    def test_delete(self):
        resp = self.client.delete('/api/pago/1')
        self.assertEqual(resp.status_code, 200)

    def test_delete_false(self):
        resp = self.client.delete('/api/pago/10')
        self.assertEqual(resp.status_code, 200)

