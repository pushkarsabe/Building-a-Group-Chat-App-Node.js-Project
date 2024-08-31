const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const sequelize = require('./util/database');

const app = express();
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const todoRoute = require('./routes/user');

app.use("/user", todoRoute);

sequelize.sync()
    .then(result => {
        app.listen(3000);
    })
    .catch(err => {
        console.log(err);
    })

