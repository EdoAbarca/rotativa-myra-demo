<script>
import { mapState, mapActions, mapMutations, mapGetters } from 'vuex'
import ProfesionalLista from './ProfesionalLista.vue'
import PacienteLista from './PacienteLista.vue'
import AlertaLista from './AlertaLista.vue'
import axios from 'axios'

import CoordinadorLista from './CoordinadorLista.vue'
export default {

  name: 'ListaDeContenidos',
  props:['page'],
  data() {
        return {
          datos:[]
        }
    },
  components: {
    ProfesionalLista,
    PacienteLista,
    CoordinadorLista,
    AlertaLista
},
  computed:{

    ...mapState('profesional',[
            'dataProfesionales'       
        ]),
    ...mapState('paciente',[
            'dataPacientes'       
        ]),
    ...mapState('coordinador',[
            'dataCoordinadores'       
        ]),
    ...mapState('alertas',[
            'dataAlertas'       
        ]),
    ...mapActions('profesional',[
            'fetchProfesionales',
            'restaurarProfesionales'       
        ]), 
    ...mapActions('paciente',[
            'fetchPacientes',      
        ]),
    ...mapActions('alertas',[
            'fetchAlertas',      
        ]),
    ...mapActions('coordinador',[
            'fetchCoordinadores',      
        ]),     
  },
  mounted(){
    if(this.page === 'profesionales'){
      this.fetchProfesionales;
      console.log('dataProf',this.dataProfesionales)
    }
    else if (this.page === 'pacientes'){
      this.fetchPacientes;
    }
    else if(this.page === 'coordinadores'){
      this.fetchCoordinadores;
    }
    else if(this.page === 'alertas'){
      this.fetchAlertas;
    }
    else{
      this.restaurarProfesionales;
    }
  }
}
</script>

<template>
    <div class="ContenedorLista">
        <div class="ContenedorTitulo" v-if="this.page === 'profesionales'">
          <div id ="MargenBorde"></div>
          <h1 id="tituloCentro">Centro</h1>
          <h1 id="tituloArea">Área</h1>
          <h1 id="tituloNombreProfesional">Profesional</h1>
          <h1 id="tituloRutProfesional">Rut</h1> 
        </div>
        <div class="ContenedorTitulo" v-if="this.page === 'pacientes'">
          <h1 id="tituloCentro">Cliente</h1>
          <h1 id="tituloArea">Turno</h1>
          <h1 id="tituloNombreProfesional">Paciente</h1>
          <h1 id="tituloRutProfesional">Rut</h1> 
        </div>

        <div class="ContenedorTitulo" v-if="this.page === 'coordinadores'">
          <h1 id="tituloCentro">Centro</h1>
          <h1 id="tituloArea">Área</h1>
          <h1 id="tituloNombreProfesional">Coordinador</h1>
          <h1 id="tituloRutProfesional">Rut</h1> 
        </div>

        <div class="ContenedorTitulo" v-if="this.page === 'alertas'">
          <h1 id="tituloCentro">Tipo</h1>
          <h1 id="tituloArea">Fecha</h1>
          <h1 id="tituloinvolucrados">Involucrados</h1>

        </div>

        <div class ="ContenidoLista">
            <div v-if="this.page === 'profesionales'">
                <v-alert v-if=" dataProfesionales.length === 0"
                  color="#FF7A7A"
                  dark
                  border="left"
                  transition="scale-transition"
                  icon="mdi-badge-account-alert"
                > No se han detectado Profesionales en el sistema
              </v-alert>

                <ProfesionalLista v-for="(prof) in dataProfesionales"
                    :key="prof.id"
                    :nombre="prof.nombre"
                    :rut="prof.rut"
                    :area="prof.idArea_id"
                    :centro="prof.idCentro_id"
                    :id="prof.id"
                />
            </div>
            
            <div v-if="this.page === 'pacientes'">
              <v-alert v-if="dataPacientes.length === 0"
                  color="#FF7A7A"
                  dark
                  border="left"
                  transition="scale-transition"
                  icon="mdi-badge-account-alert"
                > No se han detectado Pacientes en el sistema
              </v-alert>
                <PacienteLista v-for="(paciente) in dataPacientes"
                    :key="paciente.id"
                    :nombre="paciente.nombre"
                    :rut="paciente.rut"
                    :cliente="paciente.idCliente_id"
                    :turno="paciente.idTipoTurno_id"
                    :id="paciente.id"
                />
            </div>


            <div v-if="this.page === 'coordinadores'">
              <v-alert v-if="dataCoordinadores.length === 0"
                  color="#FF7A7A"
                  dark
                  border="left"
                  transition="scale-transition"
                  icon="mdi-badge-account-alert"
                > No se han detectado Coordinadores en el sistema
              </v-alert>
                <CoordinadorLista v-for="(coord) in dataCoordinadores"
                    :key="coord.id"
                    :nombre="coord.nombre"
                    :rut="coord.rut"
                    :centro="coord.idCentro_id"
                    :area="coord.idArea_id"
                    :id="coord.id"
                />
            </div>

            <div v-if="this.page === 'alertas'">
                <AlertaLista v-for="(alerta) in dataAlertas" 
                :key="alerta.id"
                :id ="alerta.id"
                :nombrePac ="alerta.nombrePaciente"
                :nombreProf="alerta.nombreProfesional"
                :idProf = "alerta.idProfesional_id"
                :idPac = "alerta.idPaciente_id"
                :motivo="alerta.descrupcion"
                :fecha ="alerta.fechaAlerta"
                :tipoAlerta="alerta.idTipoAlerta_id"
                />
            </div>

        </div>

    </div>
</template>

<style>

.ContenedorLista{
    position: relative;
    display: flex;
    flex-direction: column;
    margin-top: 1%;
    width: 100%;
    height: 82%;
    top: 0;
    background-color: white;
    border-radius: 12.5px;
    filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.15));
    z-index: 1;
}
.ContenedorTitulo{

    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
    height: 25px;
    background-color: #669098;

    border-radius: 12.5px 12.5px 0px 0px;
    color: white;

    
}
.ContenidoLista{
    margin-left: 1%;
    position: relative;
    height: 100%;
    overflow-y: scroll;

    filter: drop-shadow(0px 1px 1px rgba(0, 0, 0, 0.1));

}
#tituloCentro,#tituloArea{
  display: flex;
  position: relative;
  width: 14%;
  min-width: 100px;
  justify-content: center;

  font-family: Arial, Helvetica, sans-serif;
  font-size: 13px;
  font-weight: 600;

}
#tituloCentro{
  margin-left: 3.8%;
}
#tituloArea{

  margin-left: 1.2%;

}
#tituloNombreProfesional{
  width: 45%;
  text-align: left;
  margin-left: 2%;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 13px;
  font-weight: 600;

}
#tituloinvolucrados{
  width: 62%;
  text-align: left;
  margin-left: 2%;
  padding-left: 12.5%;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 13px;
  font-weight: 600;

}

#tituloRutProfesional{
  width: 20%;
  text-align: left;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 13px;
  font-weight: 600;
  margin-left: 1%;

}
</style>