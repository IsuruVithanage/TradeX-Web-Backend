const schedule = require('node-schedule');
const updatePortfolioValueOf = require("../controllers/PortfolioValueController").updatePortfolioValueOf;

const runScheduledValueUpdaters = () => {
    
    schedule.scheduleJob('0 * * * * *', async (fireDate) => {
        await updatePortfolioValueOf("Hourly");
        console.log("\x1b[33mPortfolio Hourly Value updated\x1b[0m at:", fireDate.toLocaleString(), "\n")

    });



    schedule.scheduleJob('5 */2 * * * *', async (fireDate) => {
        await updatePortfolioValueOf("Daily");
        console.log("\x1b[33mPortfolio Daily Value updated\x1b[0m at:", fireDate.toLocaleString(), "\n")

    });



    schedule.scheduleJob('10 */3 * * * *', async (fireDate) => {
        await updatePortfolioValueOf("Weekly");
        console.log("\x1b[33mPortfolio Weekly Value updated\x1b[0m at:", fireDate.toLocaleString(), "\n")

    });
};


module.exports = runScheduledValueUpdaters;


