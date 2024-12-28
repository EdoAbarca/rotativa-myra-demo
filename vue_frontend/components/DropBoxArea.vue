<script>
import{mapMutations,mapActions, mapState} from 'vuex'
export default{
    props:['page'],
    data() {
    return {
      
      opcion: '',
      idAnterior:"idbase",
      itemsArea: []
    }
  },
  computed:{
    ...mapState('selectores', ['selectorArea','selectorTurno']),

  },

  methods:{
    
    ...mapMutations({
        catProfesional: 'profesional/elegirCategoria',
        catPaciente: 'paciente/elegirCategoria',
    }),
    ...mapActions('profesional',[
            'fetchProfesionales',
            'filtrarArea'       
        ]),
    ...mapActions('paciente',[
            'fetchPacientes',
            'filtrarTurnos'       
        ]),
    ...mapActions('selectores',[
            'fetchSelectoresArea',
            'fetchSelectoresTurno',             
        ]),
    filtro(valor){

      document.getElementById("dropdown2").checked = false;

      if(valor === 1){
        valor = null;
        this.fetchProfesionales();
      }
      else{
          if(this.page==='profesionales'){
          this.catProfesional(valor);
          this.filtrarArea();
          }
          if(this.page==='pacientes'){
          this.catPaciente(valor);
          this.filtrarTurnos();
        }

      }
      

      
    },
    ocultar(id){
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
  mounted(){
   
    //this.fetchSelectoresArea;
    //console.log('selectoresArea',this.selectorArea);
  }
}

</script>

<template>
     

  	<form class="sec-center2" id="combobox2">

        <input v-if="page === 'profesionales'" class="dropdown2" type="checkbox" id="dropdown2" name="dropdown2" @click="fetchSelectoresArea"/>
        <input v-else-if="page === 'pacientes'" class="dropdown2" type="checkbox" id="dropdown2" name="dropdown2" @click="fetchSelectoresTurno"/>
	  	  <label class="for-dropdown2" for="dropdown2" @click="ocultar('combobox2')" >
          <h1 id="textoDropBox" v-if="page ==='profesionales'">Área - {{opcion}}</h1>
          <h1 id="textoDropBox" v-if="page ==='pacientes'">Turno - {{opcion}}</h1>
          
        <div class="uil2"></div></label>

	  
  		<div class="section-dropdown2"> 
            <div class="columna" v-if="page == 'profesionales'">
                <div class="contenedorEleccion2" 
                  v-for="(itema) in selectorArea"
                  :key="itema.id"
                  :id = "'itemArea'+itema.id"
                  >
                  <input  class="Radio-eleccion2" 
                    :id="itema.nombreArea" 
                    type="radio" 
                    :value="itema.nombreArea" 
                    v-model ="opcion" 
                    @click="filtro(itema.id)"/>
                  <label  class="elementoSelect" 
                    :for="itema.nombreArea"
                    >
                    {{ itema.nombreArea }}
                  </label>
                </div>
            </div>

            <div class="columna" v-if="page == 'pacientes'">
                <div class="contenedorEleccion2" 
                  v-for="(itema) in selectorTurno"
                  :key="itema.id"
                  :id = "'itemArea'+itema.id"
                  >
                  <input  class="Radio-eleccion2" 
                    :id="itema.tipoTurno" 
                    type="radio" 
                    :value="itema.tipoTurno" 
                    v-model ="opcion" 
                    @click="filtro(itema.id)"/>
                  <label  class="elementoSelect" 
                    :for="itema.tipoTurno"
                    >
                    {{ itema.tipoTurno }}
                  </label>
                </div>
            </div>

        </div>
  	</form>

</template>
<style>
.sec-center2 {
  position: relative;
  width: 35%;
  min-width: 200px;
  max-height: 36px;
  
  z-index: 200;
  box-sizing: border-box;
  border-radius: 0px 0px 8px 0px;
  background-color: #D9D9D9;
  
  color:gray ;
}

.contenedorEleccion2{
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
.contenedorEleccion2:hover {
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

.section-dropdown2{
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

.dropdown2:checked ~ .section-dropdown2{
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
  
}

.section-dropdown2:before {
  position: absolute;
  top: -20px;
  left: 0;
  width: 100%;
  content: '';
  display: block;
  z-index: 1;
  
  
}
.section-dropdown2:after {
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

.dropdown2:checked + .for-dropdown2,
.dropdown2:not(:checked) + .for-dropdown2{

  position: relative;
  width: 85%;
  border-radius: 4px;
  border: none;
  box-shadow: 0 12px 35px 0 rgba(255,235,167,.15);

  cursor: pointer;
  display: inline-block;
  
}
.dropdown2:checked + .for-dropdown2:before,
.dropdown2:not(:checked) + .for-dropdown2:before{
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
.dropdown2:checked + .for-dropdown2:before{
    pointer-events: auto;
}
.dropdown2:not(:checked) + .for-dropdown2 .uil2 {
  font-size: 24px;
  margin-left: 10px;
  transition: transform 200ms linear;
}
.dropdown2:checked + .for-dropdown2 .uil2 {
  transform: rotate(180deg);
  font-size: 24px;
  margin-left: 10px;
  transition: transform 200ms linear;
}

.for-dropdown2{

    position: relative;
    display: flex;
    height: 26px;
    align-items: center;
    justify-content: center;
    vertical-align: middle;
    
    background-color: white;

}
#textoDropBox{
  top: 4px;
  left: 10px;
  position: relative;
  display: flex;
  font-size: 14px;
  font-weight: 400;
  align-items: center;  


}

.uil2{
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
.Radio-eleccion2{
    opacity: 0;
}
.dropdown2:hover + .for-dropdown2 .uil2 {
    
    transition: all 200ms linear;
    border-top: 10px solid #D9D9D9;
}

.dropdown2:checked:hover + .for-dropdown2:hover,
.dropdown2:not(:checked):hover + .for-dropdown2:hover{
    color: #D9D9D9;

    transition: all 200ms linear;
}


</style>