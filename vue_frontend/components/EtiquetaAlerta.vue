<script>
export default {
    data(){
        return{
            tipoEstado: ''
        }
    },
    props: ['estado', 'id'],

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
                    this.tipoEstado = 'P. Complejo'
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
    <div class="EtiquetaAsistencia" :style="elegirColor()">{{ tipoEstado }}</div> 
</template>
<style>
.EtiquetaAsistencia{
    
    text-align: center;
    position: relative;
    width: 80%;
    height: 25px;
    color: white;
    border-radius: 9px;
    font-size: 12px;
    font-family: Arial, Helvetica, sans-serif;
    font-weight: 600;
    line-height: 25px;
}
</style>