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
      excel: null,
      dialog: false,
      date: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10),
      menu: false,

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
      <v-dialog
        v-model="dialog"
        width="700"
        max-width="700px"
        id="dialogo"

      >
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            color="#2DB7B2"
            dark
            v-bind="attrs"
            v-on="on"
            rounded
            width="300px"
            elevation="3"
          >
            Subir Reporte
          </v-btn>
        </template>
  
        <v-card >
            <v-toolbar id="bordeReporte" :elevation="0">
                <v-toolbar-title id="textoReporte"
                >Cargar reporte
                </v-toolbar-title>
            </v-toolbar>
            <v-card-text>
                <v-form method='POST' enctype="multipart/form-data"> 
                    <v-row id="col1" >
                        <v-col>
                            <v-text-field
                                name="title"
                                label="Título"
                                type="text"
                                v-model="title"
                            ></v-text-field>
                            <v-menu
                                v-model="menu"
                                :close-on-content-click="false"
                                :nudge-right="40"
                                transition="scale-transition"
                                offset-y
                                min-width="auto"
                            >
                            <template v-slot:activator="{ on, attrs }">
                                <v-text-field
                                    v-model="date"
                                    label="Fecha del Reporte"
                                    prepend-icon="mdi-calendar"
                                    readonly
                                    v-bind="attrs"
                                    v-on="on"
                                ></v-text-field>
                            </template>
                            <v-date-picker
                                no-title
                                v-model="date"
                                @input="menu = false"
                                ></v-date-picker>
                            </v-menu>
                            <v-file-input
                                accept=".xlsx"
                                label="Excel (archivo .xlsx)"
                                name="excel"
                                outlined
                                v-model="excel"
                                show-size
                                id="excelInput"
                            ></v-file-input>
                        </v-col>
                    </v-row>
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    color="#48abbf"
                    dark 
                    width="100px"
                 @click="reportHandler">Subir</v-btn>
                <v-btn
                    color="#48abbf"
                    dark 
                    width="100px"
                  @click="dialog = false">Volver</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<style>
</style>