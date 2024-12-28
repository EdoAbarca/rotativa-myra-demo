<script>
import { mapState, mapGetters } from 'vuex'
import { mapMutations,mapActions } from 'vuex'
import EtiquetaProfesional from './EtiquetaProfesional.vue';

export default {

    props: ['nombre','rut','area','centro', 'id'],
    components:{
        EtiquetaProfesional
    },
    computed:{
    },
    methods:{
        ...mapMutations({
            mostrar: 'coordinador/mostrar',
        }),
        ...mapActions('coordinador',[
            'fetchCoordinador'       
        ]), 
    }
}
</script>
<template>
    <li tabindex="0" class="ProfesionalLista" @click="fetchCoordinador(id),mostrar(rut)">
        <div class="ContenedorEtiquetaProfesional">
            <EtiquetaProfesional id="etiquetaCentro" :area="null" :centro="centro"/>
            <EtiquetaProfesional id="etiquetaArea" :area="area" :centro="null"/>
        </div>
        <div class="ContenedorNombreProfesional">{{ nombre }}</div>
        <div class="ContenedorRutProfesional">{{ rut }}</div>
    </li>

</template>

<style>
</style>