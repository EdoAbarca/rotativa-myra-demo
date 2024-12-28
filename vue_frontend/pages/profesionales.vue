<script>
import BarraNav from "../components/BarraNav.vue";
import ContenidoLista from "../components/ContenidoLista.vue";
import BuscadorProfesionales from "../components/BuscadorProfesionales.vue";
import DatosProfesional from "../components/DatosProfesional.vue";

export default {
  name:'profesionales',
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
          <BuscadorProfesionales :page="'profesionales'" />
          <ContenidoLista :page="'profesionales'" />
        </div>
        
      </div>
      <div class="Separador"></div>
      <div class="ContenedorGris">
        <div class="fondoGris" >
          <DatosProfesional />
        </div>
        
      </div>
    </div>
  </div>
</v-app>
</template>


<style>

.ContenedorPrincipal {
  
  position: absolute;
  width: 100%;
  height: 100%;
  min-width: 1024px;
  min-height: 100%;

  display: flex;
  flex-direction: column;
  caret-color: transparent;
}
.Navegacion {
  position: relative;
  width: 100%;
  height: 60px;

  z-index: 10;
}
.Contenedores {

  overflow: hidden;
  box-sizing: border-box;
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  
}
.Separador {
  position: relative;
  width: 3%;
  height: 100%;
}
.ContenedorGris {
  display: flex;
  flex-direction: column;
  position: relative;
  width: 46%;
  min-width: 600px;
  height: 100%;
  background-color: #F7F7F7;
  justify-content: center;
}
.fondoGris{
  margin-top: 3%;
  width: 100%;
  height: 100%;
}
</style>
