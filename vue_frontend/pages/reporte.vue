<script>
//import Cookies from 'js-cookie';
export default {
  head() {
    return {
      title: "Cargar reporte - Rotativa Myra",
    };
  },
  name: "Reporte",
  middleware: "auth",
  data() {
    return {
      title: "",
      date: "",
      excel: null,
    };
  },
  methods: {
    async reportHandler() {
      const data = {
        title: this.title,
        date: this.date,
        excel: this.excel,
      };
      console.log(data);
      
      //const input = document.querySelector('#excelInput').files[0];
      //console.log(input);

      let formData = new FormData(); 
      formData.append("excel", this.excel, this.excel.name);
      formData.append("title", this.title);
      formData.append("date", this.date);

      this.$axios.setHeader(
          "Content-Type",
          "multipart/form-data"
        );
      try {
        const res = await this.$axios.post(this.$config.cargaExcelURL, formData);
        console.log(res);
      } catch (e) {
        console.log("Error: ", e.message);
      }
    },
  },
};
</script>


<template>
  <v-app id="ventanaReporte">
    <v-main>
      <v-container fluid fill-height>
        <v-layout id="layoutReporte" align-center justify-center>
          <v-flex>
            <v-card class="elevation-12" id="cuerpoForm">
              <v-toolbar id="bordeReporte" :elevation="0">
                <v-toolbar-title id="textoReporte"
                  >Cargar reporte</v-toolbar-title
                >
              </v-toolbar>
              <v-card-text>
                <v-form method='POST' enctype="multipart/form-data"> 
                  <v-text-field
                    name="title"
                    label="Título"
                    type="text"
                    v-model="title"
                  ></v-text-field>
                  <v-text-field
                    name="date"
                    label="Fecha de reporte"
                    type="date"
                    v-model="date"
                  ></v-text-field>
                  <v-file-input
                    accept=".xlsx"
                    label="Excel (archivo .xlsx)"
                    name="excel"
                    outlined
                    v-model="excel"
                    show-size
                    id="excelInput"
                  >
                  </v-file-input>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn id="boton" @click="reportHandler">Subir</v-btn>
                <v-btn id="boton" href="/home">Volver</v-btn>
              </v-card-actions>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </v-main>
  </v-app>
</template>
<style>
/*#ventanaReporte {
  opacity: 1;
}
#textoReporte {
  color: #005d71;
}

#boton {
  background-color: #48abbf;
  color: #ffffff;
  border-radius: 9px;
}
#bordeReporte {
  border-radius: 12px 12px 0 0;
}

#cuerpoForm {
  border-radius: 12px;
}
#layoutReporte {
  width: 30%;
}*/
</style>