const Portfolio = require("../models/PortfolioModel");
const {portfoliosList} = require("../services/PortfolioService");


const getPortfolios = async (req,res) => {
    
    try {
        const portfolios = await Portfolio.findAll();
        if(portfolios){
            res.status(200).json({"portfolios":portfolios});
        }else{
            res.status(404).json({"msg":"no se encontraron portafolios disponibles"});
        }
    } catch (error){
        res.status(500).json({"msg":error.message});
    }
}

const savePortfolios = async (req,res) =>{

    try {
      const jsonData = await portfoliosList();
  
      if(jsonData){
        const filteredPortfolios = jsonData.portfolios.map(item => ({
          portfolio_id: item.portfolioId,
          name: item.name,
          state: item.state,
          ads_accounts_id: 2
        }));
  
        /*filteredPortfolios.forEach((item) => {
          Portfolio.create(item);
        });*/
  
        res.status(200).json(filteredPortfolios);
      }else{
        res.status(404).json({"msg":"Error al obtener los portafolios"});
      }
    } catch (error){
        res.status(500).json({"msg":error.message});
    }
}


module.exports = {getPortfolios, savePortfolios};