const dataSource = require("../config/config");


const getPortfolioValueData = async (userId, timezoneOffset) => {
    try {
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
        [userId]);

        const hourlyData = queryResult
            .filter(data => data.type === 'Hourly')
            .map(data => ({ ...data, time: data.time.getTime()/1000 - (timezoneOffset * 60) }));

        // const dailyData = queryResult
        //     .filter(data => data.type === 'Daily')
        //     .map(data => ({ ...data, time: new Date(data.time).toLocaleDateString('en-CA') }));

        // const weeklyData = queryResult
        //     .filter(data => data.type === 'Weekly')
        //     .map(data => ({ ...data, time: new Date(data.time).toLocaleDateString('en-CA') }));


        const dailyData = queryResult
            .filter(data => data.type === 'Daily')
            .map(data => ({ ...data, time: data.time.getTime()/1000 - (timezoneOffset * 60) }));

        const weeklyData = queryResult
            .filter(data => data.type === 'Weekly')
            .map(data => ({ ...data, time: data.time.getTime()/1000 - (timezoneOffset * 60) }));


            
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





const getAvgValuesFrom = async (fromTable) => {
    try {
        const avgValues = await dataSource
            .getRepository(`Portfolio${fromTable}Value`)
            .createQueryBuilder("p")
            .select("p.userId", "userId")
            .addSelect('AVG("value")', 'value')
            .groupBy("p.userId")
            .getRawMany();

        return avgValues;
    }

    catch (error) {
        console.log("\nError getting grouped avg values:", error);
    }
}





const updateValueOf = async (dataToUpdate, intoTable) => {
    try {
        await dataSource
            .getRepository(`Portfolio${intoTable}Value`)
            .createQueryBuilder()
            .insert()
            .into(`portfolio${intoTable}Value`)
            .values(dataToUpdate)
            .execute();
    }

    catch (error) {
        console.log("\nError updating hourly value:", error);
    }
};





module.exports = {
    getPortfolioValueData,
    getAvgValuesFrom,
    updateValueOf
};