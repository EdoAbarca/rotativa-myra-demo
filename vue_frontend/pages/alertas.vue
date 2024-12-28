<script>
import BarraNav from "../components/BarraNav.vue";
import ContenidoLista from "../components/ContenidoLista.vue";
import BuscadorProfesionales from "../components/BuscadorProfesionales.vue";
import DatosProfesional from "../components/DatosProfesional.vue";

import DatosAlerta from "~/components/DatosAlerta.vue";
export default {
  head() {
    return {
      title: "Vista profesionales - Rotativa Myra",
    };
  },
  middleware: "auth",

  data() {
    return {
      fechaReporte: "24-06-2021",
    };
  },
  components: {
    BarraNav,
    DatosAlerta
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
          <BuscadorProfesionales :page="'alertas'" />
          <ContenidoLista :page="'alertas'" />
        </div>
        
      </div>
      <div class="Separador"></div>
      <div class="ContenedorGris">
        <div class="fondoGris" >
          <DatosAlerta />
        </div>
        
      </div>
    </div>
  </div>
</v-app>
</template>


<style>

</style>
