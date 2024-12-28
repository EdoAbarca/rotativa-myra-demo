import axios from 'axios';
export const state = () => ({
    selectorArea: [],
    selectorCliente: [],
    selectorTurno: [],
    selectorCentro: [],
    selectorAlertas:[],
    listaDatos:[]
  })

  export const mutations = {
    modificarArea(state,valor){
        state.selectorArea = valor;
        console.log(state.selectorArea)
    },
    modificarCentro(state,valor){
        state.selectorCentro = valor
    },
    modificarAlerta(state,valor){
      state.selectorAlertas = valor
  },
    modificarTurno(state,valor){
      state.selectorTurno = valor
    },
    modificarCliente(state,valor){
      state.selectorCliente = valor
    },

    filtrado(state, valor){
      state.listaDatos = []
      if(state.selectorCentro == []){
        state.listaDatos = state.selectorArea;
      }
      else if(state.selectorArea == []){
        state.listaDatos = state.selectorCentro
      }
      else if(state.selectorAlertas != [] && state.selectorCentro != []){
        state.listaDatos = state.dataPacientes.filter(dataPacientes => dataPacientes.id.toLowerCase().search(state.datoBuscadoPaciente.toLowerCase())!=-1);
      }
    }
  }

  export const actions = {
    async fetchSelectoresArea({ commit,state }) {
      const path = 'http://localhost:8000/api/area/';
      try {
        const res = await this.$axios.get(path, 
          {
            headers:{Authorization: `Bearer ${localStorage.getItem("access")}`}
          });
        const datos = res.data.areas;
        commit('modificarArea', datos);
        }  
      catch (error) {
        console.log(error);
        }

    },
    async fetchSelectoresCentro({ commit,state }) {
      const path = 'http://localhost:8000/api/centro/';
      try {
        const res = await this.$axios.get(path, 
          {
            headers:{Authorization: `Bearer ${localStorage.getItem("access")}`}
          });
        const datos = res.data.centros;
        commit('modificarCentro', datos);
        }  
      catch (error) {
        console.log(error);
        }

    },
    async fetchSelectoresTurno({ commit,state }) {
      const path = 'http://localhost:8000/api/tipo_turno/';
      try {
        const res = await this.$axios.get(path, 
          {
            headers:{Authorization: `Bearer ${localStorage.getItem("access")}`}
          });
        const datos = res.data.tipoturnos;
        commit('modificarTurno', datos);
        }  
      catch (error) {
        console.log(error);
        }

    },

    async fetchSelectoresCliente({ commit,state }) {
      const path = 'http://localhost:8000/api/cliente/';
      try {
        const res = await this.$axios.get(path, 
          {
            headers:{Authorization: `Bearer ${localStorage.getItem("access")}`}
          });
        const datos = res.data.clientes;
        commit('modificarCliente', datos);
        }  
      catch (error) {
        console.log(error);
        }

    },

    async fetchSelectoresAlerta({ commit,state }) {
      const path = 'http://localhost:8000/api/tipo_alerta/';
      try {
        const res = await this.$axios.get(path, 
          {
            headers:{Authorization: `Bearer ${localStorage.getItem("access")}`}
          });
        const datos = res.data.tipoalertas;
        commit('modificarAlerta', datos);
        }  
      catch (error) {
        console.log(error);
        }

    },
    
  }