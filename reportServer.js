// reportServer.js
require('dotenv').config();
const ReportScheduler = require('./src/jobs/scheduler');
const { sequelize } = require('./src/config/dbConfig');
const amazonAdsConfig = require('./src/config/AmazonAdsConfig');

async function startReportServer() {
    try {
        // Verificar conexión a la base de datos
        await sequelize.authenticate();

        // Verificar conexión con Amazon Ads API
        try {
            const axiosInstance = await amazonAdsConfig.createAxiosInstance();
            const response = await axiosInstance.get('/v2/profiles');
        } catch (error) {
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
            await scheduler.reportQueue.close();
            await sequelize.close();
            process.exit(0);
        });

        process.on('uncaughtException', (error) => {
            process.exit(1);
        });

    } catch (error) {
        process.exit(1);
    }
}

startReportServer();