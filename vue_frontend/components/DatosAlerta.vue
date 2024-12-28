<script>
import DatosBasicosPaci from './DatosBasicosPaci.vue'
import Estadistica  from './Estadistica.vue'
import BotonObtener from './BotonObtener.vue'
import GastoPaciente from './BotonObtener.vue'
import Historial from './Historial.vue'
import DatosBasicosProf from './DatosBasicosProf.vue'

import { mapState,mapGetters, mapMutations } from 'vuex'


import MotivoAlerta from './MotivoAlerta.vue'
export default {
    props:['tipoAlerta'],
  components: {
    DatosBasicosPaci,
    DatosBasicosProf,
    Estadistica,
    BotonObtener,
    Historial,

    MotivoAlerta
},
    computed:{
        ...mapState('paciente',[
            'dataPaciente',
            'mostrarPac'       
        ]),

        ...mapState('alertas',[
            'dataAlerta',       
        ]),

        ...mapState('profesional',[
            'dataProfesional',
            'mostrar'       
        ]),
        ...mapGetters('paciente',[
            'getmostrarPac'

        ])

    },
    methods:{
        cambiar(id){
            if(id ==='remuneraciones'){
                document.getElementById('remuneraciones').style.zIndex = '100';
                document.getElementById('remuneraciones').style.opacity = '1';
                document.getElementById('btCambioDerecha').style.backgroundColor = '#669098';

                document.getElementById('asistencias').style.zIndex = '0';
                document.getElementById('asistencias').style.opacity = '0';
                document.getElementById('btCambioIzquierda').style.backgroundColor = '#5AB3C6';

                document.getElementById('atencion').style.zIndex = '0';
                document.getElementById('atencion').style.opacity = '0';
                document.getElementById('btCambioCentro').style.backgroundColor = '#5AB3C6';
                
            }
            else if(id ==='asistencias'){

                document.getElementById('remuneraciones').style.zIndex = '0';
                document.getElementById('remuneraciones').style.opacity = '0';
                document.getElementById('atencion').style.zIndex = '0';
                document.getElementById('atencion').style.opacity = '0';
                document.getElementById('asistencias').style.zIndex = '100';
                document.getElementById('asistencias').style.opacity = '1';

                document.getElementById('btCambioCentro').style.backgroundColor = '#5AB3C6';
                document.getElementById('btCambioDerecha').style.backgroundColor = '#5AB3C6';
                document.getElementById('btCambioIzquierda').style.backgroundColor = '#669098';

            }
            else{
                document.getElementById('remuneraciones').style.zIndex = '0';
                document.getElementById('remuneraciones').style.opacity = '0';
                document.getElementById('asistencias').style.zIndex = '0';
                document.getElementById('asistencias').style.opacity = '0';
                document.getElementById('atencion').style.zIndex = '100';
                document.getElementById('atencion').style.opacity = '1';

                document.getElementById('btCambioCentro').style.backgroundColor = '#669098';
                document.getElementById('btCambioDerecha').style.backgroundColor = '#5AB3C6';
                document.getElementById('btCambioIzquierda').style.backgroundColor = '#5AB3C6';

            }

        }
    }
}
</script>
<template>
    <div class="ContenedorDatosP">
        <transition appear name="fade" >
            <div class="contEfecto" v-if="getmostrarPac == true">
                <div class="EstadisticasProfesional">
                    <MotivoAlerta 
                    :estado="dataAlerta.idTipoAlerta_id" 
                    :fecha="dataAlerta.fechaAlerta" 
                    :desc="dataAlerta.descripcion"/>
                </div>
                
                <div class="DatosBasicos">
                    <DatosBasicosProf
                        :nombre="dataProfesional.nombre"
                        :rut="dataProfesional.rut"
                        :area="dataProfesional.idArea_id"
                        :centro="dataProfesional.idCentro_id"
                        :coordinador="dataProfesional.nombreCoordinador"
                        :contrato="dataProfesional.tipoContrato"
                        :idCoord="dataProfesional.idCoordinador_id"
                    />
                </div>
                
                <div class="DatosBasicos">
                    <DatosBasicosPaci
                    :nombre="dataPaciente.nombre"
                    :rut="dataPaciente.rut"
                    :turno="dataPaciente.idTipoTurno_id"
                    :cliente="dataPaciente.idCliente_id"
                    :coordinador="dataPaciente.nombreCoordinador"
                    :cuidado="'falta este dato'"
                    :region ="dataPaciente.region"
                    :zona = "dataPaciente.zona"
                    :idCoord="dataPaciente.idCoordinador_id"
                    />
                </div>

                
                <div class="BtnObtenerReporte">
                <BotonObtener/>
            </div>
        </div>
        
        
    </transition>

    </div>
</template>

<style>

.fade-enter-active, .fade-leave-active {
  transition: opacity .5s
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0
}

</style>