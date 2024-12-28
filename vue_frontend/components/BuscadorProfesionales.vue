<script>
import DropBoxCentro from './DropBoxCentro.vue'
import DropBoxArea from './DropBoxArea.vue'
import {mapMutations, mapActions, mapState} from 'vuex'


export default {
    props:['page']
    ,
    data(){
        return{
            datoBuscado:null

        }
    },
    components: {
    DropBoxCentro,
    DropBoxArea,

},
    methods:{
        ...mapState('profesional',[
            'dataProfesionales'       
        ]),
        ...mapMutations({
            setDatoPorBuscar: 'profesional/setDatoPorBuscar'
        }),

        ...mapMutations({
            setDatoPorBuscarPaci: 'paciente/setDatoPorBuscar'
        }),

        ...mapMutations({
            setDatoPorBuscarCoord: 'coordinador/setDatoPorBuscar'
        }),

        ...mapMutations({
            setDatoPorBuscarAlerta: 'alertas/setDatoPorBuscar'
        }),
        ...mapActions('profesional',[
            'fetchProfesionales',
            'buscarProfesional'       
        ]),

        ...mapActions('paciente',[
            'fetchPacientes',
            'buscarPaciente'       
        ]),

        ...mapActions('coordinador',[
            'fetchCoordinadores',
            'buscarCoordinador'       
        ]),

        ...mapActions('alertas',[
            'fetchAlertas',
            'buscarAlerta'       
        ]),
        
        buscarProfesionales(){
            //this.fetchProfesionales();
            if(this.datoBuscado ===''){
                this.setDatoPorBuscar(null);
                this.fetchProfesionales();
            }
            else{
                
                this.setDatoPorBuscar(this.datoBuscado);
                this.buscarProfesional();    
            } 

        },
        buscarPacientes(){
            if(this.datoBuscado ===''){
                this.setDatoPorBuscarPaci(null);
                this.fetchPacientes();
            }
            else{
                
                this.setDatoPorBuscarPaci(this.datoBuscado);
                this.buscarPaciente();
                console.log(this.dataPacientes)     
            } 
        },
        buscarCoordinadores(){
            if(this.datoBuscado ===''){
                this.setDatoPorBuscarCoord(null);
                this.fetchCoordinadores();
            }
            else{
                
                this.setDatoPorBuscarCoord(this.datoBuscado);
                this.buscarCoordinador();  
            } 
        },

        buscarAlertas(){
            if(this.datoBuscado ===''){
                this.setDatoPorBuscarAlerta(null);
                this.fetchAlertas();
            }
            else{
                
                this.setDatoPorBuscarAlerta(this.datoBuscado);
                this.buscarAlerta();  
            } 
        },
        buscar(){
            if(this.page === 'profesionales'){
                this.buscarProfesionales();
            }
            else if (this.page === 'pacientes'){
                this.buscarPacientes();
            }
            else if (this.page === 'coordinadores'){
                this.buscarCoordinadores();
            }
            else if (this.page === 'alertas'){
                this.buscarAlertas();
            } 
        }

    }
  }
</script>

<template>
    <div class="ContenedorBuscador">
        <div class="BarraBusqueda">

            <input type="search" placeholder="Buscar un individuo" id="buscador" v-model="datoBuscado" @keyup.enter="buscar()"/>
            <v-btn
                id="btnBuscar"
                fab
                width="33px"
                height="33px"
                color = "#D9D9D9"
                elevation="0"
                dark
                @click="buscar()"
            >
            <v-icon
                medium
                color="white"
                >
                mdi-magnify
            </v-icon>
            </v-btn>
            </div>
        <div class="BarraFiltro" v-if="page==='profesionales'">
            <DropBoxCentro :page="page" />
            <DropBoxArea :page="page" />
            
            
        </div>
        <div class="BarraFiltro" v-if="page==='pacientes'">
            <DropBoxCentro :page="page" />
            <DropBoxArea :page="page" />
        </div>

        <div class="BarraFiltro" v-if="page==='alertas'">
            <DropBoxCentro :page="page" />
        </div>
        <div class="BarraFiltro" v-if="page==='coordinadores'">
            <DropBoxCentro :page="page" />
        </div>
    </div>
</template>

<style>
#btnBuscar{
    left: 1%;
}
.ContenedorBuscador{
    position: relative;
    display: flex;
    flex-direction: column;
    width: 90%;
    height: 90px;
    font-family: Arial, Helvetica, sans-serif;

    
}
.BarraBusqueda{
    
    position: relative;
    display: flex;
    width: 100%;
    height: 60%;
    min-width: 500px;

    border-radius: 8px 8px 8px 0px;
    background-color: #D9D9D9;
    
    flex-direction: row;
    align-items: center;
    filter: drop-shadow(0px 1px 1px rgba(0, 0, 0, 0.1));
}
.BarraFiltro{
    position: relative;
    display: flex;
    width: 100%;
    height: 40%;


}


#buscador{
    position: relative;
    width: 90%;
    height: 30px;
    display: flex;
    border-radius: 8px;
    margin-left: 18px;
    padding-left: 8px;
    padding-right: 2%;
    border: #D9D9D9 1px solid ;
    transition: all 200ms linear;
    font-size: 15px;
    caret-color: gray;

    background-color: white;
    color: #919191;
    
    outline: none;
}
#buscador:focus, #buscador:hover{
    background-color: white;
    height: 30px;
    border: #C4C4C4 1px solid ;
    
}
#buscador::placeholder{
    font-size: 15px;
    font-weight: 500;
    
    color: gray;
    transition: all 200ms linear;
}
#buscador:hover::placeholder{
    font-size: 15px;
    font-weight: 500;
    color: #D9D9D9;
    
}

#buscador:hover ~ .BotonBusqueda::before{
    background-color: #C4C4C4;
}
#buscador:focus ~ .BotonBusqueda::before{
    background-color: #C4C4C4;
}

</style>