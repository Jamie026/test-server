const {generateDailyReport , getReport , downloadAndProcessReport , saveReportToDatabase} = require('../../services/ReportService');
const { sequelize } = require('../../config/dbConfig');
const logger = require('../../utils/logger');

class ReportProcessor {
    /*constructor() {
        this.reportService = ReportService;
    }*/

    async process(job) {
        const { sponsored_type_id, reportId } = job.data;
        console.log({ sponsored_type_id, reportId });
        console.log(sponsored_type_id);
        logger.info(`Iniciando procesamiento para sponsored_type_id: ${sponsored_type_id}`);

        const transaction = await sequelize.transaction();

        try {
            // Generar reporte
           // const generatedReportId = await this.reportService.generateDailyReport(sponsored_type_id);
            const generatedReportId = await generateDailyReport(sponsored_type_id);
            console.log(generatedReportId);
            logger.info(`Reporte generado: ${generatedReportId}`);

            // Esperar y verificar estado
            const reportData = await this.pollReportStatus(generatedReportId);

            //const reportProccessed = await processReportData(reportData);

            // Guardar en base de datos usando ReportService
            //const savedReport = await this.reportService.saveReportToDatabase({
                const savedReport = await saveReportToDatabase({
                id: reportId, // Usamos el ID del job para actualizar el registro existente
                sponsored_type_id,
                report_data: reportData,
                date: new Date() ,
                ads_accounts_id: 2
            }, transaction);

            await transaction.commit();
            logger.info(`Reporte ${generatedReportId} procesado y guardado con éxito`);
            return { success: true, reportId: savedReport.id };
        } catch (error) {
            await transaction.rollback();
            logger.error(`Error en procesamiento: ${error.message}`);
            throw error;
        }
    }

    async pollReportStatus(reportId, maxAttempts = 100) {
        let attempts = 0;
        const POLL_INTERVAL = 120000; // 5 segundos

        while (attempts < maxAttempts) {
            //const status = await this.reportService.getReport(reportId);
            const status = await getReport(reportId);
            if (status.status === 'COMPLETED') {
                logger.info(`Reporte ${reportId} completado con éxito - status: ${status.status}`);
                //return await this.reportService.downloadAndProcessReport(status.url);
                return await downloadAndProcessReport(status.url);
            }

            if (status.status === 'FAILED') {
                throw new Error(`Reporte fallido: ${status.statusDetails || 'Unknown error'}`);
            }

            logger.info(`Esperando estado del reporte ${reportId}, intento ${attempts + 1}/${maxAttempts}`);
            await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
            attempts++;
        }

        throw new Error('Tiempo de espera agotado');
    }
}

module.exports = { ReportProcessor };