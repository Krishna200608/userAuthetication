import mongoose from 'mongoose';
import encrypt from 'mongoose-encryption';
import 'dotenv/config'

mongoose.connect(process.env.DB_CONNECTION_STRING)
.then(()=>console.log("Successfully connected to the MongoDB"))
.catch((err)=>console.log("Failed to connect to the MongoDB", err));


const userSchema = new mongoose.Schema({
    email: String,
    password: String
})

userSchema.plugin(encrypt, { secret: process.env.SECRET_KEY, encryptedFields: ["password"] });

const User = mongoose.model("User", userSchema);

export {User};