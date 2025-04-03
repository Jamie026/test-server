// src/controllers/searchTermController.js
const { saveSearchTerms, getSearchTerms, negativizeSearchTerm } = require('../services/searchTermService');

// Guardar los términos de búsqueda extraídos
const saveSearchTermData = async (req, res) => {
    try {
        const data = req.body; // Obtener los datos en formato JSON
        await saveSearchTerms(data);
        res.status(200).send('Términos de búsqueda guardados correctamente');
    } catch (error) {
        res.status(500).send('Error al guardar los términos de búsqueda');
    }
};

// Obtener los términos de búsqueda
const getSearchTermsData = async (req, res) => {
    try {
        const terms = await getSearchTerms();
        res.status(200).json(terms); // Retornar los términos en formato JSON
    } catch (error) {
        res.status(500).send('Error al obtener los términos');
    }
};

// Negativizar un término
const negativizeTerm = async (req, res) => {
    const { id } = req.params;
    try {
        await negativizeSearchTerm(id);
        res.status(200).send('Término negativizado con éxito');
    } catch (error) {
        res.status(500).send('Error al negativizar el término');
    }
};

module.exports = { saveSearchTermData, getSearchTermsData, negativizeTerm };
