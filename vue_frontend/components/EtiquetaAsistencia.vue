<script>
export default {
    data(){
        return{
            tipoEstado: ''
        }
    },
    props: ['estado'],

    methods:{

        elegirColor(){
            console.log(this.estado)
            let colorArea='#D9D9D9';
            switch(this.estado){
                case 1:
                    this.tipoEstado = 'Asiste'
                    colorArea = "#96DFB3";
                    break
                case 2:
                    this.tipoEstado = 'Inasistencia'
                    colorArea = "#FB8989";
                    break
                case 3:
                    this.tipoEstado = 'Justificado'
                    colorArea = "#FFCA6D";
                    break
                default:
                    colorArea = "'#D9D9D9'"
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