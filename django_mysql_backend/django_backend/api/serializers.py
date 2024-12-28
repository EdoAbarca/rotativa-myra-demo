from rest_framework import serializers
from django.contrib.auth.models import User
from .models import *
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

#Usuario
class UserRegisterSerializer(serializers.ModelSerializer):
	class Meta:
		model = User
		fields = '__all__'
	def create(self, validated_data):
		user = User.objects.create_user(**validated_data)
		return user

class UserSerializer(serializers.ModelSerializer):
	class Meta:
		model = User
		fields = ('id','username', 'is_superuser', 'is_staff', 'is_active','date_joined', 'last_login')
		#fields = '__all__'

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'

#CRUD
class CargoSerializer(serializers.ModelSerializer):
	class Meta:
		model = Cargo
		fields = '__all__'

class ContratoSerializer(serializers.ModelSerializer):
	class Meta:
		model = Contrato
		fields = '__all__'

class CentroSerializer(serializers.ModelSerializer):
	class Meta:
		model = Centro
		fields = '__all__'
	
class CoordinadorSerializer(serializers.ModelSerializer):
	class Meta:
		model = Coordinador
		fields = '__all__'

class AreaSerializer(serializers.ModelSerializer):
	class Meta:
		model = Area
		fields = '__all__'

class ProfesionalSerializer(serializers.ModelSerializer):
	class Meta:
		model = Profesional
		fields = '__all__'

class PagoSerializer(serializers.ModelSerializer):
	class Meta:
		model = Pago
		fields = '__all__'
	
class RegionSerializer(serializers.ModelSerializer):
	class Meta:
		model = Region
		fields = '__all__'
	
class ZonaSerializer(serializers.ModelSerializer):
	class Meta:
		model = Zona
		fields = '__all__'

class TipoTurnoSerializer(serializers.ModelSerializer):
	class Meta:
		model = TipoTurno
		fields = '__all__'

class PacienteSerializer(serializers.ModelSerializer):
	class Meta:
		model = Paciente
		fields = '__all__'

class TurnoSerializer(serializers.ModelSerializer):
	class Meta:
		model = Turno
		fields = '__all__'

class AsistenciaSerializer(serializers.ModelSerializer):
	class Meta:
		model = Asistencia
		fields = '__all__'

class AlertaSerializer(serializers.ModelSerializer):
	class Meta:
		model = Alerta
		fields = '__all__'

