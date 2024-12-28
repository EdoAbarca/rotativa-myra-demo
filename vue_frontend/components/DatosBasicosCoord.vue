<script>
import EtiquetaProfesional from './EtiquetaProfesional.vue';
import { mapState, mapMutations, mapGetters } from 'vuex'
export default {

props: ['nombre','rut','area','centro','coordinador','contrato'],
computed:{
},

}
</script>
<template>
    <div class="ContenedorBaseDatos"  >
        <div id="tituloDatosProfesional">Datos del Coordinador
            <span id ="separador"></span>
        </div>
        <div class="Cont-Info-Basica" >
            <div id="datosIzquierdaBasico">
                <h1 id="nombreEntidad" class="TextoContenido">Nombre: {{ nombre }}</h1>
                <h1 id="rutEntidad" class="TextoContenido">Rut: {{ rut }}</h1>
                <h1 id ="cargoEntidad" class="TextoContenido">Cargo: {{ area }}</h1>
            </div>
            <div id="datosDerechaBasico">
                <EtiquetaProfesional id="etiquetaEnDatos"   :centro ="centro" :area="null" />
                <EtiquetaProfesional id="etiquetaEnDatos"  :centro="null" :area="area"  />
            </div>
        </div>
        <div class="Cont-Coord" >
            <div id="datosIzquierdaCoord">
                <h1 id="nombreCoord" class="TextoContenido"></h1>
                
            </div>
            <div id="datosDerechaCoord">
                <h1 id="contrato" class="TextoContenido" >Contrato: {{ contrato }}</h1>
            </div>
        </div>

    </div>
</template>
<style>




</style>