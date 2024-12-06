const express           = require('express');
const app               = express();
const pathInstance      = require('path');
const mongoose          = require('mongoose');
const bcrypt            = require('bcryptjs');


// importing 'dotenv' module in order to access the values enlisted in .env file.
require('dotenv').config({path:pathInstance.join(__dirname,'../.env')});    // give the absolute path for the .env file (not it's relative path).
const PORT = process.env.PORT;


// import auth function and secret_key from auth.js
const {auth, secret_key, jwt} = require('./auth');

// console.log(PORT);
// console.log(secret_key);



const dbServerPath = process.env.mongoDB_serverURL;
mongoose.connect(dbServerPath);

// console.log(dbServerPath);

// import models from db.js
const {UserModel, TaskModel} = require('./db');
const { error } = require('console');

app.use(express.json());   // middleware used to parse the incoming json objects in the request


// serve the frontend on the same url as backend. That means, to host the frontend on the same server as the backend. This is done to avoid any CORS violation
app.use(express.static(pathInstance.join(__dirname, '../frontend')));


// write route handlers for various requests

// route handler for signup request
app.post('/signup', async (req, res)=>
{
    const email = req.body.email;
    const password = req.body.password;
    const username = req.body.name;          // we will be sending all the entered values cauz they are essential to keep a basic record of each user. email, pw, name

    // User data verification



    // when trying to signup, the new user should be added to the user collection in todo-app database

    // 2 important things to be done:
    //  1. hash the password    2. user data verification (done before hashing)

    // hash the password obtained from the request body.
    // Use bcrypt module for hashing
    const hashedPassword = await bcrypt.hash(password, 10);  // the salt string is auto generate and added to the input password before getting hashed.


    try
    {
        await UserModel.create(
            {
                'email':email,
                'username':username,
                'password':hashedPassword
            }
        )

        res.json({
            'message':"You're signed up!!",
            'email' : email
        })
    }
    catch
    {
        res.json({
            'message': 'User already exists!!'
        })

    }

    // Before using try-catch block, if the same email is used again to signup, the server crashes. Why so?? It should just give an alert that the user already exist and try to signup using a different email. The server should not crash.
    // this issue was resolved by using the try-catch block. In place of server crashing abruptly, the catch block manages the error.
    // ALWAYS USE THE TRY-CATCH BLOCK


})

//route handler for login request
app.post('/login', async (req,res)=>
{
    const email = req.body.email;
    const password = req.body.password;

    // first check whether the entered email and password match any entry in the database, if yes, then proceed with token generation
    try
    {
        // use findOne() method to find the document where the email and password match the values in req. body.
        const user = await UserModel.findOne({email:email, password:password});

        if(user)
        {
            //generate token and store it in localStorage
            const token = jwt.sign({email:email}, secret_key);   // token is generated

            //store the token in localStorage till the user is logged in
            res.json({
                'token':token,
                'message':'token generated successfully !!'
            })
        }

    }
    catch(err)
    {
        console.error(err);
        
    }

})

// all the upcoming requests after login will have the token attached with them for verification
// an 'auth' middleware has to be called in all the route handlers to handle the authentication step.ie. token verification

const DateAndTime = new Date();
const currentDate = DateAndTime.toISOString().split("T")[0];

// route handler to display the already existing user data for that day
app.post('/showUserData', auth, async (req,res)=>
{
    const userId = req.body.userId;

    try
    {
        const scheduledTaskArr = await TaskModel.find({userId:userId, date:currentDate, done:false});    
        const completedTaskArr = await TaskModel.find({userId:userId, date:currentDate, done:true});

        res.json({completedTaskArr, scheduledTaskArr});

    }
    catch(err)
    {
        res.status(500).json({ message: "Internal server error" });
    }
})

// route handler for '/addTask' route
app.post('/addTask', auth, async (req,res)=>
{
    const newTask = req.body.newTask;
    const userId = req.body.userId;
    // const DateAndTime = new Date();
    // const currentDate = DateAndTime.toISOString().split("T")[0];   // this date is also in ISO format

    // when the token is verified and the decoded email is attached in the req. body, the task is added to the Task collection in the db.
    try
    {

        await TaskModel.create({
            description:newTask,
            done: false,
            userId: userId,
            date : currentDate
        })

        const scheduledTaskArr = await TaskModel.find({userId:userId, date:currentDate, done:false});    
        // TaskModel.find() method returns an array of all those documents that have the desired userId
        // sending this array of documents as response
        res.json({scheduledTaskArr});      
    }
    catch(err)
    {
        console.error(err);

    }

})

app.post('/deleteTask',auth,async (req,res)=>
{
    const taskId = req.body.taskId;
    const userId = req.body.userId;
    console.log(taskId);


    try
    {
        // delete the taskId from the collection
        await TaskModel.deleteOne({_id:taskId});    // find and delete the taskId that is sent in the req and then return the array of all task for that user to get displayed
        const scheduledTaskArr = await TaskModel.find({userId:userId, date:currentDate, done:false});    
        res.json({scheduledTaskArr});

    }
    catch(err)
    {
        console.error(err);
        
    }

})

app.post('/shiftTask', auth, async (req,res)=>
{
    const userId = req.body.userId;
    const taskId = req.body.taskId;

    await TaskModel.findByIdAndUpdate(taskId, {done:true}); // find the document by it's taskId and update it's 'done' field.
    const completedTaskArr = await TaskModel.find({userId:userId, date:currentDate, done:true});
    const scheduledTaskArr = await TaskModel.find({userId:userId, date:currentDate, done:false});    

    
    res.json({completedTaskArr, scheduledTaskArr});

})


app.listen(PORT, ()=>
{
    console.log("Server started");
});