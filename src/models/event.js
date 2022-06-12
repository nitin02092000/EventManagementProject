const mongoose = require("mongoose");
const conn = require("../db/conn");
const jwt = require("jsonwebtoken");

const EventSchema = new mongoose.Schema({
    authorEmail:{
        type:String,
        required:true
    },
    eventName:{
        type:String,
        required:true,
        unique:true,
        max:30
    },
    eventDesc:{
        type:String,
        required:true,
        min:10
        
    },
    eventDateAndTime:{
        type:String,
        required:true
    },
    /*tokens:[{
        token:{
        type:String,
        required:true
        }
    }]*/
    }
)
// generating tokens
/*EventSchema.methods.generateAuthToken = async function(){
    try {
        const token = jwt.sign({_id:this._id.toString()},process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({token:token});
        await this.save();
        return token;
    } catch (error) {
        res.status(401).send("the error part"+error);
    }

}*/

const Event = new mongoose.model("event",EventSchema,"event");

module.exports = Event;