//import axios from 'axios';
export const state = () => ({
  categoriaElegida: null,
  datoBuscadoPaciente: null,
  mostrarPac:false,
  idAnterior: false,
  historialAtencion:[],
  dataPacientes:[],
  dataPaciente:[],
  pagosProfesional:[],
  copia:[],
  costoPaciente:[]
    
  })
export const getters = {

    getCategoria(state){
        return state.categoriaElegida
    },
    getDatoBuscado(state){
        return state.datoBuscadoPaciente
    },
    getmostrarPac(state){
        return state.mostrarPac
    },
    getDatosBasicos(state){
        return state.datosPaciente
    },
    getHistorial(state){
        return state.pacienteesActivos
    }
}
export const mutations = {
    setCopia(state,lista){
      state.copia = lista;    
    },
    setPacientes(state,lista){
        
        state.dataPacientes = lista;
        console.log(state.dataPacientes);
    },
    setPaciente(state,datosPaciente){
        state.dataPaciente = datosPaciente;
        state.historialAtencion = datosPaciente.asistencias;
        state.costoPaciente = datosPaciente.costo;
        console.log( state.dataPaciente)
    },
    mostrar(state,id){
        const idAnterior = state.idAnterior
        if(idAnterior != id){
            state.mostrarPac = true
        }
        else{
            state.mostrarPac = true;
            state.idAnterior = id;
        }

        console.log(state.mostrarPac)
 
    },
    elegirCategoria(state,categoriaSeleccionada){
        state.categoriaElegida = categoriaSeleccionada;
    },
    setDatoPorBuscar(state,dato){
        state.datoBuscadoPaciente = dato;
    },
      
  }

  export const actions = {
    async fetchPacientes({ commit,state }) {
      const path = this.$config.pacienteURL;
      try {
        const res = await this.$axios.get(path, 
          {
            headers:{Authorization: `Bearer ${localStorage.getItem("access")}`}
          });
        const datos = res.data.pacientes;
        commit('setPacientes', datos);
        commit('setCopia', datos);
        }  
      catch (error) {
        console.log(error);
        }

    },

    async fetchPaciente({ commit,state },id) {

        const id_paciente = id.toString();
        const path = this.$config.pacienteURL + id_paciente;
        try {
            const res = await this.$axios.get(path, 
              {
                headers:{Authorization: `Bearer ${localStorage.getItem("access")}`}
              });
            const datos = res.data.paciente;
            
            commit('setPaciente', datos);
            }  
          catch (error) {
            console.log(error);
            }

        
      },

      async filtrarDatos({commit,state}){

        let intersection = arrA.filter(x => arrB.includes(x));

      },
    
      async buscarPaciente({ commit,state }) {

        const nombres = state.copia.filter(copia => copia.nombre.toLowerCase().search(state.datoBuscadoPaciente.toLowerCase())!=-1);
        //const ruts = state.dataPacientes.filter(dataPacientes => dataPacientes.rut.toLowerCase().search(state.datoBuscadoPaciente.toLowerCase())!=-1);
        const datos = nombres
        commit('setPacientes', datos);
      },

      async filtrarCliente({commit,state}) {
        if(state.categoriaElegida != null){
            const categoria = state.categoriaElegida.toString();

            const path = this.$config.filterClientTypeURL+ categoria;
            try {
                const res = await this.$axios.get(path, 
                  {
                    headers:{Authorization: `Bearer ${localStorage.getItem("access")}`}
                  });
                const datos = res.data.pacientes;
                
                commit('setPacientes', datos);
                }  
              catch (error) {
                console.log(error);
                }
        }
      },
      async filtrarTurnos({commit,state}) {
        if(state.categoriaElegida != null){
            const area = state.categoriaElegida.toString();

            const path = this.$config.filterTurnTypeURL + area;
            try {
                const res = await this.$axios.get(path, 
                  {
                    headers:{Authorization: `Bearer ${localStorage.getItem("access")}`}
                  });
                const datos = res.data.pacientes;
                
                commit('setPacientes', datos);
                }  
              catch (error) {
                console.log(error);
                }
        }
      },
      async restaurarPacientes({commit}){
        commit('setPacientes', []);
      }
  }