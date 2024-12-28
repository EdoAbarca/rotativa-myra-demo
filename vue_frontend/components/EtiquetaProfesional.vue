<script>
export default {
    data(){
        return{
            tipoCentro: '',
            tipoArea:''
        }
    },
    props: ['centro', 'area'],

    methods:{

        elegirColorArea(){
            let colorArea='#D9D9D9';
            switch(this.area){
                case 1:
                    this.tipoArea = 'Administradores'
                    colorArea = "#FF8E85";
                    break
                case 2:
                    this.tipoArea = 'Auxiliares'
                    colorArea = "#BEB5A6";
                    break
                case 3:
                    this.tipoArea = 'Coordinadores'
                    colorArea = "#2DB7B2";
                    break
                case 4:
                    this.tipoArea = 'Cuidadores'
                    colorArea = "#45CBDC";
                    break
                case 5:
                    this.tipoArea = 'Enfermeros'
                    colorArea = "#83DEEB";
                    break
                case 6:
                    this.tipoArea = 'Fonoaudiólogos'
                    colorArea = "#BEE493";
                    break
                case 7:
                    this.tipoArea = 'Kinesiólogos'
                    colorArea = "#B4B1EB";
                    break
                case 8:
                    this.tipoArea = 'Médicos'
                    colorArea = "#FFA7B5";
                    break
                case 9:
                    this.tipoArea = 'Nutricionistas'
                    colorArea = "#F887A1";
                    break
                case 10:
                    this.tipoArea = 'Podólogos'
                    colorArea = "#A994C0";
                    break
                case 11:
                    this.tipoArea = 'Practicantes'
                    colorArea = "#F0ACFB";
                    break
                case 12:
                    this.tipoArea = 'TENS'
                    colorArea = "#FFB781";
                    break
                case 13:
                    this.tipoArea = 'Terapeutas'
                    colorArea = "#FFB781";
                    break
                case 14:
                    this.tipoArea = 'Otro'
                    colorArea = "#95919E";
                    break
                default:
                    colorArea = "'#D9D9D9'"
            }
            colorArea = "#CDCDCD"
            return 'background-color: '+ colorArea+';'

            },

        
        elegirColorCentro(){
            console.log(this.centro)
            let colorArea='#D9D9D9';
            switch(this.centro){
                case 1:
                    this.tipoCentro = 'Administración'
                    colorArea = "#FF8E85";
                    break
                case 2:
                    this.tipoCentro = 'Cuidados'
                    colorArea = "#45CBDC";
                    break
                case 3:
                    this.tipoCentro = 'Residencia'
                    colorArea = "#FFA7B5";
                    break
                case 4:
                    this.tipoCentro = 'Hotel Clínico'
                    colorArea = "#A994C0";
                    break
                case 5:
                    this.tipoCentro = 'SMI'
                    colorArea = "#BEB5A6";
                    break
                case 6:
                    this.tipoCentro = 'Otro'
                    colorArea = "#BEB5A6";
                    break
                default:
                    colorArea = "'#D9D9D9'"
            }
            
            return 'background-color: '+ colorArea+';'

            },
        elegirColor(){
            if(this.centro != null){
                return this.elegirColorCentro()
            }
            else{
                return this.elegirColorArea()
            }
        },

 }
        

    }
</script>
<template>
    <div class="EtiquetaProfesional" id="etiquetaColor" v-if="centro!==null" :style="elegirColor()">{{ tipoCentro }}</div> 
    <div class="EtiquetaProfesional tipo1" id="etiquetaTransparente" v-else :style="elegirColor()">{{ tipoArea }}</div> 
</template>
<style>
.EtiquetaProfesional{
    display: flex;
    position: relative;
    justify-content: center;
    width: 80%;
    min-width: 95px;
    height: 25px;
    color: white;
    border-radius: 5px;
    font-size: 75%;
    font-family: Arial, Helvetica, sans-serif;
    font-weight: 600;
    line-height: 25px;
    margin: 2%;
}
</style>