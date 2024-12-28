<script>
import { mapState, mapGetters } from 'vuex'
import { mapMutations,mapActions } from 'vuex'
import EtiquetaPaciente from './EtiquetaPaciente.vue';

import EtiquetaAlerta from './EtiquetaAlerta.vue';
export default {
    name:'PacienteLista',
    components: {
    EtiquetaPaciente,
    EtiquetaAlerta
},
    props: ['nombrePac','nombreProf','fecha','tipoAlerta','idProf','idPac','motivo', 'id'],


    computed:{
    },
    methods:{
        ...mapMutations({
            mostrarPac: 'paciente/mostrar',
            mostrarProf: 'profesional/mostrar',
        }),
        ...mapActions('paciente',[
            'fetchPaciente'       
        ]),
        ...mapActions('profesional',[
            'fetchProfesional'       
        ]), 
        ...mapActions('alertas',[
            'fetchAlerta'       
        ]), 
    }
}
</script>
<template>
    <div tabindex="0" class="AlertaLista" 
    @click="fetchAlerta(id),fetchPaciente(idPac),mostrarPac(idPac),fetchProfesional(idProf),mostrarProf(idProf)"
    >
        <div class="contenedorEtiquetaAlerta">
            <EtiquetaAlerta :estado="tipoAlerta"/>
        </div>
        <div class="fechaAlerta">{{ fecha }}</div>
        <div class="datosInvolucrados">
            <div id="profesionalInvolucrado">
                <div id="involucrado">Profesional</div>
                <div id ="nombreInvoucrado">{{ nombreProf }}</div>
            </div>
            <v-divider id="divisorAlerta"></v-divider>
            <div id="pacientesInvolucrado">
                <div id="involucrado">Paciente</div>
                <div id ="nombreInvoucrado">{{ nombrePac }}</div>
            </div>
        </div>
    </div>

</template>
<style>
#divisorAlerta{
    width: 95%;
}
#nombreInvoucrado{

    position: relative;
    height: 100%;
    width: 75%;
    max-width: 500px;
    display: inline-block;
    margin-top: 11px;
    margin-left: 3px;
    text-align: left;
    
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
   


}

#involucrado{

    position: relative;
    height: 100%;
    width: 90px;
    margin-left: 2px;
    display: flex;
    align-items: center;
}
#profesionalInvolucrado{
    position: relative;

    height: 50%;
    width: 100%;
    display: flex;
    align-items: center;
}
#pacientesInvolucrado{
    position: relative;
    display: flex;
    height: 50%;
    width: 100%;
    align-items: center;
}

.AlertaLista{
    position: relative;
    margin-top: 7px;
    padding: 0;  
    width: 99%;
    height: 66px;
    display: flex;
    flex-direction: row;
    background-color: #F3F3F3;
    border-radius: 7px;
    text-align: center;
    overflow: hidden;
    font-family: Arial, Helvetica, sans-serif;
    font-weight: 500;
    cursor: pointer;
    transition: all 200ms linear;
    color: #253C41;
}
.contenedorEtiquetaAlerta{
    position: relative;
    min-width: 150px;
    width: 15%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

}
.fechaAlerta{
    position: relative;
    min-width: 80px;
    width: 15%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.datosInvolucrados{

    height: 100%;
    width: 65%;
    position: relative;
    display: flex;
    flex-direction: column;
    font-size: 14px;
    align-items: center;


}
.AlertaLista:hover{
    background-color: #E7E7E7;
    color: #48ABBF;
}
.AlertaLista:focus{
    background-color: #E7E7E7;
    color: #48ABBF;
    
}
</style>