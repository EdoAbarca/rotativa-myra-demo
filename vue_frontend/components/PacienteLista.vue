<script>
import { mapState, mapGetters } from 'vuex'
import { mapMutations,mapActions } from 'vuex'
import EtiquetaPaciente from './EtiquetaPaciente.vue';

export default {
    name:'PacienteLista',
    components: {
        EtiquetaPaciente
    },
    props: ['nombre','rut','cliente','turno', 'id'],


    computed:{
    },
    methods:{
        ...mapMutations({
            mostrar: 'paciente/mostrar',
        }),
        ...mapActions('paciente',[
            'fetchPaciente'       
        ]), 
    }
}
</script>
<template>
    <div tabindex="0" class="ProfesionalLista" @click="fetchPaciente(id),mostrar(id)">
        <div class="ContenedorEtiquetaProfesional">
            <EtiquetaPaciente id="etiquetaCentro" :turno="null" :cliente="cliente"/>
            <EtiquetaPaciente id="etiquetaArea" :turno="turno" :cliente="null"/>
        </div>
        <div class="ContenedorNombreProfesional">{{ nombre }}</div>
        <div class="ContenedorRutProfesional">{{ rut }}</div>
    </div>

</template>
<style>
</style>