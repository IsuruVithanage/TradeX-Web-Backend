const express = require("express");
const cors = require('cors');
const app = express();
const dataSource = require("./config/config");
const walletRouter = require("./routes/WalletRoutes");
const WalletHistoryRounter = require("./routes/WalletHistoryRoutes")


app.use(express.json());
app.use(cors());
app.use("/wallet", walletRouter);
app.use("/history", WalletHistoryRounter);



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

<<<<<<< HEAD
    app.listen(8006, () => {
        console.log("Server Started on Port 8006")
=======
    app.listen(8005, () => {
        console.log("Server Started on Port 8005")
>>>>>>> 5d66d2ab5bb6e6dad9f392b932e4fd096fa21b91
    })
})
    .catch((err) => {
        console.log(err)
    })