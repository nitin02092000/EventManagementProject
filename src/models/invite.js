const mongoose = require("mongoose");
const conn = require("../db/conn");

const InviteSchema = new mongoose.Schema({
    Author:{
        type:String,
        required:true
    },
    NonAuthor:{
        type:String,
        required:true
    }
})

const Invite = new mongoose.model("invite",InviteSchema,);

module.exports = Invite;