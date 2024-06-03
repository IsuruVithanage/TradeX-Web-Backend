const express = require("express");
const cors = require("cors");
const app = express();
const dataSource = require("./config/config");
const userRouter = require("./routes/UserRoutes");
require('dotenv').config();
const cookieParser = require("cookie-parser");

app.use(express.json());
app.use(cors());
app.use("/user", userRouter);
app.use(cookieParser());

// app.post("/register", async (req, res) => {
//   const { userName, password, email } = req.body;
//   try {
//     const hash = await bcrypt.hash(password, 10);
//     const userRepository = dataSource.getRepository(User);
//     const user = userRepository.create({
//       userName: userName,
//       email: email,
//       password: hash,
//     });
//     await userRepository.save(user);
//     res.json("USER REGISTERED");
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// app.post("/Login", async (req, res) => {
//   const userRepository = dataSource.getRepository(User);
//   const { userName, password } = req.body;
//   const user = await userRepository.findOne({ where: { userName: userName } });

//   if (!user) {
//     res.status(400).json({ error: "User doesn't exist" });
//   }

//   const dbPassword = user.password;
//   bcrypt.compare(password, dbPassword).then((match) => {
//     if (!match) {
//       res
//         .status(400)
//         .json({ error: "Wrong Username and Password Combination!" });
//     } else {
//       const accessToken = createTokens(user);
//       res.cookie("access-token", accessToken, {
//         maxAge: 60 * 60 * 24 * 30 * 1000,
//         httpOnly: true,
//       });

//       res.json("logged in");
//     }
//   });
// });

// Handle 404 errors
app.use((req, res) => {
  console.log(`${req.originalUrl} Endpoint Not found`);
  res.status(404).json({
    message: `${req.originalUrl} Endpoint Not found`,
  });
});

app.use((error, req, res) => {
  console.log("Error :", error);
  res.status(500).json({
    message: error.message,
  });
});

dataSource
  .initialize()

  .then(() => {
    console.log("Database connected!!");

    app.listen(8004, () => {
      console.log("User Service running on Port 8004");
    });
  })

  .catch((err) => {
    console.log(err);
  });
