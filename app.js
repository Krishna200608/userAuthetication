
import 'dotenv/config'
import express from 'express';
import bodyParser from 'body-parser';
import ejs from 'ejs';
import { User } from './models/schema.js';
import flash from "connect-flash";
import { flashMiddleware } from "./middlewares/flashMiddleware.js";
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
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

passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
      cb(null, { id: user.id, username: user.username });
    });
  });
  
  passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, user);
    });
  })

console.log("Google Client ID:", process.env.CLIENT_ID);
console.log("Google Client Secret:", process.env.CLIENT_SECRET);

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo" // Ensure this URL is correct
  },
  function(accessToken, refreshToken, profile, done) {
    console.log(profile);
    User.findOrCreate(
        { googleId: profile.id },
        { username: profile.emails?.[0]?.value || `google_${profile.id}` }, 
         function (err, user) {
      return done(err, user);
    });
  }
));



// Middleware: Initialize connect-flash
app.use(flash());
app.use(flashMiddleware);

//----------------------------------------------------------------------
//Routes
//Home route
app.get("/", function(req, res){
    res.render("home");
})
//----------------------------------------------------

app.get("/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get("/auth/google/secrets",
    passport.authenticate("google", { failureRedirect: "/login" }),
    function (req, res) {
        // Successful authentication
        res.redirect("/secrets");
    }
);

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
    User.find({"secret" : {$ne: null}})
    .then((foundUsers)=>{
        if(foundUsers){
            res.render("secrets", {usersWithSecrets : foundUsers})
        }
    });
});

//Register-------------------------------------------------------------------------
app.route("/register")
.get((req, res)=>{
    res.render("register")
})
.post((req, res)=>{
    
    User.register({username : req.body.username}, req.body.password, function (err, user){
        if(err){
            req.flash("error", err.message); // Show the error message
            return res.redirect("/register");
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
            req.flash("error", "Logout failed!");
            return res.redirect("/secrets");
        }
        req.flash("success", "Logout successful!");
        res.redirect("/");
    });
});

//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//submit route

app.route("/submit")
.get(function (req,res){
    if(req.isAuthenticated()){
        res.render("submit")
    } else {
        res.redirect("/login");
    }
})
.post((req,res)=>{
    const submittedSecret = req.body.secret;

    console.log(req.user.id);

    User.findById(req.user.id)
    .then((foundUser)=>{
        if(foundUser){
            foundUser.secret = submittedSecret;
            foundUser.save()
            .then(()=>{
                res.redirect("/secrets")
            })
        } else {
            req.flash("error", "User Not found");
            res.redirect("/secrets")
        }
    })
    .catch((err)=>{
        req.flash("error", "Error occurres while saving the details");
        res.redirect("/");
    })
})



app.listen(process.env.PORT || 3000, ()=>{
    console.log("Server is running on port 3000");
})

