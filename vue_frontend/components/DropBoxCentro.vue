<script>
import{mapMutations,mapActions, mapState} from 'vuex'
export default{
    props:['page'],
    data() {
    return {
      opcion: '',
      idAnterior:"idbase",
    }
  },

  computed:{
    ...mapState('selectores', ['selectorCentro','selectorCliente','selectorAlertas']),

  },
  methods:{

    ...mapMutations({
        catProfesional: 'profesional/elegirCategoria',
        catPaciente: 'paciente/elegirCategoria',
        catCoord: 'coordinador/elegirCategoria',
        catAlerta: 'alertas/elegirCategoria',
        elegirSelector: 'selectores/elegirSelector',
    }),

    
    ...mapActions('profesional',[
            'fetchProfesionales',
            'filtrarCentro'       
        ]),

    ...mapActions('alertas',[
            'fetchAlertas',
            'filtrarTipoAlerta'       
        ]),
    ...mapActions('coordinador',[
            'fetchCoordinadores',
            'filtrarCentroCoord'       
        ]),
    ...mapActions('paciente',[
            'fetchPacientes',
            'filtrarCliente'       
        ]),
    ...mapActions('selectores',[
            'fetchSelectoresCentro',
            'fetchSelectoresCliente',
            'fetchSelectoresAlerta',              
        ]),
    filtro(valor){

      document.getElementById("dropdown").checked = false;

      if(valor === 1){
        valor = null;
        if(this.page === 'profesionales'){
          this.fetchProfesionales();
        }
        if(this.page==='pacientes'){
          this.fetchPacientes();
        }

        if(this.page==='alertas'){

          this.fetchAlertas();
        }
        if(this.page === 'coordinadores'){

          this.fetchCoordinadores();
        }
      }
      else{
        if(this.page === 'profesionales'){
          this.catProfesional(valor);
          this.filtrarCentro();
        }
        if(this.page==='pacientes'){
          this.catPaciente(valor);
          this.filtrarCliente();
        }

        if(this.page==='alertas'){
          this.catAlerta(valor);
          this.filtrarTipoAlerta();
        }
        if(this.page === 'coordinadores'){
          this.catCoord(valor);
          this.filtrarCentroCoord();
        }

      }
      
      
    },
    ocultar(id){
      if(this.page == 'alertas' || this.page =='coordinadores'){
          document.getElementById('combobox1').style.zIndex = '150';
      }
      else{
        if(id ==='combobox2'){
                document.getElementById('combobox1').style.zIndex = '150';
                document.getElementById('combobox2').style.zIndex = '200';
      }
      else{
          document.getElementById('combobox2').style.zIndex = '150';
          document.getElementById('combobox1').style.zIndex = '200';
      }

    }
      

    },
    estiloBorde(){
      if(this.page == 'alertas' || this.page == 'coordinadores'){
        return 'border-radius: 0px 0px 8px 8px'
      }
      else if(this.page == 'profesionales'|| this.page == 'pacientes'){
        return 'border-radius: 0px 0px 0px 8px'
      }
      else{
        return 'border-radius: 0px 0px 0px 8px'
      }
    }
  }
}

</script>

<template>
     

  	<form class="sec-center" id="combobox1" :style="estiloBorde()">

      
      <input v-if="page == 'profesionales' || page == 'coordinadores'" class="dropdown" type="checkbox" id="dropdown" name="dropdown" @click="fetchSelectoresCentro">
      <input v-if="page == 'pacientes'" class="dropdown" type="checkbox" id="dropdown" name="dropdown" @click="fetchSelectoresCliente">
	  	<input v-if="page == 'alertas'" class="dropdown" type="checkbox" id="dropdown" name="dropdown" @click="fetchSelectoresAlerta">
      <label class="for-dropdown" for="dropdown" @click="ocultar('combobox1')">
          <h1 id="textoDropBox" v-if="page ==='profesionales'">Centro - {{opcion}}</h1>
          <h1 id="textoDropBox" v-if="page ==='pacientes'">Cliente - {{opcion}}</h1>
          <h1 id="textoDropBox" v-if="page ==='coordinadores'">Centro - {{opcion}}</h1>
          <h1 id="textoDropBox" v-if="page ==='alertas'">Tipo - {{opcion}}</h1>
        <div class="uil"></div>
      </label>

	  
  		<div class="section-dropdown"> 
          <div class="columna" v-if="page == 'profesionales' || page == 'coordinadores'">
                <div class="contenedorEleccion"
                  v-for="(item) in selectorCentro"
                  :key="item.id"
                  :id = "'itemCentro'+item.id"
                  >
                    <input  class="Radio-eleccion" 
                    :id="item.nombreCentro" 
                    type="radio" 
                    :value="item.nombreCentro" 
                    v-model ="opcion" 
                    @click="filtro(item.id)" 
                    />
                    <label  class="elementoSelect" 
                    :for="item.nombreCentro"
                    >
                    {{ item.nombreCentro }}
                  </label>
                </div>
              </div>
              <div class="columna" v-if="page == 'pacientes'">
                <div class="contenedorEleccion"
                  v-for="(item) in selectorCliente"
                  :key="item.id"
                  :id = "'itemCentro'+item.id"
                  >
                    <input  class="Radio-eleccion" 
                    :id="item.nombreCliente" 
                    type="radio" 
                    :value="item.nombreCliente" 
                    v-model ="opcion" 
                    @click="filtro(item.id)" 
                    />
                    <label  class="elementoSelect" 
                    :for="item.nombreCliente"
                    >
                    {{ item.nombreCliente }}
                  </label>
                </div>
              </div>

              <div class="columna" v-if="page == 'alertas'">
                <div class="contenedorEleccion"
                  v-for="(item) in selectorAlertas"
                  :key="item.id"
                  :id = "'itemCentro'+item.id"
                  >
                    <input  class="Radio-eleccion" 
                    :id="item.tipoAlerta" 
                    type="radio" 
                    :value="item.tipoAlerta" 
                    v-model ="opcion" 
                    @click="filtro(item.id)" 
                    />
                    <label  class="elementoSelect" 
                    :for="item.tipoAlerta"
                    >
                    {{ item.tipoAlerta }}
                  </label>
                </div>
              </div>

        </div>
  	</form>

