import 'dotenv/config'
import express from 'express';
import bodyParser from 'body-parser';
import ejs from 'ejs';
import { User } from './models/schema.js';
import session from "express-session";
import flash from "connect-flash";
import { flashMiddleware } from "./middlewares/flashMiddleware.js";
import bcrypt from 'bcryptjs';

//-----------------------------------------------------

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
    secret: "yourSecretKey", // Change to a strong secret
    resave: false,
    saveUninitialized: true
}));

// Middleware: Initialize connect-flash
app.use(flash());
app.use(flashMiddleware);

  
const saltRounds = 10;


//----------------------------------------------------------------------

app.get("/", function(req, res){
    res.render("home");
})

app.route("/login")    
.get((req, res)=>{
    res.render("login")
})

.post((req, res) => {  // Ensure you're defining the route with `app.post()`
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({ email: username })
        .then((foundUser) => {
            if (!foundUser) {
                req.flash("error", "User not found! Please register.");
                return res.redirect("/login");
            }

            bcrypt.compare(password, foundUser.password, (err, result) => {
                if (err) {
                    console.error("Error comparing passwords:", err);
                    req.flash("error", "An error occurred. Please try again.");
                    return res.redirect("/login");
                }

                if (result) {
                    res.render("secrets", { successMessage: "Login successful! 😎 Welcome back." });
                } else {
                    req.flash("error", "Wrong password! Please try again.");
                    res.redirect("/login");
                }
            });
        })
        .catch((err) => {
            console.error("Error finding user:", err);
            req.flash("error", "An error occurred. Please try again.");
            res.redirect("/login");
        });
});


app.route("/register")
.get((req, res)=>{
    res.render("register")
})

.post((req, res)=>{

    bcrypt.genSalt(saltRounds, function(err, salt) {
        if(err){
            console.log(err);
            return res.redirect("/register");
        }
        bcrypt.hash(req.body.password, salt, function(err, hash) {
            if (err) {
                console.log(err);
                return res.redirect("/register");
            }
            // Store hash in your password DB.
            const newUser = new User({
                email : req.body.username, 
                password : hash
               })
            
               newUser.save()
               .then(()=>{
                res.render("secrets", { successMessage: "Registration 😀 successful! Welcome." });
               })
               .catch((err)=>{
                    console.log(err);
                    res.redirect("/register")
               });
        });
    });

       
})




app.listen(process.env.PORT || 3000, ()=>{
    console.log("Server is running on port 3000");
})

