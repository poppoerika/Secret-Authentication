//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const md5 = require("md5");
//const encrypt = require("mongoose-encryption");


const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static("public"));

// Create a database called userDB to store user email and password
mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

// Create userSchema
const userSchema =  new mongoose.Schema({
    email: String,
    password: String
});

// Encrypt only password field in userSchema
// Use .env file to store the encryption key and call it with process.env.SECRET
//userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});

// Create a new model
const User = mongoose.model("User", userSchema);

// Renders an ejs page for /
app.get("/", function(req, res) {
    res.render("home");
});

// Renders an ejs page for /login
app.get("/login", function(req, res) {
    res.render("login");
});

// Renders an ejs page for /registet
app.get("/register", function(req, res) {
    res.render("register");
});

// Register POST
app.post("/register", function(req, res) {
    // Create a new row for the User table
    const newUser = new User({
        email: req.body.username,
        // Using md5, hash the user password
        password: md5(req.body.password)
    });

    newUser.save(function(err) {
        if (err) {
            console.log(err);
        } else {
            res.render("secrets");
        }
    });
});

// Login POST
app.post("/login", function(req, res) {
    const userName = req.body.username;
    // Create a hashed version of the password for login
    const password = md5(req.body.password);

    // Check if entered username and password exist in the userDB
    // foundUser is a JS object
    User.findOne({email: userName}, function(err, foundUser){
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                // Check retered value is the same as the password that the user used to login
                if (foundUser.password === password) {
                    res.render("secrets");
                }
            }
        }
    });
});



app.listen(3000, function() {
    console.log("Server started on port 3000.");
})