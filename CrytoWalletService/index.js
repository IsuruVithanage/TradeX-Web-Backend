const express = require("express");
const dataSource = require("./config/config");

const app = express();
app.use(express.json());


dataSource.initialize().then(() => {
    console.log("Database connected!!");

    app.listen(8006, () => {
        console.log("Server Started on Port 8006")
    })
})
    .catch((err) => {
        console.log(err)
    })