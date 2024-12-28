<script>
import BarraNav from "../components/BarraNav.vue";
import ContenidoLista from "../components/ContenidoLista.vue";
import BuscadorProfesionales from "../components/BuscadorProfesionales.vue";
import DatosPaciente from "../components/DatosPaciente.vue";

export default {
  name: 'pacientes',
  data() {
    return {
      fechaReporte: "24-06-2021",
    };
  },
  components: {
    BarraNav,
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
      <div class ="fondoGris" >
        <BuscadorProfesionales :page="'pacientes'"/>
        <ContenidoLista :page ="'pacientes'"/>
      </div>
        
      </div>
      <div class="Separador"></div>
      <div class="ContenedorGris">
        <div class="fondoGris">
          <DatosPaciente />
        </div>
      </div>
    </div>
  </div>
</v-app>
</template>


<style>
</style>
