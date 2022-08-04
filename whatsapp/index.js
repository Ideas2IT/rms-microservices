const express = require("express");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const mongoConfig = require("./src/configs/mongoDb.config")
const Routes = require("./src/routes/index");
require('dotenv').config();

const port = process.env.PORT;
const app = express();

app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/api", Routes);


mongoConfig._connect();

process.on('SIGINT', function () {
  mongoConfig._closeConnection()
});

app.listen(port, () => {
  console.log("Server is running on port: " + port);
});

module.exports = app;
