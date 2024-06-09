const assetOperations = require("../services/AssetService");
const valueOperations = require("../services/PortfolioValueService");



const updatePortfolioValueOf = async (intoTable) => {
    try {
        let fromTable = "";

        switch(intoTable){
            case "Hourly":  fromTable = "";          break;
            case "Daily":   fromTable = "Hourly";    break;
            case "Weekly":  fromTable = "Daily";     break;
            default:    return;
        }

        
        const dataToUpdate = ( intoTable === "Hourly" ) ? 
        await assetOperations.getRealtimeTotalValues() :
        await valueOperations.getAvgValuesFrom(fromTable);


        if (dataToUpdate.length === 0) { return }

        dataToUpdate.forEach(data => {
            data.time = Math.floor((new Date().getTime()) / 1000);
        });

        await valueOperations.updateValueOf(dataToUpdate, intoTable);
    }
    
    catch (error) {
        console.log(`\nError updating ${intoTable} value:`, error);
    }
}





module.exports = {
    updatePortfolioValueOf
};