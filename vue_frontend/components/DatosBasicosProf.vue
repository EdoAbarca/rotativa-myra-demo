<script>
import EtiquetaProfesional from './EtiquetaProfesional.vue';
import { mapState, mapMutations, mapGetters, mapActions} from 'vuex'
export default {

props: ['nombre','rut','area','centro','coordinador','contrato', 'idCoord'],
computed:{
},
methods:{
    ...mapMutations({
            mostrar: 'coordinador/mostrar',
        }),
        ...mapActions('coordinador',[
            'fetchCoordinador'       
        ]),
        
        direccionar(id){
            this.fetchCoordinador(id)
            this.$router.push('/coordinadores') 
        }
}

}
</script>
<template>
    <div class="ContenedorBaseDatos"  >
        <div id="tituloDatosProfesional">Datos del Profesional
            <span id ="separador"></span>
        </div>
        <div class="Cont-Info-Basica" >
            <div id="datosIzquierdaBasico">
                <h1 id="nombreEntidad" class="TextoContenido">Nombre: {{ nombre }}</h1>
                <h1 id="rutEntidad" class="TextoContenido">Rut: {{ rut }}</h1>
                <h1 id ="cargoEntidad" class="TextoContenido">Cargo: {{ area }}</h1>
            </div>
            <div id="datosDerechaBasico">
                <EtiquetaProfesional id="etiquetaEnDatos"   :centro ="centro" :area="null" />
                <EtiquetaProfesional id="etiquetaEnDatos"  :centro="null" :area="area"  />
            </div>
        </div>
        <div class="Cont-Coord" >
            <div id="datosIzquierdaCoord">
                <h1 id="nombreCoord" class="TextoContenido" @click="direccionar(idCoord),mostrar(idCoord)" >Coordinador: {{ coordinador }}</h1>
                
            </div>
            <div id="datosDerechaCoord">
                <h1 id="contrato" class="TextoContenido" >Contrato: {{ contrato }}</h1>
            </div>
        </div>

    </div>
</template>
<style>

#separador{
    top: 2px;
    position: relative;
    display: flex;
    width: 90%;
    height: 1px;
    background-color: #E9E9E9;
}
#nombreEntidad{  
    font-weight: 600;
    color: #005D71;
}

#nombreEntidad, #rutEntidad, #cargoEntidad{
    margin-left: 15%;
    height: 35px;
    
} 

#nombreCoord{
    margin-left: 7%;
    display: flex;
    position: relative;
    align-items: center;
    font-weight: 600;
    color: #0893B0;
    transition: all 200ms linear;
    cursor: pointer;
}
#contrato{
    width: 100%;
    height: 100%;
    margin-left: 7%;
    position: relative;
    display: flex;
    font-weight: 500;
    color: #0893B0;
    align-items: center;
}
#nombreCoord:hover{
    color: #45CBDC;
}

.ContenedorBaseDatos{
    position: relative;
    display: flex;
    width: 93%;
    height: 100%;
    flex-direction: column;
    font-family: Arial, Helvetica, sans-serif;
    transition: all 200ms linear;
    filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.15));
    caret-color: transparent;

}
.TextoContenido{
    position: relative;
    display: flex;
    align-items: center;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 13px;
    font-weight: 500;
    width: 100%;
    height: 100%;
    color: #253C41;
}
#tituloDatosProfesional{
    position: relative;
    display: flex;
    text-align: center;
    width: 100%;
    height: 20%;
    border-radius: 12.5px 12.5px 0px 0px;

    background-color: white;
    color: #669098;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
    flex-direction: column;

    
    
}
.Cont-Info-Basica{
    position: relative;
    display: flex;
    width: 100%;
    height: 55%;
    flex-direction: row;
    background-color: white;
    
}
.Cont-Coord{
    color: #005D71;
    position: relative;
    display: flex;
    width: 100%;
    height: 20%;
    flex-direction: row;
    background-color: #DEEFF2;
    border-radius: 0px 0px 12.5px 12.5px;
    
}
#datosIzquierdaBasico{
    position: relative;
    display: flex;
    flex-direction: column;
    width: 70%;
    height: 100%;
    align-items: center;
}
#datosDerechaBasico{
    position: relative;
    display: flex;
    width: 25%;
    height: 100%;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    left: 3%;

}
#etiquetaEnDatos{
    top: 2px;
}

#datosIzquierdaCoord{
    position: relative;
    display: flex;
    flex-direction: column;
    width: 75%;
    height: 100%;
    
}
#datosDerechaCoord{
    
    position: relative;
    display: flex;
    width: 25%;
    height: 100%;
    align-items: center;
    flex-direction: column;
}




</style>