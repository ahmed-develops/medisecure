const mongoose = require('mongoose');

const mongoURI = "mongodb+srv://saadamin662:wuirpx43B9MvJqWZ@cluster0.62fwy8t.mongodb.net/";

mongoose.connect(mongoURI);

module.exports = mongoose;