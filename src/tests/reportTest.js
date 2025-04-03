const {generateDailyReport, getReport, downloadAndProcessReport} = require("../services/ReportService");
const { sequelize } = require('../config/dbConfig');

// Función para esperar un tiempo determinado
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Flujo de prueba
async function testAmazonAdsFlow() {
  try {
    console.log("=== INICIANDO PRUEBA DE AMAZON ADS ===");

    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log("Conexión a la base de datos exitosa.");

    // Paso 1: Generar el reporte diario
    console.log("Generando el reporte diario...");
    const reportId = await generateDailyReport();
    console.log(`Reporte generado con ID: ${reportId}`);

    // Paso 2: Consultar el estado del reporte
    let report;
    do {
      console.log("Consultando el estado del reporte...");
      report = await getReport(reportId);
      console.log(`Estado actual: ${report.status}`);

      if (report.status === "COMPLETED") {
        console.log("El reporte está listo para ser descargado.");
        break;
      } else if (report.status === "FAILURE") {
        console.error("El reporte falló al generarse.");
        return;
      }

      console.log(
        "El reporte aún no está listo. Esperando 30 segundos antes de volver a consultar..."
      );
      await delay(120000); // Esperar 120 segundos(2min) antes de volver a consultar
    } while (report.status !== "COMPLETED");

    // Paso 3: Descargar y procesar el reporte
    console.log("Descargando y procesando el reporte...");
    const reportData = await downloadAndProcessReport(report.url);
    console.log("Datos del reporte procesados exitosamente:");
    console.log(reportData);

    console.log("=== PRUEBA FINALIZADA CON ÉXITO ===");
  } catch (error) {
    console.error("Error durante el flujo de prueba:", error.message);
  } finally {
    // Cerrar conexión a la base de datos
    await sequelize.close();
    console.log("Conexión a la base de datos cerrada.");
  }
}

//testAmazonAdsFlow();
