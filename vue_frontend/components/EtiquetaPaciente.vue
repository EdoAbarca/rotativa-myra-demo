<script>
export default {
    data(){
        return{
            tipocliente: '',
            tipoturno:''
        }
    },
    props: ['cliente', 'turno'],

    methods:{

        elegirColorturno(){
            let colorturno='#D9D9D9';
            switch(this.turno){
                case 1:
                    this.tipoturno = '2 Hrs'
                    colorturno = "#FF8E85";
                    break
                case 2:
                    this.tipoturno = '4 Hrs'
                    colorturno = "#BEB5A6";
                    break
                case 3:
                    this.tipoturno = '6 Hrs'
                    colorturno = "#2DB7B2";
                    break
                case 4:
                    this.tipoturno = '8 Hrs'
                    colorturno = "#45CBDC";
                    break
                case 5:
                    this.tipoturno = '10 Hrs'
                    colorturno = "#83DEEB";
                    break
                case 6:
                    this.tipoturno = '12 Hrs'
                    colorturno = "#BEE493";
                    break
                case 7:
                    this.tipoturno = '24 Hrs'
                    colorturno = "#B4B1EB";
                    break
                case 8:
                    this.tipoturno = 'Otro'
                    colorturno = "#95919E";
                    break
                default:
                    colorturno = "'#D9D9D9'"
            }
            colorturno = "#CDCDCD"
            return 'background-color: '+ colorturno+';'

            },

        
        elegirColorcliente(){
            console.log(this.cliente)
            let colorturno='#D9D9D9';
            switch(this.cliente){
                case 1:
                    this.tipocliente = 'ACHS'
                    colorturno = "#FF8E85";
                    break
                case 2:
                    this.tipocliente = 'Human Solution'
                    colorturno = "#45CBDC";
                    break
                case 3:
                    this.tipocliente = 'ISL'
                    colorturno = "#FFA7B5";
                    break
                case 4:
                    this.tipocliente = 'Mutual'
                    colorturno = "#A994C0";
                    break
                case 5:
                    this.tipocliente = 'Particular'
                    colorturno = "#BEB5A6";
                    break
                case 6:
                    this.tipocliente = 'Residencia'
                    colorturno = "#BEB5A6";
                    break
                case 7:
                    this.tipocliente = 'Otro'
                    colorturno = "#BEB5A6";
                    break
                default:
                    colorturno = "'#D9D9D9'"
            }
            
            return 'background-color: '+ colorturno+';'

            },
        elegirColor(){
            if(this.cliente != null){
                return this.elegirColorcliente()
            }
            else{
                return this.elegirColorturno()
            }
        },

 }
        

    }
</script>
<template>
    <div class="EtiquetaProfesional" id="etiquetaColor" v-if="cliente!==null" :style="elegirColor()">{{ tipocliente }}</div> 
    <div class="EtiquetaProfesional tipo1" id="etiquetaTransparente" v-else :style="elegirColor()">{{ tipoturno }}</div> 
</template>
<style>
</style>