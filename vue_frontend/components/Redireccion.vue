<script>
import  ContenedorLogin  from "../components/ContenedorLogin.vue";
import ContenedorRegistro from "./ContenedorRegistro.vue";
export default{

    name: 'redireccion',
    data(){
        return{
            show: false
        }
    },
    components:{
    ContenedorLogin,
    ContenedorRegistro
},
    methods:{
        cambiar(id){
            if(id ==='redirCenter1'){
                document.getElementById('redirCenter1').style.zIndex = '1';
                document.getElementById('redirCenter1').style.opacity = '1';
                document.getElementById('redirCenter2').style.zIndex = '-100';
                document.getElementById('redirCenter2').style.opacity = '0';
                document.getElementById('redirCenter3').style.zIndex = '-100';
                document.getElementById('redirCenter3').style.opacity = '0';
            }
            if(id ==='redirCenter2'){
                document.getElementById('redirCenter2').style.zIndex = '1';
                document.getElementById('redirCenter2').style.opacity = '1';
                document.getElementById('redirCenter1').style.zIndex = '-100';
                document.getElementById('redirCenter1').style.opacity = '0';

            }

            if(id ==='redirCenter3'){
                document.getElementById('redirCenter3').style.zIndex = '1';
                document.getElementById('redirCenter3').style.opacity = '1';
                document.getElementById('redirCenter1').style.zIndex = '-100';
                document.getElementById('redirCenter1').style.opacity = '0';

            }
            
        }
    }
}
</script>
<template>
    <div class="contenedorRedireccion">
    <div class="redirTop"></div>
    <div class="redirTop topOtro"></div>
    <div class="reditBot"></div>
    <div class="reditBot botOtro"></div>
    <div class="fondoBlanco"></div>
    
    <div class="redirCenter" id="redirCenter1">
        <h2 class="tituloAcceso" id="tituloRotativa" >ROTATIVA MYRA</h2>
        <h2 class="tituloAcceso">Para acceder inicia sesión</h2>
        <v-btn class="botonAcceso" id="botonLogin" @click="cambiar('redirCenter2')">Inicia Sesión</v-btn>
        <v-btn class="botonAcceso" id="botonRegister" @click="cambiar('redirCenter3')">Registrate</v-btn>
    </div>
    
    <div class="redirCenter" id="redirCenter2">
        <ContenedorLogin/>
    </div>

    <div class="redirCenter" id="redirCenter3">
        <ContenedorRegistro/>
    </div>

    
        
    

    
</div>

</template>
<style>
.cuadrologin{
    background-color: white;
}
.tituloAcceso{
    height: 10%;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 15px;
    color: #669098;
}
#tituloRotativa{
    color: #005D71;
    font-weight: 700;
}
#botonLogin{
    position: relative;
    font-family: Arial, Helvetica, sans-serif;
    font-weight: 600;
    font-size: 12px;
    border-radius: 15px;
    width: 38%;
    background-color: #48abbf;
    color: white;
}

#botonRegister{
    position: relative;
    top: 3%;
    font-family: Arial, Helvetica, sans-serif;
    font-weight: 600;
    font-size: 12px;
    width: 30%;
    background-color: #CDCDCD;
    color: white;
}

.contenedorRedireccion {
	 position: absolute;
	 width: 100%;
	 height: 100%;
	 overflow: hidden;
}
 .contenedorRedireccion:hover .redirTop:before, .contenedorRedireccion:active .redirTop:before, .contenedorRedireccion:hover .reditBot:before, .contenedorRedireccion:active .reditBot:before, .contenedorRedireccion:hover .redirTop:after, .contenedorRedireccion:active .redirTop:after, .contenedorRedireccion:hover .reditBot:after, .contenedorRedireccion:active .reditBot:after {
	 margin-left: 200px;
	 transform-origin: -200px 50%;
	 transition-delay: 0s;
}
 .contenedorRedireccion:hover .redirCenter, .contenedorRedireccion:active .redirCenter {
	 opacity: 1;
	 transition-delay: 0.2s;
}
 .redirTop, .reditBot, .redirTop, .reditBot{
	 content: '';
	 display: block;
	 position: absolute;
	 width: 200vmax;
	 height: 200vmax;
	 top: 50%;
	 left: 50%;
	 margin-top: -100vmax;
	 transform-origin: 0 50%;
	 transition: all 0.5s cubic-bezier(0.445, 0.05, 0, 1);
	 z-index: 10;
	 opacity: 0.65;
	 transition-delay: 0.2s;

     margin-left: 200px;
	 transform-origin: -200px 50%;
	 transition-delay: 0s;
}
 .redirTop {
	 transform: rotate(45deg);
	 background: #e46569;
}
 .topOtro {
	 transform: rotate(135deg);
	 background: #2DB7B2;
}
 .reditBot {
	 transform: rotate(-45deg);
	 background: #005D71;
}
 .botOtro {
	 transform: rotate(-135deg);
	 background: #48ABBF;
}
 .redirCenter {
    background-color: white;
	 position: absolute;
	 width: 400px;
	 height: 400px;
	 top: 50%;
	 left: 38%;
	 margin-top: -200px;
	 display: flex;
     transition: all 200ms linear;
	 flex-direction: column;
	 justify-content: center;
	 align-items: center;
	 padding: 30px;
	 opacity: 0;
	 transition: all 0.5s cubic-bezier(0.445, 0.05, 0, 1);
	 transition-delay: 0s;
	 color: #333;
}

#redirCenter2, #redirCenter3{
    z-index: -100;
    opacity: 0;
}


 
</style>