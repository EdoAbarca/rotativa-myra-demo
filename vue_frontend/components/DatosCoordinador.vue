<script>
import DatosBasicosCoord from "./DatosBasicosCoord.vue";
import Estadistica from "./Estadistica.vue";
import BotonObtener from "./BotonObtener.vue";
import Historial from "./Historial.vue";
import { mapState, mapGetters, mapMutations } from "vuex";
import * as XLSX from "xlsx";

export default {
  components: {
    DatosBasicosCoord,
    Estadistica,
    BotonObtener,
    Historial,
    Historial,
  },
  computed: {
    ...mapState("coordinador", ["dataCoordinador", "mostrar"]),
  },
  methods: {
    cambiar(id) {
      if (id === "remuneraciones") {
        document.getElementById("remuneraciones").style.zIndex = "100";
        document.getElementById("remuneraciones").style.opacity = "1";
        document.getElementById("btCambioDerecha").style.backgroundColor =
          "#669098";
        document.getElementById("asistencias").style.zIndex = "0";
        document.getElementById("asistencias").style.opacity = "0";
        document.getElementById("btCambioIzquierda").style.backgroundColor =
          "#5AB3C6";
      } else {
        document.getElementById("remuneraciones").style.zIndex = "0";
        document.getElementById("remuneraciones").style.opacity = "0";
        document.getElementById("asistencias").style.zIndex = "100";
        document.getElementById("asistencias").style.opacity = "1";

        document.getElementById("btCambioDerecha").style.backgroundColor =
          "#5AB3C6";
        document.getElementById("btCambioIzquierda").style.backgroundColor =
          "#669098";
      }
    },
    //FUNCION PARA EXPORTAR EXCEL CON REPORTE COORDINADOR
    generarReporteCoordinador() {
      try {
        let dataCoordinador = this.$store.state.coordinador.dataCoordinador;
        console.log("Coordinador a generar reporte: ");
        console.log(dataCoordinador);
				
        //Formateo de datos basicos coordinador
        var datosBasicos = [
          {
            Coordinador: dataCoordinador.nombre,
            RUT: dataCoordinador.rut
          },
        ];

        // Workbook
        const workbook = XLSX.utils.book_new();

        // Worksheet
        // Datos basicos profesional
        const worksheet1 = XLSX.utils.json_to_sheet(datosBasicos);
        XLSX.utils.book_append_sheet(
          workbook,
          worksheet1,
          "Datos basicos coordinador"
        );
        const columnHeaders1 = Object.keys(datosBasicos[0]);

        const columnWidths1 = columnHeaders1.map((header) => {
          return {
            wch:
              Math.max(
                header.length,
                ...datosBasicos.map(
                  (item) => (item[header] || "").toString().length
                )
              ) + 2,
          };
        });

        worksheet1["!cols"] = columnWidths1;

        const headerCellStyle = { font: { bold: true } };

        //Esto deja la primera fila en negrita, no funciona
        //Posible solucion: Instalar xlsx-js-style o xlsx-style
        const headerRange1 = XLSX.utils.decode_range(worksheet1["!ref"]);
        for (let i = headerRange1.s.c; i <= headerRange1.e.c; i++) {
          const cellAddress = XLSX.utils.encode_cell({
            r: headerRange1.s.r,
            c: i,
          });
          const cell = worksheet1[cellAddress];
          const header = columnHeaders1[i];
          cell.s = headerCellStyle;
          cell.v = header; // Set the cell value explicitly as the header text
          cell.t = "s"; // Set the cell type as string (text)
        }

        // Generar el Excel
        const excelBuffer = XLSX.write(workbook, {
          bookType: "xlsx",
          type: "array",
        });

        // Excel buffer a Blob
        const blob = new Blob([excelBuffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        // Crear el URL desde el blob
        const url = window.URL.createObjectURL(blob);

        // Link temporal para gestar la descarga
        const link = document.createElement("a");
        link.href = url;
        //link.setAttribute("download", "reportePrueba.xlsx");
        const nombreXLSX = "ReporteCoordinador_" + dataCoordinador.rut + ".xlsx";
        link.setAttribute("download", nombreXLSX);

        // Click al link para iniciar la descarga
        link.click();

        // Se borra el URL
        window.URL.revokeObjectURL(url);
			} catch (e) {
        console.log("Error: ", e);
      }
		}
  },
};
</script>
<template>
  <div class="ContenedorDatosP">
    <transition appear name="fade">
      <div class="contEfecto" v-if="mostrar == true">
        <div class="DatosBasicos">
          <DatosBasicosCoord
            :nombre="dataCoordinador.nombre"
            :rut="dataCoordinador.rut"
            :area="dataCoordinador.idArea_id"
            :centro="dataCoordinador.idCentro_id"
          />
        </div>
        <div class="EstadisticasProfesional">
          <Estadistica tipo="Horas Extras de Profesionales" :valor="dataCoordinador.horasExtras" />
          <Estadistica tipo="Inasistencias de Profesionales" :valor="dataCoordinador.inasistencias" />
          <Estadistica tipo="Profesionales con Licencia" :valor="dataCoordinador.licencias" />
          <Estadistica tipo="Profesionales de vacaciones" :valor="dataCoordinador.vacaciones" />
        </div>
        <div class="DatosCambiantes">
          <div class="BotonesCambio">
            <div
              class="BtnDerecha"
              id="btCambioDerecha"
              @click="cambiar('remuneraciones')"
            >
              Profesionales a Cargo
            </div>
            <div
              class="BtnIzquierda"
              id="btCambioIzquierda"
              @click="cambiar('asistencias')"
            >
              Pacientes a Cargo
            </div>
          </div>
          <div class="Informacion">
            
            <Historial tipo="coordinadores1" id="remuneraciones" />
            <Historial tipo="coordinadores2" id="asistencias" />
          </div>
        </div>
        <div class="BtnObtenerReporte">
          <v-btn @click="generarReporteCoordinador">Obtener Reporte</v-btn>
        </div>
      </div>
    </transition>
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>