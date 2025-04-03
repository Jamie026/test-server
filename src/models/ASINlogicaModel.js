// ASINlogicaModel.js
const db = require('../config/dbConfig'); // Importamos la configuración de la BD

class ASINLogic {
    /**
     * Obtiene datos de campañas asociadas a un ASIN específico
     * @param {string} asin - El ASIN del producto
     * @returns {Promise<object[]>} - Lista de datos de campañas
     */
    static async getCampaignDataByASIN(asin) {
        try {
            const query = `
                SELECT 
                    section, risk, asin, sku, portfolio, 
                    campaign_name, grupo, targeting, customer_search_terms, 
                    impressions, clicks 
                FROM campaigns 
                WHERE asin = ?
            `;
            const result = await db.query(query, [asin]);
            return result;
        } catch (error) {
            console.error(`Error al obtener datos de campañas por ASIN ${asin}:`, error);
            throw error;
        }
    }

    /**
     * Obtiene términos de búsqueda relacionados con un ASIN
     * @param {string} asin - El ASIN del producto
     * @returns {Promise<string[]>} - Lista de términos de búsqueda
     */
    static async getSearchTermsByASIN(asin) {
        try {
            const query = `
                SELECT DISTINCT customer_search_terms 
                FROM campaigns 
                WHERE asin = ? AND customer_search_terms IS NOT NULL
            `;
            const result = await db.query(query, [asin]);
            return result.map(row => row.customer_search_terms);
        } catch (error) {
            console.error(`Error al obtener términos de búsqueda por ASIN ${asin}:`, error);
            throw error;
        }
    }

    /**
     * Marca términos como negativos para un ASIN específico
     * @param {string} asin - El ASIN del producto
     * @param {string[]} terms - Lista de términos a negativizar
     * @returns {Promise<void>}
     */
    static async negativizeTermsForASIN(asin, terms) {
        try {
            const query = `
                UPDATE campaigns 
                SET is_negative = true 
                WHERE asin = ? AND customer_search_terms IN (?)
            `;
            await db.query(query, [asin, terms]);
            console.log(`Términos negativizados para ASIN ${asin}: ${terms.join(', ')}`);
        } catch (error) {
            console.error(`Error al negativizar términos para ASIN ${asin}:`, error);
            throw error;
        }
    }
}

module.exports = ASINLogic;