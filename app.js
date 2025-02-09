import 'dotenv/config'
import express from 'express';
import bodyParser from 'body-parser';
//import ejs from 'ejs';
import { User } from './models/schema.js';
//-----------------------------------------------------

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));


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

    User.findOne(
        {email : username}
    )
    .then((foundUser)=>{
        if(foundUser){
            if(foundUser.password === password){s
                res.render("secrets");
            } else {
                console.log("Wrong password please try again");
                res.redirect("/login")
            }    
        } else {
            console.log("Can't find the user");
            res.redirect("/login");
        }
    })
    .catch((err)=>console.log("Failed to find the user from the database"))
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

