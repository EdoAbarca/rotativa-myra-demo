<script>
import { reactive } from 'vue'


export default {

props: ['tipo', 'valor'],

methods:{


  setColor(){
    const colorBase = {
      color : '#48ABBF'
    }
    if(this.tipo === 'Inasistencias'){
      colorBase.color = this.colorInasistencia(colorBase.color)
    }
    else if(this.tipo === 'Horas Extra'){
      colorBase.color = this.colorHorasExtras(colorBase.color)
    }
    else if(this.tipo === 'Licencias'){
      colorBase.color = this.colorLicencia(colorBase.color)
    }
    else if(this.tipo == 'Vacaciones'){
      colorBase.color = this.colorVacaciones(colorBase.color)
    }
    else{
      colorBase.color = '#48ABBF'
    }
    return colorBase
  },

  colorHorasExtras(color){
    if(this.valor > 0){ color = '#4CC97E'}
    return color;
  },
  colorVacaciones(color){
    if(this.valor > 0){ color = '#BEE493'}
    return color;
  },
  colorInasistencia(color){
    if(this.valor >= 2){ color = '#FF8E85';}
    return color
  },
  colorLicencia(color){
    if(this.valor > 0){ color = '#FFCA6D;';}
    return color
  }
},
}
</script>
<template>
  <div class="ContenedorEstadistica">
    <div id="tituloEstadistica">{{tipo}}</div>
    <div class="estadisticaNumerica" :style="setColor()" > {{valor}}</div>
  </div>
</template>
<style>
.ContenedorEstadistica{
  width: 25%;
  height: 75px;
  background-color: white;
  min-width: 30px;
  max-width: 120px;
  
  display: flex;
  align-items: center;
  text-align: center;
  flex-direction: column;
  margin: 2%;
  border-radius: 9px;
  filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.15));
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12px;
}
#tituloEstadistica{
  position: relative;
  display: flex;
  background-color: white;
  color: #48ABBF;
  width: 100%;
  height: 50%;
  justify-content: center;
  border-radius: 9px 9px 0px 0px;
  align-items: center;
  font-weight: 600;
  z-index: 1;
}
.estadisticaNumerica{
  position: relative;
  width: 100%;
  height: 55%;
  color: #48ABBF;
  z-index: 2;
  top: -8px;

  


  font-family: Arial, Helvetica, sans-serif;
  font-size: 30px;
  font-weight: 600;
}

</style>
