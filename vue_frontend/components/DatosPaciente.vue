<script>
import DatosBasicosPaci from "./DatosBasicosPaci.vue";
import Estadistica from "./Estadistica.vue";
import BotonObtener from "./BotonObtener.vue";
import GastoPaciente from './GastoPaciente.vue'
import { mapState, mapGetters, mapMutations } from "vuex";
import Historial from "./Historial.vue";
import * as XLSX from "xlsx";

export default {
  components: {
    DatosBasicosPaci,
    Estadistica,
    BotonObtener,
    Historial,
    Historial,
    GastoPaciente
  },
  computed: {
    ...mapState("paciente", ["dataPaciente", "mostrarPac"]),
    ...mapGetters("paciente", ["getmostrarPac"]),
  },
  methods: {
    cambiar(id){
            if(id ==='remuneraciones'){
                document.getElementById('remuneraciones').style.zIndex = '100';
                document.getElementById('remuneraciones').style.opacity = '1';
                document.getElementById('btCambioDerecha').style.backgroundColor = '#669098';

                document.getElementById('asistencias').style.zIndex = '0';
                document.getElementById('asistencias').style.opacity = '0';
                document.getElementById('btCambioIzquierda').style.backgroundColor = '#5AB3C6';

                document.getElementById('atencion').style.zIndex = '0';
                document.getElementById('atencion').style.opacity = '0';
                document.getElementById('btCambioCentro').style.backgroundColor = '#5AB3C6';
                
            }
            else if(id ==='asistencias'){

                document.getElementById('remuneraciones').style.zIndex = '0';
                document.getElementById('remuneraciones').style.opacity = '0';
                document.getElementById('atencion').style.zIndex = '0';
                document.getElementById('atencion').style.opacity = '0';
                document.getElementById('asistencias').style.zIndex = '100';
                document.getElementById('asistencias').style.opacity = '1';

                document.getElementById('btCambioCentro').style.backgroundColor = '#5AB3C6';
                document.getElementById('btCambioDerecha').style.backgroundColor = '#5AB3C6';
                document.getElementById('btCambioIzquierda').style.backgroundColor = '#669098';

            }
            else{
                document.getElementById('remuneraciones').style.zIndex = '0';
                document.getElementById('remuneraciones').style.opacity = '0';
                document.getElementById('asistencias').style.zIndex = '0';
                document.getElementById('asistencias').style.opacity = '0';
                document.getElementById('atencion').style.zIndex = '100';
                document.getElementById('atencion').style.opacity = '1';

                document.getElementById('btCambioCentro').style.backgroundColor = '#669098';
                document.getElementById('btCambioDerecha').style.backgroundColor = '#5AB3C6';
                document.getElementById('btCambioIzquierda').style.backgroundColor = '#5AB3C6';

            }

        },
    //FUNCION PARA EXPORTAR EXCEL CON REPORTE PACIENTE
    generarReportePaciente() {
      try {
        let dataPaciente = this.$store.state.paciente.dataPaciente;
        console.log("Paciente a generar reporte: ");
        console.log(dataPaciente);

        //Formateo de datos basicos profesional
        var datosBasicos = [
          {
            "Paciente": dataPaciente.nombre,
            "Región": dataPaciente.region,
            "Zona": dataPaciente.zona,
            "Tipo turno": dataPaciente.tipoTurno,
            "Gasto": dataPaciente.gasto,
            "Fecha inicio atención": dataPaciente.fechaInicioAtencion,
            "Vigente": dataPaciente.vigente ? "Si" : "No",
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
          "Datos basicos paciente"
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
        const worksheet2 = XLSX.utils.json_to_sheet(dataPaciente.asistencias);
        XLSX.utils.book_append_sheet(workbook, worksheet2, "Asistencias");

        const columnHeaders2 = Object.keys(dataPaciente.asistencias[0]);

        const columnWidths2 = columnHeaders2.map((header) => {
          return {
            wch:
              Math.max(
                header.length,
                ...dataPaciente.asistencias.map(
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
        // Remove spaces using the replace() method with a regular expression
        let paciente_xlsx = dataPaciente.nombre.replace(/\s/g, "");

        // Print the result
        console.log(paciente_xlsx);
        const nombreXLSX = "ReportePaciente_" + paciente_xlsx + ".xlsx";
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
      <div class="contEfecto" v-if="getmostrarPac == true">
        <div class="DatosBasicos">
          <DatosBasicosPaci
            :nombre="dataPaciente.nombre"
            :rut="dataPaciente.rut"
            :turno="dataPaciente.idTipoTurno_id"
            :cliente="dataPaciente.idCliente_id"
            :coordinador="dataPaciente.nombreCoordinador"
            :cuidado="'falta este dato'"
            :region="dataPaciente.region"
            :zona="dataPaciente.zona"
            :idCoord="dataPaciente.idCoordinador_id"
          />
        </div>
        <div class="EstadisticasProfesional">
          <Estadistica tipo="Profesionales Activos" :valor="0" />
          <Estadistica tipo="Profesionales Diarios" :valor="3" />
          <Estadistica tipo="Profesionales Mensuales" :valor="5" />
        </div>
        <div class="DatosCambiantes">
          <div class="BotonesCambio">
                        <div class="BtnDerecha" id="btCambioDerecha" @click="cambiar('remuneraciones')">Costo de Paciente </div>
                        <div class="BtnIzquierda" id="btCambioIzquierda" @click="cambiar('asistencias')">Profesionales Activos</div>
                        <div class="BtnIzquierda" id="btCambioCentro" @click="cambiar('atencion')">Historial de Atención</div>
                    </div>
          <div class="Informacion">
            <GastoPaciente id="remuneraciones"/>
            <Historial tipo="pacientes" id="asistencias"/>
            <Historial tipo ="pacientes" id="atencion"/>
          </div>
        </div>
        <div class="BtnObtenerReporte">
          <v-btn @click="generarReportePaciente">Obtener Reporte</v-btn>
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