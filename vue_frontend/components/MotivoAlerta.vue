<script>
export default {
    data(){
        return{
            tipoEstado: ''
        }
    },
    props: ['estado', 'id','fecha','desc'],

    methods:{

        elegirColor(){
            console.log(this.estado)
            let colorArea='#D9D9D9';
            switch(this.estado){
                case 2:
                    this.tipoEstado = 'Inasistencia'
                    colorArea = "#E67070";
                    break
                case 3:
                    this.tipoEstado = 'Paciente Complejo'
                    colorArea = "#FE9F47";
                    break
                case 4:
                    this.tipoEstado = 'Exceso Horas'
                    colorArea = "#B6D673";
                    break
                default:
                    this.tipoEstado = 'Otro'
                    colorArea = "#BA99BF"
            }
            return 'background-color: '+ colorArea+';'

            }

        }

    }
</script>
<template>
    <div class="motivoAleta" :style="elegirColor()" >
        <div id="contenedortitulosAlerta">
            <div id="tituloAlerta">Motivo: {{tipoEstado}}</div>
            <div id="fechaMotivoAlerta"> Fecha: {{ fecha }}</div>
        </div>

        
        <div id="contenidoAlerta">
            <div id="detalleAlerta">Detalle: {{ desc }}</div>
        </div>
    </div> 
</template>
<style>
#contenedortitulosAlerta{
    margin-top: 15px;
    position: relative;
    padding-left: 20px;
    display: flex;
    flex-direction: row;
    justify-content: left;

    width: 100%;
    height: 25px;
}
#fechaMotivoAlerta{
    display: flex;
    position: relative;
    justify-content: center;
    height: 100%;
    width: 50%;
    
}
#contenidoAlerta{
    padding-left: 20px;
    position: relative;
    height: 60%;
    width: 100%;

}
#tituloAlerta{
    height: 100%;
    width: 50%;
    position: relative;
    display: flex;
    justify-content: left;
    align-items: center;
}
.motivoAleta{
    overflow: hidden;
    display: flex;
    flex-direction: column;
    position: relative;
    width: 93%;
    height: 85%;
    color: white;
    background-color: blue;
    border-radius: 9px;
    font-size: 15px;
    font-family: Arial, Helvetica, sans-serif;
    font-weight: 600;
    line-height: 25px;
    filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.15));
}
</style>