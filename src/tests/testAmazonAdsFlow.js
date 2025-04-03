// src/tests/testAmazonAdsFlow.js
const ReportService = require("../services/ReportService");
const { sequelize } = require('../config/dbConfig');

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

    try {
        // Paso 1: Generar el reporte diario
        const reportId = await ReportService.generateDailyReport(sponsoredType);

        // Paso 2: Consultar el estado del reporte
        let attempts = 0;
        let report;

        do {
            if (attempts > 0) {
            }

            report = await ReportService.getReportStatus(reportId, sponsoredType);

            if (report.status === "SUCCESS") {
                break;
            } else if (report.status === "FAILURE") {
                throw new Error(`Fallo en la generación del reporte: ${report.statusDetails}`);
            }

            if (++attempts >= CONFIG.MAX_RETRIES) {
                throw new Error("Se alcanzó el máximo número de intentos");
            }

            await delay(CONFIG.RETRY_INTERVAL);

        } while (true);

        // Paso 3: Descargar y procesar el reporte
        const reportData = await ReportService.downloadReport(report.location);
        
        // Mostrar resumen de los datos
        const summary = {
            totalRegistros: reportData.length,
            fechaInicio: reportData[0]?.reportDate,
            fechaFin: reportData[reportData.length - 1]?.reportDate
        };

        // Paso 4: Almacenar en base de datos
        await ReportService.saveReportToDatabase({
            sponsored_type_id: sponsoredType,
            report_data: reportData,
            date: new Date(),
            ads_accounts_id: 2
        });

        return true;

    } catch (error) {
        return false;
    }
}

// Función principal de prueba
async function testAmazonAdsFlow() {
    try {
        // Verificar conexión a la base de datos
        await sequelize.authenticate();

        // Probar cada tipo de sponsored
        const results = await Promise.all(
            CONFIG.SPONSORED_TYPES.map(type => testSponsoredTypeReport(type))
        );

        // Verificar resultados
        const allSuccess = results.every(result => result === true);
        if (allSuccess) {
        } else {
        }

    } catch (error) {
    } finally {
        // Cerrar conexión
        await sequelize.close();
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    testAmazonAdsFlow()
        .catch(error => {
            process.exit(1);
        });
}

module.exports = {
    testAmazonAdsFlow,
    testSponsoredTypeReport
};


