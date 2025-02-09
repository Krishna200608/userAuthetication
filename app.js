import 'dotenv/config'
import express from 'express';
import bodyParser from 'body-parser';
import ejs from 'ejs';
import { User } from './models/schema.js';
import session from "express-session";
import flash from "connect-flash";
import { flashMiddleware } from "./middlewares/flashMiddleware.js";

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


//----------------------------------------------------------------------

app.get("/", function(req, res){
    res.render("home");
})

app.route("/login")    
.get((req, res)=>{
    res.render("login")
})

.post((req, res)=>{
    const username = req.body.username
    const password = req.body.password;

   //console.log(username);

    User.findOne({email : username})
        .then((foundUser)=>{
            if(foundUser){
                if(foundUser.password === password){
                    res.render("secrets");
                } else {
                    req.flash("error", "Wrong password! Please try again.");
                    res.redirect("/login")
                }    
            } else {
                req.flash("error", "User not found! Please Register.");
                res.redirect("/login");
            }
        })
        .catch((err) => {
            console.error("Error finding user:", err);
            req.flash("error", "An error occurred. Please try again.");
            res.redirect("/login");
        });
})

app.route("/register")
.get((req, res)=>{
    res.render("register")
})

.post((req, res)=>{
   const newUser = new User({
    email : req.body.username,
    password : req.body.password
   })

   newUser.save()
   .then(()=>{
        res.render("secrets")
   })
   .catch((err)=>{
        console.log(err);
   })
})




app.listen(process.env.PORT || 3000, ()=>{
    console.log("Server is running on port 3000");
})

