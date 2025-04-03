const Queue = require('bull');
const { ReportProcessor } = require('./processors/ReportJobProcessor'); // Ruta correcta
const logger = require('../utils/logger');
const Report = require('../models/ReportModel');
const { sequelize } = require('../config/dbConfig');

class ReportScheduler {
    constructor() {
        this.SPONSORED_TYPES = ['SP', 'SB'];

        this.reportQueue = new Queue('amazon-ads-reports', {
            redis: {
                host: process.env.REDIS_HOST || 'localhost',
                port: process.env.REDIS_PORT || 6379,
                retryStrategy: (times) => {
                    const delay = Math.min(times * 50, 2000);
                    return delay;
                }
            },
            defaultJobOptions: {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 1000
                },
                removeOnComplete: false,
                removeOnFail: false,
                timeout: 300000 // 5 minutos
            }
        });

        this.processor = new ReportProcessor();
        this.initializeQueue();
    }

    async initializeQueue() {
        this.reportQueue.on('completed', async (job, result) => {
            const { reportId, sponsored_type_id } = job.data;
            logger.info(`Reporte ${reportId} procesado exitosamente para sponsored_type_id: ${sponsored_type_id}`);
            // Nota: No actualizamos status aquí porque ReportModel.js no tiene ese campo
        });

        this.reportQueue.on('failed', async (job, error) => {
            const { reportId, sponsored_type_id } = job.data;
            logger.error(`Error procesando reporte ${reportId} para ${sponsored_type_id}: ${error.message}`);
        });

        this.reportQueue.on('stalled', (job) => {
            logger.warn(`Job ${job.id} stalled`);
        });

        this.reportQueue.on('error', (error) => {
            logger.error('Queue error:', error);
        });

        this.reportQueue.process(async (job) => {
            logger.info(`Procesando job ${job.id} para ${job.data.sponsored_type_id}`);
            return await this.processor.process(job);
        });
    }
    
    async scheduleReport(sponsoredType) {
        if (!this.SPONSORED_TYPES.includes(sponsoredType)) {
            throw new Error(`Tipo de sponsored inválido: ${sponsoredType}. Debe ser uno de: ${this.SPONSORED_TYPES.join(', ')}`);
        }

        //const reportIDs = [];

        try {
            const report = await Report.create({
                sponsored_type_id: sponsoredType === 'SP' ? 1 : 2, // Asumiendo IDs para SP y SB
                date: new Date(),
                report_data: null, // Se actualizará después
                ads_accounts_id: 2
            });


            const job = await this.reportQueue.add({
                type: 'daily-report',
                sponsored_type_id: sponsoredType === 'SP' ? 1 : 2,
                reportId: report.id,
                timestamp: new Date().toISOString()
            });

            logger.info(`Reporte programado: ${job.id} para sponsored_type_id: ${sponsoredType}`);
            console.log("Reporte ID :",report.id);
            return report.id;
        } catch (error) {
            logger.error(`Error programando reporte para ${sponsoredType}: ${error.message}`);
            throw error;
        }
    }

    async scheduleAllDailyReports() {
        logger.info('Programando reportes diarios para todos los tipos de sponsored');
        const reportIds = [];

        for (const sponsoredType of this.SPONSORED_TYPES) {
            try {
                const reportId = await this.scheduleReport(sponsoredType);
                reportIds.push({ type: sponsoredType, id: reportId });
            } catch (error) {
                logger.error(`Error programando reporte para ${sponsoredType}: ${error.message}`);
            }
        }

        return reportIds;
    }
}

module.exports = ReportScheduler;