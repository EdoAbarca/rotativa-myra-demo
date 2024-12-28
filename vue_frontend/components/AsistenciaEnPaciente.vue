<script>
import { mapState, mapGetters } from 'vuex'
import { mapMutations, mapActions } from 'vuex'
import EtiquetaProfesional from './EtiquetaProfesional.vue';

export default {

    props: ['nombre','rut','area','fecha','estado', 'idProf'],
    components: {
        EtiquetaProfesional
    },
    methods:{
        ...mapMutations({
            mostrar: 'profesional/mostrar',
        }),
        ...mapActions('profesional',[
            'fetchProfesional'       
        ]),
        
        direccionar(id){
            this.fetchProfesional(id)
            this.$router.push('/profesionales') 
        }
    }
}
</script>
<template>
    <li tabindex="0" class="AsistenciaLista" @click="direccionar(idProf),mostrar(idProf)">
        <div class="ContenedorEstado" id="estadoAsistencia">
            <EtiquetaAsistencia  :estado="estado"/>
        </div>
        <div class="ContenedorfechaAsistencia" id="fechaAsistencia">{{ fecha }}</div>
        <div class="ContenedorEtiqueta" id="etiquetaAsistencia">
            <EtiquetaProfesional  :area="area" :centro="null"/>
        </div>
        
        <div class="ContenedorNombrePaciente" id="nombreAsistencia">{{ nombre }}</div>
        <div class="ContenedorRutPaciente">{{ rut }}</div>
        
    </li>
</template>

<style>

#etiquetaAsistencia{
    display: flex;
    position: relative;
    justify-content: center;
    align-items: center;
    min-width: 110px;
}
#nombreAsistencia{
    padding-left: 8px;
}
</style>