
// src/services/ParametrosService.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; 

// Servicio para obtener data de AdGroups
export const getAdGroups = async () => {
  try {
    const response = await axios.get(`${API_URL}/adgroups`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo AdGroups:', error);
    throw error;
  }
};

// Servicio para obtener data de Campaigns
export const getCampaigns = async () => {
  try {
    const response = await axios.get(`${API_URL}/campaigns`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo Campaigns:', error);
    throw error;
  }
};

// Servicio para obtener Portfolios
export const getPortfolios = async () => {
  try {
    const response = await axios.get(`${API_URL}/portfolios`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo Portfolios:', error);
    throw error;
  }
};

// Obtener SKUs
export const getSKUs = async () => {
  try {
    const response = await axios.get(`${API_URL}/skus`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo SKUs:', error);
    throw error;
  }
};

// Obtener ASINs
export const getASINs = async () => {
  try {
    const response = await axios.get(`${API_URL}/asins`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo ASINs:', error);
    throw error;
  }
};

// Guardar parámetros
export const saveParametros = async (parametrosData) => {
  try {
    const response = await axios.post(`${API_URL}/parametros`, parametrosData);
    return response.data;
  } catch (error) {
    console.error('Error guardando parámetros:', error);
    throw error;
  }
};

