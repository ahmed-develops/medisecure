const express = require('express');
const app = express();
const db = require('./config/db');
var cors = require('cors')
// var multichain = require("./config/multichain");

app.use(cors())

db.connection.once('open', () => {
    console.log('db connected');
})
    .on("error", error => {
        console.log("Error ->", error)
    })

app.listen( 3001, function () {
    console.log('server is listening')
})

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
    res.setHeader('Cache-Control', 'no-cache');
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', require('./routes/index.js'))

// app.get("/getMultichain", (req, res) => {
//     console.log("getMultichain");
//     multichain.getInfo((err, info) => {
//         if (err) {
//             console.log(err, info, "err");
//         } else {
//             console.log(err, info, "info");
//         }
//         res.send({ err, info });
//     });
// })