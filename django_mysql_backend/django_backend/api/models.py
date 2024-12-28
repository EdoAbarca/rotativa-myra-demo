from django.db import models
# Create your models here.
    
##########################################################################

class Cargo(models.Model):
    cargo = models.CharField(max_length=50)

class Contrato(models.Model):
    tipoContrato = models.CharField(max_length=15)

class Centro(models.Model):
    nombreCentro = models.CharField(max_length=30)

class Area(models.Model):
    nombreArea = models.CharField(max_length=30)

class Coordinador(models.Model):
    nombre = models.CharField(max_length=50)
    #rut = models.CharField(max_length=15)
    #profesionales = models.ManyToManyField(Profesional, related_name='lista_profesionales_c')
    #pacientes = models.ManyToManyField(Paciente, related_name='lista_pacientes_c')
    idArea = models.ForeignKey(Area, on_delete=models.CASCADE)
    #idCentro = models.ForeignKey(Centro, on_delete=models.CASCADE)

class Profesional(models.Model):
    nombre = models.CharField(max_length=50)
    rut = models.CharField(max_length=15)
    #
    inasistencias = models.IntegerField()
    horasTotales = models.IntegerField()
    horasExtras = models.IntegerField()
    vacaciones = models.IntegerField()
    licencia = models.IntegerField()
    #
    valorHora = models.IntegerField()
    horasCont = models.IntegerField()
    horasObj = models.IntegerField()
    turnosTrab = models.IntegerField()
    bonoColacion = models.IntegerField()
    bonoMov = models.IntegerField()
    bonoResp = models.IntegerField()
    #
    idCentro = models.ForeignKey(Centro, null=True, blank=True, on_delete=models.CASCADE)
    idArea = models.ForeignKey(Area, null=True, blank=True, on_delete=models.CASCADE)
    idCargo = models.ForeignKey(Cargo, null=True, blank=True, on_delete=models.CASCADE)
    idContrato = models.ForeignKey(Contrato, null=True, blank=True, on_delete=models.CASCADE)
    idCoordinador = models.ForeignKey(Coordinador, null=True, blank=True, on_delete=models.CASCADE)

class Pago(models.Model):
    sueldoBase = models.IntegerField()
    gratificacion = models.IntegerField()
    horaExtra = models.IntegerField()
    bonos = models.IntegerField()
    aguinaldo = models.IntegerField()
    vacaciones = models.IntegerField()
    viatico = models.IntegerField()
    asignacionFamiliar = models.IntegerField()
    colacion = models.IntegerField()
    movilizacion = models.IntegerField()
    salaCuna = models.IntegerField()
    totalHaberes = models.IntegerField()
    totalImponible = models.IntegerField()
    afp = models.IntegerField()
    isapre = models.IntegerField()
    fonasa = models.IntegerField()
    segCes = models.IntegerField()
    imptoUnico = models.IntegerField()
    ctaAfp = models.IntegerField()
    anticipos = models.IntegerField()
    descuento = models.IntegerField()
    ley3 = models.IntegerField()
    totalDescuento = models.IntegerField()
    liquido = models.IntegerField()
    fechaPago = models.DateField()
    idProfesional = models.ForeignKey(Profesional, on_delete=models.CASCADE)

class Region(models.Model):
    nombreRegion = models.CharField(max_length=70)

class Zona(models.Model):
    nombreZona = models.CharField(max_length=70)

class Cliente(models.Model):
    nombreCliente = models.CharField(max_length=70)

class TipoTurno(models.Model):
    #testear
    tipoTurno = models.CharField(max_length=10)

class Paciente(models.Model):
    #añadir cuidado
    #crear un metodo para el calculo del gasto
    #actualizar tests
    nombre = models.CharField(max_length=70)
    fechaInicioAtencion = models.DateField(null=True,blank=True)
    vigente = models.BooleanField(null=True)
    gasto = models.IntegerField()
    idZona = models.ForeignKey(Zona, null=True, blank=True, on_delete=models.CASCADE)
    idRegion = models.ForeignKey(Region, on_delete=models.CASCADE)
    idCliente = models.ForeignKey(Cliente, on_delete=models.CASCADE)
    idTipoTurno = models.ForeignKey(TipoTurno, on_delete=models.CASCADE)
    idCoordinador = models.ForeignKey(Coordinador, on_delete=models.CASCADE)

class Turno(models.Model):
    fechaInicio = models.DateField()
    fechaTermino = models.DateField()
    #idPaciente = models.ForeignKey(Paciente, on_delete=models.CASCADE)
    #idProfesional = models.ForeignKey(Profesional, on_delete=models.CASCADE)

class Asistencia(models.Model):
    fechaAsistencia = models.DateField()
    asisteProfesional = models.BooleanField()
    estado = models.IntegerField()
    horas = models.IntegerField()
    movilizacion = models.IntegerField()
    colacion = models.IntegerField()
    idProfesional = models.ForeignKey(Profesional, on_delete=models.CASCADE)
    idPaciente = models.ForeignKey(Paciente, on_delete=models.CASCADE)
    #idTurno = models.ForeignKey(Turno, on_delete=models.CASCADE)
    #idPago = models.ForeignKey(Pago, on_delete=models.CASCADE)

class TipoAlerta(models.Model):
    tipoAlerta = models.CharField(max_length=100)

class Alerta(models.Model):
    #testear
    fechaAlerta = models.DateField()
    descripcion = models.CharField(max_length=200)
    #profesionales = models.ManyToManyField(Profesional, related_name='lista_profesionales')
    #pacientes = models.ManyToManyField(Paciente, related_name='lista_pacientes')
    idPaciente = models.ForeignKey(Paciente, on_delete=models.CASCADE)
    idAsistencia = models.ForeignKey(Asistencia, on_delete=models.CASCADE)
    idProfesional = models.ForeignKey(Profesional, on_delete=models.CASCADE)
    idTipoAlerta = models.ForeignKey(TipoAlerta, on_delete=models.CASCADE)
