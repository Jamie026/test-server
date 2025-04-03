// src/services/searchTermService.js
const SearchTerm = require('../models/searchTermModel');
const { processSearchTermData } = require('../utils/helpers'); // Función para procesar los datos JSON

// Guardar los términos de búsqueda en la base de datos
const saveSearchTerms = async (data) => {
    try {
        // Procesar los datos JSON y estructurarlos para la base de datos
        const processedData = processSearchTermData(data);

        // Insertar los términos en la base de datos
        await SearchTerm.bulkCreate(processedData, { ignoreDuplicates: true });
        console.log('Términos de búsqueda guardados con éxito.');
    } catch (error) {
        console.error('Error al guardar los términos de búsqueda:', error);
        throw new Error('No se pudo guardar los términos de búsqueda');
    }
};

// Obtener todos los términos de búsqueda no negativizados
const getSearchTerms = async () => {
    try {
        const terms = await SearchTerm.findAll({
            where: { is_negative: false },
        });
        return terms;
    } catch (error) {
        console.error('Error al obtener los términos de búsqueda:', error);
        throw new Error('Error al obtener los términos de búsqueda');
    }
};

// Negativizar un término de búsqueda
const negativizeSearchTerm = async (id) => {
    try {
        await SearchTerm.update({ is_negative: true }, { where: { id } });
        console.log(`Término de búsqueda con ID ${id} negativizado con éxito.`);
    } catch (error) {
        console.error(`Error al negativizar el término con ID ${id}:`, error);
        throw new Error('Error al negativizar el término');
    }
};

module.exports = { saveSearchTerms, getSearchTerms, negativizeSearchTerm };
