// SKUlogicaModel.js
const db = require('../config/dbConfig'); // Importamos la configuración de la base de datos

class SKULogic {
    /**
     * Obtiene datos de campañas asociadas a un SKU específico
     * @param {string} sku - El SKU del producto
     * @returns {Promise<object[]>} - Lista de datos de campañas
     */
    static async getCampaignDataBySKU(sku) {
        try {
            const query = `
                SELECT 
                    section, risk, asin, sku, portfolio, 
                    campaign_name, grupo, targeting, customer_search_terms, 
                    impressions, clicks 
                FROM campaigns 
                WHERE sku = ?
            `;
            const result = await db.query(query, [sku]);
            return result;
        } catch (error) {
            console.error(`Error al obtener datos de campañas por SKU ${sku}:`, error);
            throw error;
        }
    }

    /**
     * Obtiene términos de búsqueda relacionados con un SKU
     * @param {string} sku - El SKU del producto
     * @returns {Promise<string[]>} - Lista de términos de búsqueda
     */
    static async getSearchTermsBySKU(sku) {
        try {
            const query = `
                SELECT DISTINCT customer_search_terms 
                FROM campaigns 
                WHERE sku = ? AND customer_search_terms IS NOT NULL
            `;
            const result = await db.query(query, [sku]);
            return result.map(row => row.customer_search_terms);
        } catch (error) {
            console.error(`Error al obtener términos de búsqueda por SKU ${sku}:`, error);
            throw error;
        }
    }

    /**
     * Marca términos como negativos para un SKU específico
     * @param {string} sku - El SKU del producto
     * @param {string[]} terms - Lista de términos a negativizar
     * @returns {Promise<void>}
     */
    static async negativizeTermsForSKU(sku, terms) {
        try {
            const query = `
                UPDATE campaigns 
                SET is_negative = true 
                WHERE sku = ? AND customer_search_terms IN (?)
            `;
            await db.query(query, [sku, terms]);
            console.log(`Términos negativizados para SKU ${sku}: ${terms.join(', ')}`);
        } catch (error) {
            console.error(`Error al negativizar términos para SKU ${sku}:`, error);
            throw error;
        }
    }
}

module.exports = SKULogic;