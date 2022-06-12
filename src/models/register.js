const mongoose = require("mongoose");
const validator = require('validator');
const bcrypt = require('bcrypt');
const  jwt = require("jsonwebtoken");
const UserSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email: {
        type:String,
        required:true,
        unique:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Invalid email id")
            }
        } 
    },
    phone:{
        type:Number,
        required:true,
        min:10
    },
    password: {
        type:String,
        required:true
    },
    confirmpassword: {
        type:String,
        required:true
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]
})


// create token
UserSchema.methods.generateAuthToken = async function(){
    try {
        const token = jwt.sign({_id:this._id.toString()},process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({token:token});
        await this.save();
        return token;
    } catch (error) {
        res.status(401).send("the error part"+error);
    }

}



// Converting password into hash value
UserSchema.pre("save",async function(next){
    
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password,10);
        this.confirmpassword = await bcrypt.hash(this.confirmpassword,10);
    }
    next();
})

// create collection 
const Register = new mongoose.model("Register",UserSchema);

module.exports = Register;
