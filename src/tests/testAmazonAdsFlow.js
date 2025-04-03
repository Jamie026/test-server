// src/tests/testAmazonAdsFlow.js
const ReportService = require("../services/ReportService");
const { sequelize } = require('../config/dbConfig');
const logger = require('../utils/logger');

// Constantes de configuración
const CONFIG = {
    RETRY_INTERVAL: 30000, // 30 segundos
    MAX_RETRIES: 10,      // Máximo número de intentos
    SPONSORED_TYPES: ['SP', 'SB'] // Sponsored Products y Sponsored Brands
};

// Función para esperar un tiempo determinado
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Función para probar un tipo específico de reporte
async function testSponsoredTypeReport(sponsoredType) {
    logger.info(`=== INICIANDO PRUEBA PARA ${sponsoredType} ===`);

    try {
        // Paso 1: Generar el reporte diario
        logger.info(`Generando reporte diario para ${sponsoredType}...`);
        const reportId = await ReportService.generateDailyReport(sponsoredType);
        logger.info(`Reporte generado con ID: ${reportId}`);

        // Paso 2: Consultar el estado del reporte
        let attempts = 0;
        let report;

        do {
            if (attempts > 0) {
                logger.info(`Intento ${attempts} de ${CONFIG.MAX_RETRIES}`);
            }

            logger.info("Consultando estado del reporte...");
            report = await ReportService.getReportStatus(reportId, sponsoredType);
            logger.info(`Estado actual: ${report.status}`);

            if (report.status === "SUCCESS") {
                logger.info("Reporte listo para descarga.");
                break;
            } else if (report.status === "FAILURE") {
                throw new Error(`Fallo en la generación del reporte: ${report.statusDetails}`);
            }

            if (++attempts >= CONFIG.MAX_RETRIES) {
                throw new Error("Se alcanzó el máximo número de intentos");
            }

            logger.info(`Esperando ${CONFIG.RETRY_INTERVAL/1000} segundos...`);
            await delay(CONFIG.RETRY_INTERVAL);

        } while (true);

        // Paso 3: Descargar y procesar el reporte
        logger.info("Descargando y procesando reporte...");
        const reportData = await ReportService.downloadReport(report.location);
        
        // Mostrar resumen de los datos
        const summary = {
            totalRegistros: reportData.length,
            fechaInicio: reportData[0]?.reportDate,
            fechaFin: reportData[reportData.length - 1]?.reportDate
        };
        logger.info("Resumen del reporte:", summary);

        // Paso 4: Almacenar en base de datos
        logger.info("Guardando datos en la base de datos...");
        await ReportService.saveReportToDatabase({
            sponsored_type_id: sponsoredType,
            report_data: reportData,
            date: new Date(),
            ads_accounts_id: 2
        });

        logger.info(`=== PRUEBA DE ${sponsoredType} FINALIZADA CON ÉXITO ===`);
        return true;

    } catch (error) {
        logger.error(`Error en prueba de ${sponsoredType}:`, error);
        return false;
    }
}

// Función principal de prueba
async function testAmazonAdsFlow() {
    try {
        // Verificar conexión a la base de datos
        logger.info("Verificando conexión a la base de datos...");
        await sequelize.authenticate();
        logger.info("Conexión a la base de datos exitosa");

        // Probar cada tipo de sponsored
        const results = await Promise.all(
            CONFIG.SPONSORED_TYPES.map(type => testSponsoredTypeReport(type))
        );

        // Verificar resultados
        const allSuccess = results.every(result => result === true);
        if (allSuccess) {
            logger.info("=== TODAS LAS PRUEBAS COMPLETADAS CON ÉXITO ===");
        } else {
            logger.warn("=== ALGUNAS PRUEBAS FALLARON ===");
        }

    } catch (error) {
        logger.error("Error fatal durante las pruebas:", error);
    } finally {
        // Cerrar conexión
        await sequelize.close();
        logger.info("Conexión a la base de datos cerrada");
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    testAmazonAdsFlow()
        .catch(error => {
            logger.error("Error no manejado:", error);
            process.exit(1);
        });
}

module.exports = {
    testAmazonAdsFlow,
    testSponsoredTypeReport
};


