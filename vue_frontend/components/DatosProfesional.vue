<script>
import DatosBasicosProf from "./DatosBasicosProf.vue";
import Estadistica from "./Estadistica.vue";
import BotonObtener from "./BotonObtener.vue";
import Historial from "./Historial.vue";

import Acordeon from "./Acordeon.vue";
import { mapState, mapGetters } from "vuex";
import * as XLSX from "xlsx";

export default {
  components: {
    DatosBasicosProf,
    Estadistica,
    BotonObtener,
    Acordeon,
    Historial,
  },
  computed: {
    ...mapState("profesional", [
      "dataProfesional",
      "pagosProfesional",
      "asistencias",
    ]),
    ...mapGetters("profesional", [
      "getDatosBasicos",
      "getEstadisticas",
      "getMostrar",
    ]),
  },
  methods: {
    ocultar(id) {
      const box = document.getElementById(id);
      const itemToggle = box.getAttribute("aria-expanded");
      if (itemToggle == "false") {
        box.setAttribute("aria-expanded", "true");
      } else {
        box.setAttribute("aria-expanded", "false");
      }
    },
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
    //FUNCION PARA EXPORTAR EXCEL CON REPORTE PROFESIONAL
    generarReporteProfesional() {
      try {
        let dataProfesional = this.$store.state.profesional.dataProfesional;
        console.log("Profesional a generar reporte: ");
        console.log(dataProfesional);

        //Formateo de datos basicos profesional
        var datosBasicos = [
          {
            Profesional: dataProfesional.nombre,
            RUT: dataProfesional.rut,
            "Coordinador/a": dataProfesional.nombreCoordinador,
            "Tipo contrato": dataProfesional.tipoContrato,
            "Horas extras": dataProfesional.horasExtras,
            "Horas totales": dataProfesional.horasTotales,
            Inasistencias: dataProfesional.inasistencias,
            "Licencia (dias)": dataProfesional.licencia,
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
          "Datos basicos profesional"
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

        // Asistencias
        const worksheet2 = XLSX.utils.json_to_sheet(
          dataProfesional.asistencias
        );
        XLSX.utils.book_append_sheet(workbook, worksheet2, "Asistencias");

        const columnHeaders2 = Object.keys(dataProfesional.asistencias[0]);

        const columnWidths2 = columnHeaders2.map((header) => {
          return {
            wch:
              Math.max(
                header.length,
                ...dataProfesional.asistencias.map(
                  (item) => (item[header] || "").toString().length
                )
              ) + 2,
          };
        });

        worksheet2["!cols"] = columnWidths2;

        //Esto deja la primera fila en negrita, no funciona
        const headerRange2 = XLSX.utils.decode_range(worksheet2["!ref"]);
        for (let i = headerRange2.s.c; i <= headerRange2.e.c; i++) {
          const cellAddress = XLSX.utils.encode_cell({
            r: headerRange2.s.r,
            c: i,
          });
          const cell = worksheet2[cellAddress];
          const header = columnHeaders2[i];
          cell.s = headerCellStyle;
          cell.v = header; // Set the cell value explicitly as the header text
          cell.t = "s"; // Set the cell type as string (text)
        }

        // Pagos
        const worksheet3 = XLSX.utils.json_to_sheet(dataProfesional.pagos);
        XLSX.utils.book_append_sheet(workbook, worksheet3, "Pagos");

        const columnHeaders3 = Object.keys(dataProfesional.pagos[0]);

        const columnWidths3 = columnHeaders3.map((header) => {
          return {
            wch:
              Math.max(
                header.length,
                ...dataProfesional.pagos.map(
                  (item) => (item[header] || "").toString().length
                )
              ) + 2,
          };
        });

        worksheet3["!cols"] = columnWidths3;

        //Esto deja la primera fila en negrita, no funciona
        const headerRange3 = XLSX.utils.decode_range(worksheet3["!ref"]);
        for (let i = headerRange3.s.c; i <= headerRange3.e.c; i++) {
          const cellAddress = XLSX.utils.encode_cell({
            r: headerRange3.s.r,
            c: i,
          });
          const cell = worksheet3[cellAddress];
          const header = columnHeaders3[i];
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
        const nombreXLSX = "ReporteProfesional_" + dataProfesional.rut + ".xlsx";
        link.setAttribute("download", nombreXLSX);

        // Click al link para iniciar la descarga
        link.click();

        // Se borra el URL
        window.URL.revokeObjectURL(url);
      } catch (e) {
        console.log("Error: ", e);
      }
    },
  },
};
</script>
<template>
  <div class="ContenedorDatosP">
    <transition appear name="fade">
      <div class="contEfecto" v-if="getMostrar === true">
        <div class="DatosBasicos">
          <DatosBasicosProf
            :nombre="dataProfesional.nombre"
            :rut="dataProfesional.rut"
            :area="dataProfesional.idArea_id"
            :centro="dataProfesional.idCentro_id"
            :coordinador="dataProfesional.nombreCoordinador"
            :contrato="dataProfesional.tipoContrato"
            :idCoord="dataProfesional.idCoordinador_id"
          />
        </div>
        <div class="EstadisticasProfesional">
          <Estadistica
            tipo="Inasistencias"
            :valor="dataProfesional.inasistencias"
          />

          <Estadistica
            tipo="Horas totales"
            :valor="dataProfesional.horasTotales"
          />
          <Estadistica
            tipo="Horas Extra"
            :valor="dataProfesional.horasExtras"
          />
          <Estadistica tipo="Vacaciones" :valor="dataProfesional.vacaciones" />
          <Estadistica tipo="Licencias" :valor="dataProfesional.licencia" />
        </div>
        <div class="DatosCambiantes">
          <div class="BotonesCambio">
            <div
              class="BtnDerecha"
              id="btCambioDerecha"
              @click="cambiar('remuneraciones')"
            >
              Remuneración
            </div>
            <div
              class="BtnIzquierda"
              id="btCambioIzquierda"
              @click="cambiar('asistencias')"
            >
              Asistencias
            </div>
          </div>
          <div class="Informacion">
            <Acordeon id="remuneraciones" />
            <Historial tipo="profesionales" id="asistencias" />
          </div>
        </div>
        <div class="BtnObtenerReporte">
          <!-- <BotonObtener />-->
          <v-btn @click="generarReporteProfesional">Obtener Reporte</v-btn>
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

.ContenedorDatosP {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 95%;
}
.contEfecto {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}
.DatosBasicos {
  position: relative;
  display: flex;
  justify-content: center;
  width: 100%;
  height: 25%;

}
.EstadisticasProfesional {
  position: relative;
  display: flex;
  width: 100%;
  height: 15%;
  align-items: center;
  flex-direction: row;
  justify-content: center;
  
}

.DatosCambiantes {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 55%;
  justify-content: center;
  filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.15));

  border-radius: 12.5px;
  z-index: 1000;

}
.BotonesCambio {
  display: flex;
  position: relative;
  width:100%;
  height: 8%;
  font-size: 14px;
  font-weight: 500;
  font-family: Arial, Helvetica, sans-serif;
  z-index: -1;
  border-radius: 12.5px 12.5px 0 0;
}

.BtnDerecha,
.BtnIzquierda {
  position: relative;
  display: flex;
  left: 5%;
  width: 25%;
  height: 100%;
  justify-content: center;
  align-items: center;
  color: white;

  border-radius: 12.5px 12.5px 0px 0px;
  transition: all 200ms linear;
  cursor: pointer;
  background-color: #669098;
}


.BtnIzquierda {
  border-radius: 12.5px 12.5px 0px 0px;
  background-color: #5ab3c6;
}

.Informacion {
  position: relative;
  display: flex;
  height: 100%;
  left: 3%;
  width: 93%;
  justify-content: center;
  transition: all 200ms linear;
  z-index: -100;

  
}
.BtnObtenerReporte {
  position: relative;
  display: flex;
  width: 100%;
  bottom: 0;
  height: 10%;
  justify-content: center;
  align-items: center;
}
#remuneraciones {
  width: 100%;
  height: 100%;
  z-index: 100;
  opacity: 1;
  transition: all 250ms linear;
}
#asistencias,#atencion {
  width: 100%;
  height: 100%;
  opacity: 0;
  z-index: -100;
  transition: all 250ms linear;
}
</style>