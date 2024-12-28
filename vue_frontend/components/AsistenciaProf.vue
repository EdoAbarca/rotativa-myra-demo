<script>
import { mapState, mapGetters } from 'vuex'
import { mapMutations, mapActions } from 'vuex'
import EtiquetaAsistencia from './EtiquetaAsistencia.vue';

export default {

    props: ['nombrePaciente','rutPaciente','estado','fecha','idPac'],
    components: {
        EtiquetaAsistencia
    },
    methods:{
        ...mapMutations({
            mostrar: 'paciente/mostrar',
        }),
        ...mapActions('paciente',[
            'fetchPaciente'       
        ]),
        
        direccionar(id){
            this.fetchPaciente(id);
            console.log('ID del paciente', id);
            this.$router.push('/pacientes') ;
        }
    }
}
</script>
<template>
    <div tabindex="0" class="AsistenciaLista" @click="direccionar(idPac),mostrar(idPac)">
        <div class="ContenedorEstado">
            <EtiquetaAsistencia  :estado="estado"/>
        </div>
        <div class="ContenedorfechaAsistencia">{{ fecha }}</div>
        <div class="ContenedorNombrePaciente">{{ nombrePaciente }}</div>
        <div class="ContenedorRutPaciente">{{ rutPaciente }}</div>
        
    </div>

</template>

<style>
.AsistenciaLista{
    margin-top: 5px;
    
    position: relative;
    width: 99%;
    height: 40px;
    display: flex;
    flex-direction: row;
    background-color: #F3F3F3;
    border-radius: 7px;
    text-align: center;
    overflow: hidden;

    font-size: 15px;
    font-family: Arial, Helvetica, sans-serif;
    font-weight: 500;
    cursor: pointer;
    transition: all 200ms linear;
}
.ContenedorEstado{
    position: relative;
    width: 15%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 120px;
    
}
.ContenedorNombrePaciente{
    position: relative;
    display: flex;
    width: 50%;
    height: 100%;
    align-items: center;
    text-align: left;
    font-size: 14px;

    

    
}

.ContenedorRutPaciente{
    width: 20%;
    height: 100%;
    display: flex;
    align-items: center;
    text-align: left;
    font-size: 14px;
}

.ContenedorfechaAsistencia{
    position: relative;
    display: flex;
    width: 15%;
    height: 100%;
    font-size: 14px;
    align-items: center;
    justify-content: center;
    text-align: left;
   min-width: 85px;

}


.AsistenciaLista:hover{
    background-color: #E7E7E7;
    color: #48ABBF;
}
.AsistenciaLista:focus{
    background-color: #E7E7E7;
    color: #48ABBF;
}

</style>