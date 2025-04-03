const { productsAdsSP } = require("../services/AdsService");
const ASIN = require("../models/AsinModel");

const getAsins = async (req,res) => {

  try{
    const asins = await ASIN.findAll();
    if(asins){
      res.status(200).json({"asins":asins});
    }else{
      res.status(404).json({"msg":"no se encontraron ASINs vinculados a la cuenta publicitaria"});
    }
  }catch(error){
    res.status(500).json({"msg":error.message});
  }
}

const saveAsins = async (req,res) => {

    try{
      const asins = await productsAdsSP();
  
      const uniqueAsins = asins.productAds.filter(
        (user, index, self) =>
          index === self.findIndex(u => u.asin === user.asin)
      );
      
      let asinsList = []
      uniqueAsins.forEach((productAd,index) => {
        //asinsList.push(productAd.asin);
        console.log(`Index: ${index+1} - ASIN: ${productAd.asin}`);
        if(productAd.asin !== undefined){
        asinsList.push(productAd.asin);
        }
      });
  
      console.log(asinsList)
      console.log(asinsList.length);
  
      const asinBody = {
        asin_id : "",
        ads_accounts_id :2
      }
  
      /*for(let i=0; i<asinsList.length;i++){
        asinBody.asin_id = asinsList[i];
    
        ASIN.create(asinBody);
      }*/
  
      res.status(200).json(asins);
  
    }catch (error){
      res.status(500).json({"msg":error.message});
    }
}

module.exports = {getAsins, saveAsins};