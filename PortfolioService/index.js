const express = require("express");
const cors = require('cors');
const app = express();
const dataSource = require("./config/config");
const createTriggerFunction = require('./Triggers/checkAndDeleteAssets');
const update_portfolio_value_trigger = require('./Triggers/update_portfolio_value_trigger');
const runScheduledValueUpdaters = require('./Scheduler/scheduler');
const assetRouter = require("./routes/AssetRoutes");
const PortfolioValueRouter = require("./routes/PortfolioValueRoutes");
const TransactionHistoryRouter = require("./routes/TransactionHistoryRoutes");


app.use(express.json());
app.use(cors());
app.use("/portfolio/asset", assetRouter);
app.use("/portfolio/value", PortfolioValueRouter);
app.use("/portfolio/history", TransactionHistoryRouter);

app.use((req, res) => {
    console.log(`${req.originalUrl} Endpoint Not found`);
    res.status(404).json({
        message: `${req.originalUrl} Endpoint Not found`
    });
});

app.use((error, req, res) => {
    console.log("Error :", error);
    res.status(500).json({
        message: error.message
    });
});


dataSource.initialize()

.then(async() => {
    //await createTriggerFunction();
    //await update_portfolio_value_trigger();
    runScheduledValueUpdaters();

    console.log("Database connected!!");

    app.listen(8011, () => {
        console.log("Portfolio Service running on Port 8011");
    })
})

.catch((err) => {
    console.log(err);
})