<script>
import BarraNav from "../components/BarraNav.vue";
import SubirReporte from "~/components/SubirReporte.vue";
import Redireccion from "../components/Redireccion.vue";


import { mapGetters, mapActions } from "vuex";

export default {
  name: "Home",
  head() {
    return {
      title: "Home - Rotativa Myra",
    };
  },
  data() {
    return {
      fechaReporte: "24-06-2021",
    };
  },
  components: {
    BarraNav,
    Redireccion,
    SubirReporte
},
  computed: {
    
    ...mapGetters(["isAuthenticated", "loggedInUser"]),
    
  },
  methods: {
    ...mapActions('selectores',[
            'fetchSelectoresArea',
            'fetchSelectoresCentro',
            'fetchSelectoresTurno',
            'fetchSelectoresCliente'     
        ]),
  
  },
};
</script>

<template>
  <v-app>
  <div class="ContenedorPrincipal" v-if="isAuthenticated">
    <div class="Navegacion">
      <BarraNav />
    </div>
    <div class="ContenedorHome">
      <div class="ContenedorGris" id="cont-home">
        <div class="ContenedorBtnImagenes">
          <NuxtLink class="BtnImg" id="btImgProfesionales" to="/profesionales">
            <img
              async
              class="imgB"
              id="imgProf"
              src="../static/profesionalImg.svg"
            />
            <div class="EtiquetaBotonImg">
              <h1 class="tituloBtnImg">Profesionales</h1>
            </div>
          </NuxtLink>
          <NuxtLink class="BtnImg" id="btImgPacientes" to="/pacientes">
            <img
              async
              class="imgB"
              id="imgPac"
              src="../static/pacientesImg2.svg"
            />
            <div class="EtiquetaBotonImg">
              <h1 class="tituloBtnImg">Pacientes</h1>
            </div>
          </NuxtLink>
          <NuxtLink class="BtnImg" id="btImgAlerta" to="/alertas">
            <img
              async
              class="imgB"
              id="imgAle"
              src="../static/alertasImg.svg"
            />
            <div class="EtiquetaBotonImg">
              <h1 class="tituloBtnImg">Alertas</h1>
            </div>
          </NuxtLink>
        </div>
        <div class="ContenedorBtnSubir">
          <!--<v-btn class="BtnSubir" href="/reporte">Subir reporte</v-btn>-->
          <SubirReporte/>
        </div>
      </div>
    </div>
  </div>
  <div class="ContenedorPrincipal" v-else>
      <Redireccion/> 
  </div>
  </v-app>


</template>


<style>

.ContenedorPrincipal {
  position: absolute;
  width: 100%;
  height: 100%;
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
.ContenedorHome {
  overflow: hidden;
  box-sizing: border-box;
  position: relative;
  width: 100%;
  height: 100%;

  margin-top: 15px;
  display: flex;
  flex-direction: row;
  justify-content: center;
}

.ContenedorGris {
  position: relative;
  width: 46%;
  height: 100%;
  background-color: #fcfcfc;
  justify-content: center;
}
.ContenedorBtnImagenes {
  position: relative;
  width: 80%;
  height: 70%;
  display: flex;
  justify-content: center;
  flex-direction: row;
}
#cont-home {
  position: relative;
  width: 94%;
  display: flex;

  flex-direction: column;
  align-items: center;
}

.BtnImg {
  position: relative;
  width: 26%;
  height: 100%;

  background: rgb(180,242,255);
background: linear-gradient(11deg, rgba(180,242,255,1) 0%, rgba(236,236,236,1) 100%);
  display: flex;
  margin-left: 2%;
  margin-right: 2%;
  border-radius: 20px;
  overflow: hidden;
  filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25));

  transition: all 200ms linear;
  cursor: pointer;
}
.imgB {
  position: relative;
  top: -2%;
  left: -20%;
  height: 110%;
  filter: opacity(0.8);
  transition: all 400ms linear;
}
.BtnImg:hover > .imgB {
  transform: translateX(-25%);
}

.BtnImg:hover > .EtiquetaBotonImg {
  background-color: rgba(64, 129, 142, 0.8);
}
.ContenedorBtnSubir {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 80%;
  height: 20%;

}
.EtiquetaBotonImg {
  position: absolute;
  width: 100%;
  height: 20%;
  background-color: rgba(72, 171, 191, 0.8);
  z-index: 200;
  bottom: 0;
  justify-content: center;
  transition: all 400ms linear;
}

.tituloBtnImg {
  font-size: 25px;
  font-weight: 600;
  font-family: Arial, Helvetica, sans-serif;
  position: relative;
  top: 25%;
  text-align: center;
  color: white;
}
.BtnSubir {
  position: relative;
  width: 30%;
  height: 50%;
  background-color: #2db7b2;
  border-radius: 27px;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 15px;
  font-family: Arial, Helvetica, sans-serif;
  font-weight: 600;
}
.BtnSubir:hover {
  transition: all 200ms linear;
  background-color: #2d9894;
  cursor: pointer;
}
</style>