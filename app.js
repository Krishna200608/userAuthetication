import 'dotenv/config'
import express from 'express';
import bodyParser from 'body-parser';
import ejs from 'ejs';
import { User } from './models/schema.js';
import flash from "connect-flash";
import { flashMiddleware } from "./middlewares/flashMiddleware.js";
import session from 'express-session';
import passport from 'passport';

//-----------------------------------------------------

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
    secret : process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// Middleware: Initialize connect-flash
app.use(flash());
app.use(flashMiddleware);

//----------------------------------------------------------------------
//Routes
//Home route
app.get("/", function(req, res){
    res.render("home");
})

//Login Route-----------------------------------------------
app.route("/login")    
.get((req, res)=>{
    res.render("login")
})

.post((req, res) => {  
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, function(err){
        if(err){
            req.flash("error", "Invalid username or password");
            return res.redirect("/login");
        } else {
            passport.authenticate("local")(req, res, function(){
                req.flash("success", "Login successful!");
                res.redirect("/secrets");
            });
        }
    });
});

//----------------------------------------------------------------------------------
//secrets routes
app.route("/secrets")

.get((req, res)=>{
    if(req.isAuthenticated()){
        res.render("secrets")
    } else {
        res.redirect("/login");
    }
})

//Register-------------------------------------------------------------------------
app.route("/register")
.get((req, res)=>{
    res.render("register")
})

.post((req, res)=>{
    
    User.register({username : req.body.username}, req.body.password, function (err, user){
        if(err){
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, function(){
                 res.redirect("/secrets")
            })
        }
    })

})


//----------------------------------------------------------------------
//Logout

app.route("/logout")
.get((req, res) => {
    req.logout((err) => {  // <-- Correct function name is `req.logout()`, not `req.logOut()`
        if (err) {
            console.log(err);
            req.flash("error", "Logout failed!"); // Show error if logout fails
            return res.redirect("/secrets");
        }
        req.flash("success", "Logout successful!");
        res.redirect("/");
    });
});




app.listen(process.env.PORT || 3000, ()=>{
    console.log("Server is running on port 3000");
})

