<script>

import { mapState } from 'vuex'
import { mapMutations } from 'vuex'
import { mapGetters } from 'vuex'
import AsistenciaProf from './AsistenciaProf.vue'
import ProfesionalLista from './ProfesionalLista.vue'
import PacienteLista from './PacienteLista.vue'
import axios from 'axios'
import AsistenciaEnPaciente from './AsistenciaEnPaciente.vue'

export default {
  name:'Historial',
  props:['tipo'],
  data() {
        return {
          datos:[]
        }
    },
  components: {
    AsistenciaProf,
    AsistenciaEnPaciente,
    ProfesionalLista,
    PacienteLista
},
  computed:{
    ...mapState('profesional',[
            'asistencias',     
        ]),
    ...mapState('paciente',[
            'historialAtencion',     
        ]),

    ...mapState('coordinador',[
            'pacientesCoord',  
            'profesionalesCoord',    
        ]),
    }       
}

</script>

<template>
    <div class="contenedorHistoriaAtencion"  >
        <div class="barraDatos" id="barraDatosHistorial" v-if="tipo==='pacientes'">
          <h1 id="tituloEstado">Estado</h1>
          <h1 id="tituloFecha">Fecha</h1>
          <h1 id="tituloArea">Área</h1>
          <h1 id="tituloNombreProfesional">Profesional</h1>
          <h1 id="tituloRutProfesional">Rut</h1> 
        </div>
        <div class="barraDatos" id="barraDatosHistorial" v-if="tipo==='profesionales'">
          <h1 id="tituloEstado">Estado</h1>
          <h1 id="tituloFecha">Fecha</h1>
          <h1 id="tituloNombreProfesional">Paciente</h1>
        </div>
        <div class="barraDatos" id="barraDatosHistorial" v-if="tipo==='coordinadores1'">
            <h1 id="tituloCentro">Centro</h1>
            <h1 id="tituloArea">Área</h1>
            <h1 id="tituloNombreProfesional">Profesional</h1>
            <h1 id="tituloRutProfesional">Rut</h1> 
        </div>
        <div class="barraDatos" id="barraDatosHistorial" v-if="tipo==='coordinadores2'">
            <h1 id="tituloCentro">Cliente</h1>
          <h1 id="tituloArea">Turno</h1>
          <h1 id="tituloNombreProfesional">Paciente</h1>
          <h1 id="tituloRutProfesional"></h1> 
        </div>
        <div class ="ContenidoHistorial" v-if="tipo==='pacientes'">
            <div>
                <AsistenciaEnPaciente v-for="(assist) in historialAtencion"
                    :key="assist.id"
                    :nombre="assist.nombreProfesional"
                    :rut="assist.rutProfesional"
                    :area ="assist.idArea_id"
                    :fecha="assist.fechaAsistencia"
                    :estado ="assist.estado"
                    :idProf = "assist.idProfesional_id"
                />
            </div>   
        </div>

        <div class ="ContenidoHistorial" v-if="tipo==='profesionales'">
            <div>
                <AsistenciaProf v-for="(assist) in asistencias"
                    :key="assist.id"
                    :nombrePaciente="assist.nombrePaciente"
                    :estado ="assist.estado"
                    :fecha="assist.fechaAsistencia"
                    :idPac="assist.idPaciente_id"
                />
            </div>   
        </div>

        <div class ="ContenidoHistorial" v-if="tipo==='coordinadores1'">
            <div>
                <ProfesionalLista v-for="(profCoord) in profesionalesCoord"
                :key="profCoord.id"
                :id="profCoord.id"
                :area="profCoord.idArea_id"
                :centro="profCoord.idCentro_id"
                :nombre="profCoord.nombre"
                :rut="profCoord.rut"
                />
            </div>   
        </div>

        <div class ="ContenidoHistorial" v-else-if="tipo==='coordinadores2'">
            <div>
                <PacienteLista v-for="(pacCoord) in pacientesCoord"
                :key="pacCoord.id"
                :id="pacCoord.id"
                :cliente="pacCoord.idCliente_id"
                :nombre="pacCoord.nombre"
                :turno="pacCoord.idTipoTurno_id"
                />
            </div>   
        </div>

    </div>
</template>

<style>
#tituloEstado{
    position: relative;
    display: flex;
    width: 15%;
    height: 100%;
    min-width: 120px;
    justify-content: center;
    align-items: center;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 13px;
    font-weight: 600;
}
#tituloFecha{
  position: relative;
  display: flex;
  width: 10%;
  min-width: 85px;
  justify-content: center;
  align-items: center;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 13px;
  font-weight: 600;
}
.contenedorHistoriaAtencion{
    position: absolute;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    top: 0;
    background-color: white;
    border-radius: 12.5px;
}
.ContenidoHistorial{
    padding-left: 1%;
    position: relative;
    height: 100%;
    overflow-y: scroll;  
    filter: drop-shadow(0px 1px 1px rgba(0, 0, 0, 0.1));

}
.barraDatos{
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
    height: 25px;
    background-color: #BBBBBB;
    color: white;
}
#barraDatosHistorial{
  border-radius: 12.5px 12.5px 0 0;
}
</style>