import mongoose from 'mongoose';
// import encrypt from 'mongoose-encryption';
import 'dotenv/config'
import passport from 'passport';
import passportLocalMongoose from "passport-local-mongoose";
import findOrCreate from 'mongoose-findorcreate';


// Enable debug mode to see what's happening
//mongoose.set("debug", true);


mongoose.connect(process.env.DB_CONNECTION_STRING)
.then(()=>console.log("Successfully connected to the MongoDB"))
.catch((err)=>console.log("Failed to connect to the MongoDB", err));
 
const userSchema = new mongoose.Schema({
    email: { type: String, unique: true, sparse: true },
    password: String,
    googleId : { type: String, unique: true },
    facebookId : { type: String, unique: true },
    secret : String
})

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = mongoose.model("User", userSchema);


export {User};

process.on("SIGINT", async () => {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
    process.exit(0);
});