const dataSource = require("../config/config");
const PortfolioValueRepo = dataSource.getRepository("PortfolioValue");

const getPortfolioValueData = async (req) => {
    try {
        if (!req.query.userId) {
            res.status(404).json({ message: 'User Id not found' });
        } 
        
        else {
            const PortfolioValueData = await PortfolioValueRepo.find({
                select: ["time", "value", "timePeriod"],
                where: {
                    userId: req.query.userId,
                },
                order: {
                    timePeriod: "ASC",
                    recordNo: "ASC",
                },
            });


            const hourlyValueData = PortfolioValueData.filter(data => data.timePeriod === "Hourly");
            const dailyValueData = PortfolioValueData.filter(data => data.timePeriod === "Daily");
            const weeklyValueData = PortfolioValueData.filter(data => data.timePeriod === "Weekly");

            hourlyValueData.forEach(data => { data.time = Math.floor(Date.parse(data.time) / 1000); });
            dailyValueData.forEach(data => { data.time = new Date(data.time).toISOString().split('T')[0]; });
            weeklyValueData.forEach(data => { data.time = new Date(data.time).toISOString().split('T')[0]; });

            
            return({
                Hourly: hourlyValueData,
                Daily: dailyValueData,
                Weekly: weeklyValueData
            });
        }
    }
    
    catch (error) {
        console.log("\nError fetching value Data:", error);
        res.status(500).json({ message: error.message });
    }
};




const updatePortfolioValueData = async (req, res) => {
    try {
        const assetToUpdate = await PortfolioValueRepo.findOne({
            where: {
                assetId: req.query.assetId,
            },
        })

        if (!assetToUpdate) {
            res.status(404).json({message: 'Asset not found'});
        } 
        
        else {
            PortfolioValueRepo.merge(assetToUpdate, req.body);
            await PortfolioValueRepo.save(assetToUpdate);

            const updatedAssets = await getAllAssets({ 
                query: { 
                    userId: req.body.userId,
                }
            }, res );

            res.status(200).json(updatedAssets);
        }
    } 
    
    catch (error) {
        console.log("\nError updating asset:", error);
        res.status(500).json({message: error.message});
    }
};


module.exports = {
    getPortfolioValueData,
    updatePortfolioValueData,
};