</template>
<style>
.sec-center {
  position: relative;
  width: 35%;
  min-width: 200px;
  max-height: 36px;
  
  z-index: 200;
  box-sizing: border-box;
  border-radius: 0px 0px 0px 8px;
  background-color: #D9D9D9;
  color:gray ;
}

.contenedorEleccion{
  color: #48ABBF;
    position: relative; 
    box-sizing: border-box;
    
    width: 99%;
    display: flex;
    min-height: 30px;

    transition: all 200ms linear;
    font-family: 'Roboto', sans-serif;
    font-weight: 400;
    font-size: 15px;
    vertical-align: middle;
    
    padding-left: 10px;
    margin: 2px 0;

    border-radius: 3px;

    
}
.contenedorEleccion:hover {
  color: white;
  background-color: #48ABBF;
}

.columna{
  position: relative;
    display: flex;
    width: 100%;
    max-height: 240px;
    flex-direction: column;
    overflow-y:scroll;
    box-sizing: border-box;
}
.elementoSelect{
  display: flex;
    width: 100%;
    height: 100%;
    cursor: pointer;
    font-display: flex;
    align-items: center;
    vertical-align: middle;
}

.section-dropdown{
  position: relative;
  width: 230px;
  top: 20px;
  box-sizing: border-box;

  background-color: white;
  border-radius: 4px;
  padding: 5px;
  box-shadow: 0 14px 35px 0 rgba(9,9,12,0.4);
  
  display: flex;
  flex-direction: row;
  z-index: 300;

  opacity: 0;
  pointer-events: none;
  transform: translateY(20px);
  transition: all 200ms linear;
  
}
[type="checkbox"]:checked,
[type="checkbox"]:not(:checked){
  position: relative;
  left: 0px;
  opacity: 0;
  pointer-events: none;
}

.dropdown:checked ~ .section-dropdown{
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
}


.section-dropdown:before {
  position: absolute;
  top: -20px;
  left: 0;
  width: 100%;
  content: '';
  display: block;
  z-index: 1;
  
}
.section-dropdown:after {
  position: absolute;
  top: -7px;
  left: 30px;
  width: 0; 
  height: 0; 
  border-left: 8px solid transparent;
  border-right: 8px solid transparent; 
  border-bottom: 8px solid white;
  content: '';
  display: block;
  z-index: 2;
  transition: all 200ms linear;

  
}

.dropdown:checked + .for-dropdown,
.dropdown:not(:checked) + .for-dropdown{

  position: relative;
  width: 85%;
  border-radius: 4px;
  border: none;
  box-shadow: 0 12px 35px 0 rgba(255,235,167,.15);

  cursor: pointer;
  display: inline-block;


  
}
.dropdown:checked + .for-dropdown:before,
.dropdown:not(:checked) + .for-dropdown:before{
  position: fixed;
  top: 0;
  left: 0;
  content: '';
  width: 100%;
  height: 100%;
  z-index: -1;
  cursor: auto;
  pointer-events: none;
  
}
.dropdown:checked + .for-dropdown:before{
    pointer-events: auto;
}
.dropdown:not(:checked) + .for-dropdown .uil {
  font-size: 24px;
  margin-left: 10px;
  transition: transform 200ms linear;
}
.dropdown:checked + .for-dropdown .uil {
  transform: rotate(180deg);
  font-size: 24px;
  margin-left: 10px;
  transition: transform 200ms linear;
}

.for-dropdown{

    position: relative;
    display: flex;
    height: 26px;
    align-items: center;
    justify-content: center;
    vertical-align: middle;
    
    background-color: white;

}


.uil{
    position: relative;
    left: 80%;
    bottom: 40%;
    z-index: 2001;
    width: 0; 
    height: 0; 
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 10px solid #B9B8B8;
}
.Radio-eleccion{
    opacity: 0;
}
.dropdown:hover + .for-dropdown .uil {
    
    transition: all 200ms linear;
    border-top: 10px solid #D9D9D9;
}

.dropdown:checked:hover + .for-dropdown:hover,
.dropdown:not(:checked):hover + .for-dropdown:hover{
    color: #D9D9D9;
    transition: all 200ms linear;
}


</style>