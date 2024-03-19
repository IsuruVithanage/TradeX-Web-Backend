const express = require("express");
const cors = require('cors');
const app = express();
const dataSource = require("./config/config");
const walletRouter = require("./routes/WalletRoutes");


app.use(express.json());
app.use(cors());
app.use("/wallet", walletRouter);


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


dataSource.initialize().then(() => {
    console.log("Database connected!!");

    app.listen(8005, () => {
        console.log("Server Started on Port 8005")
    })
})
    .catch((err) => {
        console.log(err)
    })