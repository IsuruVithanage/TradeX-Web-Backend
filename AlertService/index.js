const express = require("express");
const cors = require('cors');
const app = express();
const dataSource = require("./config/config");
const alertRouter = require("./routes/AlertRoutes");

app.use(express.json());
app.use(cors());
app.use("/alert", alertRouter);

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

.then(() => {
    console.log("Database connected!!");

    app.listen(8003, () => {
        console.log("Alert Service running on Port 8081");
    })
})

.catch((err) => {
    console.log(err);
})