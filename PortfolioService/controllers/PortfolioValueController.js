const dataSource = require("../config/config");

const getPortfolioValueData = async (req, res) => {
    try {
        if (!req.query.userId) {
            return res.status(404).json({ message: 'User Id not found' });
        } 


        const queryResult = await dataSource.query(
        `   SELECT 'Hourly' AS "type", "time", "value"
            FROM "portfolioHourlyValue"
            WHERE "userId" = $1
            
            UNION ALL
            
            SELECT 'Daily' AS "type", "time", "value"
            FROM "portfolioDailyValue"
            WHERE "userId" = $1
            
            UNION ALL
            
            SELECT 'Weekly' AS "type", "time", "value"
            FROM "portfolioWeeklyValue"
            WHERE "userId" = $1
            
            ORDER BY "type" ASC, "time" ASC; 
        `, 
        [req.query.userId]);


        const hourlyData = queryResult
            .filter(data => data.type === 'Hourly')
            .map(data => ({ ...data, time: Math.floor(Date.parse(data.time) / 1000) }));

        const dailyData = queryResult
            .filter(data => data.type === 'Daily')
            .map(data => ({ ...data, time: new Date(data.time).toISOString().split('T')[0] }));

        const weeklyData = queryResult
            .filter(data => data.type === 'Weekly')
            .map(data => ({ ...data, time: new Date(data.time).toISOString().split('T')[0] }));


            
        return {
            Hourly: hourlyData,
            Daily: dailyData,
            Weekly: weeklyData
        };

    } catch (error) {
        console.log("\nError fetching value Data:", error);
        return res.status(500).json({ message: error.message });
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