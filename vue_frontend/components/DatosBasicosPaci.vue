<script>
import EtiquetaPaciente from './EtiquetaPaciente.vue';
import { mapState, mapMutations, mapGetters } from 'vuex'
export default {

props: ['nombre','turno','cliente','coordinador', 'region', 'zona', 'cuidado', 'idCoord']

}
</script>
<template>
    <div class="ContenedorBaseDatos"  >
        <div id="tituloDatosProfesional">Datos del Paciente
            <span id ="separador"></span>
        </div>
        <div class="Cont-Info-Basica" id="datosBasicosPaciente" >
            <div id="datosIzquierdaBasico">
                <h1 id="nombreEntidad" class="TextoContenido">Nombre: {{ nombre }}</h1>
                <h1 id ="cargoEntidad" class="TextoContenido">Turno: {{ turno }}</h1>
            </div>
            <div id="datosDerechaBasico">
                <EtiquetaPaciente id="etiquetaEnDatos"   :cliente ="cliente" :turno="null" />
                <EtiquetaPaciente id="etiquetaEnDatos"  :cliente="null" :turno="turno"  />
            </div>
        </div>
        <div class="Cont-Coord" id="datosCoordinacionPaciente">
            <div id="datosIzquierdaCoord">
                <h1 id="nombreCoord" class="TextoContenido">Coordinador: {{ coordinador }}</h1>
                <h1 id="nombreCoord" class="TextoContenido">Región: {{ region }}</h1>  
            </div>
            <div id="datosDerechaCoord">
                <h1 class="TextoContenido" id="nombreCoord">Zona: {{ zona }}</h1>
                
            </div>
        </div>

    </div>
</template>
<style>
#datosBasicosPaciente{
    height: 60%;
}
#datosCoordinacionPaciente{
    height: 40%;
}

</style>