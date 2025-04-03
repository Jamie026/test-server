const { sequelize } = require('../config/dbConfig');

const reportList = async () => {
    const results = await sequelize.query(`
        SELECT 
	        cst.id as "id",
	        st.name as "category",
            cst.customer_search_term as "nombre",
            nm.name as "negativizationMode",
            nt.name as "tipo",
            cst.created_at as "dateNegativized",
            cst.updated_at as "dateUpdated",
            seg.name as "section",
            strs.date as "fecha"
        FROM customer_seach_terms cst
        JOIN sponsored_type st ON cst.sponsored_type_id = st.id
        JOIN negativization_mode nm ON cst.negativization_mode_id = nm.id 
        JOIN negative_type nt ON cst.negative_type_id = nt.id 
        JOIN segmentation seg ON cst.segmentation_id = seg.id
        JOIN search_terms_reports strs ON cst.search_terms_reports_id = strs.id`);

    return results[0];
}

module.exports = {reportList};