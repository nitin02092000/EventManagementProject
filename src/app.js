require('dotenv').config();
const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const auth = require("./middleware/auth");
const app = express();
require("./db/conn");



const Register = require("./models/register");
const Otp = require("./models/otp");
const Event = require("./models/event");
const Invite = require("./models/invite");
const port = process.env.PORT || 3000;


// Middleware
const static_path = path.join(__dirname,"../public");
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(express.static(static_path));

// home section 
app.get("/" ,(req,res) => {
    try {
        res.send("Home Page");
    } catch (error) {
        res.status(401).send(error);
    }
})

// logout section 
app.get("/logoutAll",auth,async(req,res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        var response = {
            status : '200',
            message : 'LogoutAll Successful',
            error : false
        };
        res.status(200).send(response);    
    } catch (error) {
        var response = {
            status : '500',
            message : 'LogoutAll UnSuccessful',
            error : true
        };
        res.status(500).send(error);
    }
})

app.get("/logoutOne",auth,async(req,res) => {
    try {
        req.user.tokens = req.user.tokens.filter((currElement) =>{
            return currElement.token !== req.token; 
        })
        await req.user.save();
        var response = {
            status : '200',
            message : 'LogoutOne Successful',
            error : false
        }
        res.status(200).send(response);
        
    } catch (error) {
        var response = {
            status : '200',
            message : 'LogoutOne UnSuccessful',
            error : true
        }
        res.status(500).send(error);
    }
})

// create a mailer for sending the otp 
const mailer = (email,otp) => {
    const transporter = nodemailer.createTransport({
        service:"gmail",
        port:587,
        secure:false,
        auth:{
            user:'ankit.purohit@indianic.com',
            pass:'Purohit@8602'
        }
    });
    const mailOptions = {
        from: 'nodejsprojec@gmail.com',
        to:email,
        subject:'Email Verification by Event Management System',
        text:`Your OTP is - ${otp} `
    };
     transporter.sendMail(mailOptions,function(error,info){
        if(error){
            console.log(error);
        }else{
            console.log('email sent; '+ info.response);
        }
    });
}

// reset password 
app.post("/reset",async (req,res) =>{
    try {
        const email = await Register.findOne({email:req.body.email});
        var response = {
                status : '200',
                message : 'Otp sent to Email Address',
                error : false
            }
        if(email){
            const otpCode = Math.floor((Math.random()*10000)+1);
            const otpData = new Otp({
                email:req.body.email,
                code:otpCode,
                expireIn:new Date().getTime() + 300*1000
            })
            const otpResponse = await otpData.save();
            mailer(req.body.email,otpCode);
            
            res.status(200).send(response);
            
        }else{
            
            res.message = "Email Address is invalid"
            res.status(200).send(response);
        }
    } catch (error) {
        var response = {
            status : '401',
            message : 'Something is Wrong',
            error : true
        }
        res.status(401).send(error);
    }

})

// change password 
app.post("/changePassword",async (req,res) =>{
    const data = await Otp.find({email:req.body.email,code:req.body.otp});
    var response = {
        status : '200',
        message : 'Otp sent to Email Address',
        error : false
    }
    if(data){
        const currentTime = new Date().getTime();
        const diff = data.expireIn - currentTime;
        if(diff<0){
            response.message="OTP Expired"
            res.status(200).send(response);
        }else{
            const user = await Register.findOne({email:req.body.email})
            user.password = req.body.password;
            user.confirmpassword = req.body.confirmpassword;
            user.save();
            response.message = "Password Changed Successfully"
            res.status(200).send(response);
        }
    }else{
        var response = {
            status : '200',
            message : 'Invalid Otp',
            error : false
        }
        res.status(200).send(response);
    }

})

// create a new user in our database
app.post("/register",async (req,res) =>{
    try{  
    const password = req.body.password;
    const confirmpassword = req.body.confirmpassword;

    if(password === confirmpassword){
        const user = new Register(req.body);
        const token = await user.generateAuthToken();
        const insertUser = await user.save();
        res.status(201).send(insertUser);  
    }else{
        res.send("password are not matching")
    }
    }catch(error){
            res.status(400).send(error);
    }
})

// login check
app.post("/login",async (req,res) => {
    try{
            const email = req.body.email;
            const password = req.body.password;

            const userInfo = await Register.findOne({email:email});

            const isMatch = await bcrypt.compare(password,userInfo.password);
            
            if(isMatch){
                res.status(200).send(userInfo);
                const token = await userInfo.generateAuthToken();
            }
            else{
                res.send("Invalid login details");
            }
    }catch(error){
            res.status(400).send(error);
    }
})


// get the created events
app.get("/events",auth, (req,res) =>{
    try {
        
    } catch (error) {
        res.status(401).save(error);
    }

})

// create Event 
app.post("/createEvent",auth, async(req,res) =>{
    try {
        const newEvent = new Event(req.body);
        console.log(newEvent);
        const insertEvent = await newEvent.save();
        res.status(201).send(insertEvent);  
    } catch (error) {
        res.status(401).send(error);
    }

})

// invite in an event 
app.post("/events/invite",auth,async (req,res) =>{
        try {
            const authorEmail = req.body.authorEmail;
            const inviteEmail = req.body.inviteEmail;
            const userInfo = await Register.findOne({email:inviteEmail});
            if(userInfo){
                const inviteInfo = new Invite({
                    eventAuthorId:authorEmail,
                    eventNonAuthorId:inviteEmail
                });
                await inviteInfo.save();
                res.status(201).send("User Invited Successfully");
            }else{
                 res.status(201).send("This User Email Id is not available ");
            }
        } catch (error) {
            res.status(404).send();
        }
})

app.listen(3000,() => {
    console.log(`server is running at port no. ${port}`);
})