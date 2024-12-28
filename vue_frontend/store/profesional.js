//import this.$axios from 'this.$axios';
export const state = () => ({
    categoriaElegida: null,
    datoBuscadoProfesional: null,
    mostrar:false,
    idAnterior: false,
    profesionales:[],
    asistencias:[],
    dataProfesionales:[],
    dataProfesional:[],
    pagosProfesional:[],
    copia:[]
    
  })
export const getters = {

    getCategoria(state){
        return state.categoriaElegida
    },
    getAsistencias(state){
        console.log(state.asistencias);
        return state.asistencias
    },
    getDatoBuscado(state){
        return state.datoBuscadoProfesional
    },
    getMostrar(state){
        return state.mostrar
    },
    getPagos(state){
        console.log(state.pagoProfesional);
        return state.pagoProfesional
    },
    getEstadisticas(state){
        return state.estProfesional
    },
    getDatosBasicos(state){
        //return state.datosProfesional
        return state.dataProfesional
    },
    getProfesionales(state){
        return state.profesionales
    },
    getDatosProfesionales(state){
        
    
        if(state.categoriaElegida === null && state.datoBuscadoProfesional===null){
            return state.profesionales
        }

        if(state.categoriaElegida != null){
            return state.profesionales.filter(profesionales => profesionales.centro === state.categoriaElegida);
        }
        if(state.datoBuscadoProfesional!=null){
            const nombres = state.profesionales.filter(profesionales => profesionales.nombre.toLowerCase().search(state.datoBuscadoProfesional.toLowerCase())!=-1);
            const ruts = state.profesionales.filter(profesionales => profesionales.rut.toLowerCase().search(state.datoBuscadoProfesional.toLowerCase())!=-1);
          
            const resultado = nombres.concat(ruts);
            
            return resultado
        }
        return null;
        
    }
}
export const mutations = {
    setProfesionales(state,lista){
        state.dataProfesionales = lista;    
    },
    setCopia(state,lista){
      state.copia = lista;    
    },
    setProfesional(state,datosProfesional){
        state.dataProfesional = datosProfesional;
        state.pagosProfesional = datosProfesional.pagos[0];
        state.asistencias = datosProfesional.asistencias;
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
        state.datoBuscadoProfesional = dato;
    },
      
  }

  export const actions = {
    async fetchProfesionales({ commit }) {
      const path = this.$config.profesionalURL;
      try {
        const res = await this.$axios.get(path, 
            {
              headers:{Authorization: `Bearer ${localStorage.getItem("access")}`}
            });
        const datos = res.data.profesionales;
        commit('setProfesionales', datos);
        commit('setCopia', datos);
        }  
      catch (error) {
        //Si tira error, hay que llamar a la url que retorna un nuevo access token
        //y sobreescribirlo en el local storage, esto para todas las requests
        console.log(error);
        }
    },

    async fetchProfesional({ commit,state },id) {

        const id_profesional = id.toString();
        const path = this.$config.profesionalURL + id_profesional;
        try {
            const res = await this.$axios.get(path, 
                {
                  headers:{Authorization: `Bearer ${localStorage.getItem("access")}`}
                });
            const datos = res.data.profesional;
            
            commit('setProfesional', datos);
            }  
          catch (error) {
            console.log(error);
            }
      },
    
      buscarProfesional({ commit,state }) {
        const nombres = state.copia.filter(copia => copia.nombre.toLowerCase().search(state.datoBuscadoProfesional.toLowerCase())!=-1);
        const ruts = state.copia.filter(copia => copia.rut.toLowerCase().search(state.datoBuscadoProfesional.toLowerCase())!=-1);
        const datos = nombres.concat(ruts);
        commit('setProfesionales', datos);
      },

      async filtrarCentro({commit,state}) {
        if(state.categoriaElegida != null){
            const categoria = state.categoriaElegida.toString();

            const path = this.$config.filterCenterURL+ categoria;
            try {
                const res = await this.$axios.get(path, 
                    {
                      headers:{Authorization: `Bearer ${localStorage.getItem("access")}`}
                    });
                const datos = res.data.profesionales;
                
                commit('setProfesionales', datos);
                }  
              catch (error) {
                console.log(error);
                }
        }
      },
      async filtrarArea({commit,state}) {
        if(state.categoriaElegida != null){
            const area = state.categoriaElegida.toString();

            const path = this.$config.filterPositionURL+ area;
            try {
                const res = await this.$axios.get(path, 
                    {
                      headers:{Authorization: `Bearer ${localStorage.getItem("access")}`}
                    });
                const datos = res.data.profesionales;
                
                commit('setProfesionales', datos);
                }  
              catch (error) {
                console.log(error);
                }
        }
      },
      async restaurarProfesionales({commit}){
        commit('setProfesionales', []);
      }
  }