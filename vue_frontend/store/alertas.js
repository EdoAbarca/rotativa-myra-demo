//import axios from 'axios';
export const state = () => ({
    categoriaElegida: null,
    datoBuscado: null,
    mostrarAlerta:false,
    idAnterior: false,
    dataAlertas:[],
    dataAlerta:[], 
    copia:[],

    })


export const mutations = {
    setAlertas(state,lista){
        state.dataAlertas = lista;
        
    },
    setCopia(state,lista){
        state.copia = lista;
    },
    setAlerta(state,datosAlerta){
        state.dataAlerta = datosAlerta;
        console.log(datosAlerta)
    },
    mostrar(state,id){
        const idAnterior = state.idAnterior
        if(idAnterior != id){
            state.mostrar = true
        }
        else{
            state.mostrar = true;
            state.idAnterior = id;
        }
 
    },
    elegirCategoria(state,categoriaSeleccionada){
        state.categoriaElegida = categoriaSeleccionada;
    },
    setDatoPorBuscar(state,dato){
        state.datoBuscado = dato;
    },
      
  }

  export const actions = {
    async fetchAlertas({ commit }) {
      const path = 'http://localhost:8000/api/alerta/';
      try {
        const res = await this.$axios.get(path);
        const datos = res.data.alertas;
        commit('setCopia', datos);
        commit('setAlertas', datos);
        }  
      catch (error) {
        console.log(error);
        }
    },

    async fetchAlerta({ commit,state },id) {

        const id_Alerta = id.toString();
        const path = 'http://localhost:8000/api/alerta/' + id_Alerta;
        try {
            const res = await this.$axios.get(path);
            const datos = res.data.alerta;
            
            commit('setAlerta', datos);
            }  
          catch (error) {
            console.log(error);
            }
      },
    
      async buscarAlerta({ commit,state }) {

        const nombres = state.copia.filter(
            copia => 
            copia.nombreProfesional.toLowerCase().search(state.datoBuscado.toLowerCase())!=-1 ||
            copia.nombrePaciente.toLowerCase().search(state.datoBuscado.toLowerCase())!=-1
            );
       

        commit('setAlertas', nombres);
      },

      async filtrarTipoAlerta({commit,state}) {
        if(state.categoriaElegida != null){
            const categoria = state.categoriaElegida;
            const alertas = state.copia.filter(copia => copia.idTipoAlerta_id === categoria);
            commit('setAlertas', alertas);
        }
      },
      async restaurarCoordinadores({commit}){
        commit('setCoordinadores', []);
      }
  }
  