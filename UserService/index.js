const express = require("express");
const cors = require('cors');
const app = express();
const dataSource = require("./config/config");
const userRouter = require("./routes/UserRoutes");

app.use(express.json());
app.use(cors());
app.use("/user",userRouter);

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

    app.listen(8081, () => {
        console.log("User Service running on Port 8081");
    })
})

.catch((err) => {
    console.log(err)
})