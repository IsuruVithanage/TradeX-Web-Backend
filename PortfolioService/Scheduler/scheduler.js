const cron = require('node-cron');
const updatePortfolioValueOf = require("../controllers/PortfolioValueController").updatePortfolioValueOf;

const runScheduledValueUpdaters = () => {
    
    cron.schedule('0 * * * * *', async () => {
        await updatePortfolioValueOf("Hourly");
        console.log("\x1b[33mPortfolio Hourly Value updated\x1b[0m at:", new Date().toLocaleString(), "\n")
    });



    cron.schedule('5 */2 * * * *', async () => {
        await updatePortfolioValueOf("Daily");
        console.log("\x1b[33mPortfolio Daily Value updated\x1b[0m at:", new Date().toLocaleString(), "\n")
    });



    cron.schedule('10 */3 * * * *', async () => {
        await updatePortfolioValueOf("Weekly");
        console.log("\x1b[33mPortfolio Weekly Value updated\x1b[0m at:", new Date().toLocaleString(), "\n")
    });
};


module.exports = runScheduledValueUpdaters;


