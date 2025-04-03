const axios = require('axios');
const logger = require('../utils/logger');

class AmazonAdsConfig {
    constructor() {
        // Validar variables de entorno requeridas
        this.validateEnvVariables();
        
        this.baseURL = process.env.AMAZON_ADS_API_URL;
        this.clientId = process.env.AMAZON_ADS_CLIENT_ID;
        this.clientSecret = process.env.AMAZON_ADS_CLIENT_SECRET;
        this.refreshToken = process.env.AMAZON_ADS_REFRESH_TOKEN;
        this.profileId = process.env.AMAZON_ADS_PROFILE_ID;
        
        // Cache para el access token
        this.accessToken = null;
        this.tokenExpiration = null;
    }

    validateEnvVariables() {
        const requiredVars = [
            'AMAZON_ADS_API_URL',
            'AMAZON_ADS_CLIENT_ID',
            'AMAZON_ADS_CLIENT_SECRET',
            'AMAZON_ADS_REFRESH_TOKEN',
            'AMAZON_ADS_PROFILE_ID'
        ];

        for (const varName of requiredVars) {
            if (!process.env[varName]) {
                throw new Error(`Variable de entorno requerida no encontrada: ${varName}`);
            }
        }
    }

    async createAxiosInstance() {
        try {
            // Obtener access token válido
            const accessToken = await this.getValidAccessToken();
            
            logger.info('Creando instancia de Axios para Amazon Ads API');
            
            // Crear instancia de axios con interceptores
            const instance = axios.create({
                baseURL: this.baseURL,
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Amazon-Advertising-API-ClientId': this.clientId,
                    'Amazon-Advertising-API-Scope': this.profileId,
                    'Content-Type': 'application/json'
                }
            });

            // Agregar interceptor para manejo de errores
            instance.interceptors.response.use(
                response => response,
                async error => {
                    if (error.response?.status === 401) {
                        logger.info('Token expirado, refrescando...');
                        this.accessToken = null; // Forzar refresh
                        const newToken = await this.getValidAccessToken();
                        error.config.headers['Authorization'] = `Bearer ${newToken}`;
                        return axios(error.config);
                    }
                    throw error;
                }
            );

            // Verificar conexión
            await this.testConnection(instance);
            
            return instance;

        } catch (error) {
            logger.error('Error creando instancia de Axios:', error.message);
            throw new Error(`Error en la configuración de Amazon Ads: ${error.message}`);
        }
    }

    async testConnection(instance) {
        try {
            await instance.get('/v2/profiles');
            logger.info('Conexión exitosa con Amazon Ads API');
        } catch (error) {
            logger.error('Error en la prueba de conexión:', error.response?.data || error.message);
            throw error;
        }
    }

    async getValidAccessToken() {
        // Verificar si tenemos un token válido en cache
        if (this.accessToken && this.tokenExpiration && Date.now() < this.tokenExpiration) {
            return this.accessToken;
        }

        try {
            logger.info('Solicitando nuevo access token');
            
            const response = await axios.post('https://api.amazon.com/auth/o2/token', 
                new URLSearchParams({
                    grant_type: 'refresh_token',
                    refresh_token: this.refreshToken,
                    client_id: this.clientId,
                    client_secret: this.clientSecret
                }).toString(),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            this.accessToken = response.data.access_token;
            // Establecer expiración 5 minutos antes del tiempo real
            this.tokenExpiration = Date.now() + (response.data.expires_in - 300) * 1000;
            //console.log(this.accessToken);
            //console.log(this.accessToken);
            console.log(this.tokenExpiration);
            logger.info('Nuevo access token obtenido exitosamente');
            return this.accessToken;

        } catch (error) {
            logger.error('Error obteniendo access token:', error.response?.data || error.message);
            throw new Error('Error al obtener access token');
        }
    }
}

module.exports = new AmazonAdsConfig();