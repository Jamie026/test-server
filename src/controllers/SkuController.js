const ASIN = require("../models/AsinModel");
const SKU = require("../models/SkuModel");
const {productsAdsSP} = require("../services/AdsService");


const getSkus = async (req,res) => {
    
    try {
        const skus = await SKU.findAll();
        if(skus){
            res.status(200).json({"skus":skus});
        }else{
            res.status(404).json({"msg":"no se encontraron skus configurados en la cuenta publicitaria"});
        }
    } catch (error){
        res.status(500).json({"msg":error.message});
    }
}

const saveSKUs = async (req,res) =>{

    try {
  
      const jsonData = await productsAdsSP();
      // Obtener todos los ASINs registrados en la BD
      const asinsInDB = await ASIN.findAll();
  
      // Crear un diccionario para hacer el match rápido
      const asinMap = {};
      asinsInDB.forEach(asin => {
        asinMap[asin.asin_id] = asin.id; // Guardamos { asin_id: id }
      });
  
      // Obtener los skus únicos de cada asin
      const asinSkuMap = {};
      jsonData.productAds.forEach(ad => {
        if (!asinSkuMap[ad.asin]) {
          asinSkuMap[ad.asin] = new Set();
        }
        asinSkuMap[ad.asin].add(ad.sku);
      });
  
      // Preparar datos para inserción
      const skusToInsert = [];
  
      for (const asin in asinSkuMap) {
        if (asinMap[asin]) { // Solo insertar si el ASIN existe en la BD
          asinSkuMap[asin].forEach(sku => {
            skusToInsert.push({ sku, asin_id: asinMap[asin] });
          });
        }
      }
  
      // Encuentra los índices de los elementos con asin_id 3 y 4
      const indexAsin3 = skusToInsert.findIndex(item => item.asin_id === 3);
      const indexAsin4 = skusToInsert.findIndex(item => item.asin_id === 4);
  
      // Si ambos existen, hacemos el ajuste
      if (indexAsin3 !== -1 && indexAsin4 !== -1 && indexAsin3 > indexAsin4) {
        // Extraemos el elemento con asin_id 3
        const itemAsin3 = skusToInsert.splice(indexAsin3, 1)[0];
        
        // Insertamos el elemento antes del asin_id 4
        skusToInsert.splice(indexAsin4, 0, itemAsin3);
      }
      
      
      //SKU.bulkCreate(skusToInsert);
  
      res.json(skusToInsert);
  
    }catch(error){
      res.status(500).json(error.message);
    }

}

module.exports = {getSkus, saveSKUs};