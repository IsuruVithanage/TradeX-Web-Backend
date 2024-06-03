const express = require("express");
const cors = require('cors');
const app = express();
const dataSource = require("./config/config");
const quizRouter = require("./routes/QuizRoutes");
const orderRouter = require("./routes/OrderRoutes");
const suggestionRouter = require("./routes/SuggetionRoutes");
const startRealtimeMonitoring = require("./LimitOrderMonitoring");

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));
app.use("/quiz",quizRouter);
app.use("/order",orderRouter);
app.use("/suggestion",suggestionRouter);

app.get('/endpoint/hello', (req, res) => {
    res.json({ message: "Hello from the microservice!" });
});

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
        startRealtimeMonitoring();

        app.listen(8005, () => {
            console.log("Question Service running on Port 8005");
        })
    })

    .catch((err) => {
        console.log(err)
    })