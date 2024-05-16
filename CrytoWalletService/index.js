const express = require("express");
const cors = require('cors');
const app = express();
const dataSource = require("./config/config");
const walletRouter = require("./routes/WalletRoutes");
const WalletHistoryRounter = require("./routes/WalletHistoryRoutes")
const WalletLoginRounter = require("./routes/WalletLoginRoutes")
const cookieParser = require("cookie-parser")
const {validateToken} = require('./JWT')
const SeedPhraseRoutes = require("./routes/SeedPhraseRoutes")





app.use(express.json());
app.use(cookieParser());
app.use(cors( {
    origin: 'http://localhost:3000', 
    credentials: true, 
}));
app.use("/wallet", validateToken, walletRouter);
app.use("/history", validateToken, WalletHistoryRounter);
app.use("/login",  WalletLoginRounter);
app.use("/seedphrase",  SeedPhraseRoutes);





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


    app.listen(8006, () => {
        console.log("Server Started on Port 8006")

    })
})
    .catch((err) => {
        console.log(err)
    })