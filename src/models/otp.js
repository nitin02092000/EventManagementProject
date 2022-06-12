const mongoose = require("mongoose");
const conn = require("../db/conn");
const validator = require("validator");

const OtpSchema = new mongoose.Schema({
    email:{ 
    type:String,
    required:true,
    validate(value){
        if(!validator.isEmail(value)){
            throw new Error("Invalid email id")
        }
    }},
    code:{
        type:String,
        required:true
    },
    expireIn:{
        type:Number
    }
})

const Otp = new mongoose.model("otp",OtpSchema,"otp");

module.exports = Otp;