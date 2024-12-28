<script>
import BotonBarra from "./BotonBarra.vue";
import MenuSesion from "./MenuSesion.vue";


export default {
  props:['page'],
  data() {
    return {
      fechaReporte: "24-06-2021",
    };
  },
  components: {
    BotonBarra,
    MenuSesion
  },
  methods:{
  }
};
</script>

<template>
  <nav class="BarraNavegacion">
    <div id="barraAzul"></div>
    <nav id="barraGris">
      <div id="botonesNavegacion">
        <v-btn
            id="btnHome"
            fab
            width="35px"
            height="35px"
            color="#48ABBF"
            elevation="1"
            dark
            nuxt
            to="/home"
            left
        >
        <v-icon
            medium
            color="white"
            >
            mdi-home
        </v-icon>
        </v-btn>
      </div>
      <div id="botonesGenerales">
        <BotonBarra
          id="bProfesionales"
          tipo="Profesionales"
          link="profesionales"
        />
        <BotonBarra 
          id="bPacientes" 
          tipo="Pacientes" 
          link="pacientes" />
        <BotonBarra
          id="bCoordinadores"
          tipo="Coordinadores"
          link="coordinadores"
        />
        <BotonBarra 
          id="bAlertas" 
          tipo="Alertas" 
          link="alertas" />
      </div>
      
      <div id="ultimoReporte">Último Reporte: {{ fechaReporte }}</div>
      <div id="menuUsuario">
        <MenuSesion/>
      </div>   
    </nav>
  </nav>

</template>

<style>
/*----------------------BARRAS DE NAVEGACIÓN---------------------- */
.BarraNavegacion {
  position: absolute;
  width: 100%;
  height: 60px;
  left: 0px;
  top: 0px;
  filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25));
  font-family: Arial, Helvetica, sans-serif;
}
#menuUsuario{
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  width: 100px;
  height: 100%;
  right: 0;
  z-index: 500;
}
#barraAzul {
  position: absolute;
  width: 100%;
  height: 20px;
  left: 0px;
  top: 0px;
  background: #005d71;
  z-index: -2;
}
#barraGris {
  position: absolute;
  width: 100%;
  height: 40px;
  left: 0px;
  top: 20px;
  z-index: -1;
  background: #eef7f9;
  display: flex;
  flex-direction: row;
  align-items: center;
}

/*----------------------CONTENEDORES DE BOTONES---------------------- */
#botonesNavegacion {
  position: relative;

  height: 100%;
  width: 25%;
  z-index: 4;
  justify-content: center;

}

#botonesGenerales {
  position: absolute;
  background-color: #48abbf;
  border-radius: 0px 0px 30px 30px;
  left: 25%;
  height: 100%;
  width: 50%;
  z-index: 4;
}
#ultimoReporte {
  display: flex;
  align-items: center;
  text-align: center;
  position: absolute;
  justify-content: center;
  width: 25%;
  height: 100%;
  right: 0px;
  z-index: 4;

  font-weight: 700;
  font-size: small;
  color: #005d71;
}

/*----------------------BOTONES GENERALES---------------------- */
#bProfesionales {
  width: 25%;
  height: 100%;
  z-index: 10;
}
#bPacientes {
  width: 25%;
  height: 100%;
  left: 25%;
  z-index: 10;
}
#bCoordinadores {
  width: 25%;
  height: 100%;
  left: 50%;
  z-index: 10;
}
#bAlertas {
  width: 25%;
  height: 100%;
  right: 0%;
  z-index: 10;
}
#btnHome{
  top: 5%;
  left: 90%;
}

</style>
  