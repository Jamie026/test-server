const ModeNegativizationModel = require("../models/ModeNegativizationModel");


const getNegativizationModes = async (req,res) =>{

    try{
        const negativizationModes = await ModeNegativizationModel.findAll();
        res.status(200).json({"negativizationModes":negativizationModes});
    } catch(error){
        res.status(500).json({"msg":error.message});
    }
}


module.exports = {getNegativizationModes};