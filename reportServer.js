// reportServer.js
require('dotenv').config();
const ReportScheduler = require('./src/jobs/scheduler');
const logger = require('./src/utils/logger');
const { sequelize } = require('./src/config/dbConfig');
const amazonAdsConfig = require('./src/config/AmazonAdsConfig');

async function startReportServer() {
    try {
        // Verificar conexión a la base de datos
        await sequelize.authenticate();
        logger.info('Conexión a la base de datos establecida');

        // Verificar conexión con Amazon Ads API
        try {
            const axiosInstance = await amazonAdsConfig.createAxiosInstance();
            const response = await axiosInstance.get('/v2/profiles');
            logger.info('Conexión con Amazon Ads API establecida');
        } catch (error) {
            logger.error('Error al conectar con Amazon Ads API:', error.message);
            process.exit(1);
        }

        // Inicializar y configurar el scheduler
        const scheduler = new ReportScheduler();
        
        // Programar reportes para cada tipo de sponsored
        const sponsoredTypes = ['SP', 'SB']; // Tipos de sponsored ads
        for (const type of sponsoredTypes) {
            await scheduler.scheduleReport(type);
        }

        // Manejo de señales del sistema
        process.on('SIGTERM', async () => {
            logger.info('Cerrando servidor de reportes...');
            await scheduler.reportQueue.close();
            await sequelize.close();
            process.exit(0);
        });

        process.on('uncaughtException', (error) => {
            logger.error('Error no capturado:', error);
            process.exit(1);
        });

    } catch (error) {
        logger.error('Error fatal:', error);
        process.exit(1);
    }
}

startReportServer();