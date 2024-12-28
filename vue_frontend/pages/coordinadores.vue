<script>
import BarraNav from "../components/BarraNav.vue";
import ContenidoLista from "../components/ContenidoLista.vue";
import BuscadorProfesionales from "../components/BuscadorProfesionales.vue";
import DatosProfesional from "../components/DatosProfesional.vue";

import DatosCoordinador from "../components/DatosCoordinador.vue";
export default {
  name: 'coordinadores',
  data() {
    return {
      fechaReporte: "24-06-2021",
    };
  },
  components: {
    BarraNav,
    DatosCoordinador
},
};
</script>

<template>
  <v-app>
  <div class="ContenedorPrincipal">
    <div class="Navegacion">
      <BarraNav />
    </div>
    <div class="Contenedores">
      <div class="ContenedorGris">
        <div class="fondoGris" >
          <BuscadorProfesionales :page="'coordinadores'" />
          <ContenidoLista :page="'coordinadores'" />
        </div>
        
      </div>
      <div class="Separador"></div>
      <div class="ContenedorGris">
        <div class="fondoGris" >
          <DatosCoordinador />
        </div>
        
      </div>
    </div>
  </div>
</v-app>
</template>


<style>

</style>
