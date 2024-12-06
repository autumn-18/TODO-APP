const express = require('express');
const app = express();

const path = require('path');

const jwt = require('jsonwebtoken');
const secret_key = "FELIXFELICIS@hermione#dumbledore$$LILYPOTTER";   //secret_key only known to backend. Not to any user

// host the frontend on the same server as backend
app.use(express.static(path.join(__dirname, '../frontend')));

app.use(express.json());    // to parse the json data in the request

const user = [];


// route handler for signup request
app.post('/signup', (req,res)=>
{
    const email = req.body.email;
    
    let i;
    for(i=0;i<user.length;i++)
    {
        if(user[i].email == email)
        {
            res.json({"message":"⚠️⚠️user already exists!!"});
            break;
        }
    }

    //if the user doesn't exist in the user array
    if(i==user.length)
    {
        user.push({
                "email":email,
                "username":req.body.username,
                "password":req.body.password,
                // "scheduledTask" : [],
                // "completedTask" : []
                })

        // send a json format response
        res.json(
            {
                "email":email,
                "username":req.body.username
            }
        )
    }

    console.log(user);
    
})

//route handler for login request
app.post('/login',(req,res)=>
{
    const email = req.body.email;
    const password = req.body.password;        //required to verify that user enter's correct password associated to that user
    
    let i;
    for(i=0;i<user.length;i++)
    {
        //if the email exists, that means the user is allowed to login
        if(user[i].email==email && user[i].password==password)
        {
            const token = jwt.sign({"email":email}, secret_key);

            res.json({
                "token":token
            })

            console.log("Token sent successfully");
            // the scheduledTasks and completedTask array are refreshed everytime the user logs in
            user[i].scheduledTask = [];
            user[i].completedTask = [];
            break;

        }
    }

    if(i==user.length)
    {
        res.json({"message":"⚠️⚠️user doesn't exist!!\nKindly enter correct details"});
    }
})



app.post('/addTask',(req,res)=>
{
    const newTask = req.body.newTask;
    const token = req.body.token;
    console.log(req.body);


    //try catch block for error handling in cases when token is not verified
    try
    {
        const decodedEmailObject = jwt.verify(token, secret_key);    // the decoded payload is an object, the object that was sent in the request
        const decodedEmail = decodedEmailObject.email;


        if(decodedEmail)
        {
            console.log("token verified");
            console.log(decodedEmail);

            let i;

            for(i=0;i<user.length;i++)
            {
                if(user[i].email == decodedEmail)
                {
                    user[i].scheduledTask.push(newTask);
                    console.log(user[i].scheduledTask);

                    return res.json({
                        "message":"new task added",
                        "scheduledTaskArr": user[i].scheduledTask
                    })   
                }
            }
        }
    }

    catch
    {
        res.json(
            {
                "message":"user not found"
            }
        )

    }
                        
})



//route handler for "deleteTask" route
app.post('/deleteTask', (req,res)=>
{
    const taskId = parseInt(req.body.taskId);      // parseInt() function needs to be used to convert string to int
    const token = req.body.token;
    console.log(req.body);

    try{

    const decodedEmailObject = jwt.verify(token, secret_key);    // the decoded payload is an object, the object that was sent in the request
    const decodedEmail = decodedEmailObject.email;

    console.log("token verified again");
    console.log(decodedEmail);

    if(decodedEmail)
    {
        for(let i=0;i<user.length;i++)
        {
            if(user[i].email==decodedEmail)
            {
                user[i].scheduledTask.splice(taskId,1);
                console.log(user[i].scheduledTask);

                res.json(
                    {
                        "scheduledTaskArr":user[i].scheduledTask
                    }
                )

                break;
            }
        }
    }
    }

    catch(error)
    {
        res.json({
            "message": "User not found"
        })
    }

})

//route handler for shiftTask
app.post('/shiftTask', (req,res)=>
{
    const token = req.body.token;
    const taskId = parseInt(req.body.taskId);   // parseInt() is used to convert the string taskId  to int so that it can used to access array elements

    try{
        decodedEmailObject = jwt.verify(token, secret_key);
        decodedEmail = decodedEmailObject.email;

        let i;
        for(i=0;i<user.length;i++)
        {
            if(user[i].email == decodedEmail)
            {
                const taskContent = user[i].scheduledTask[taskId];
                // first push that task entry to completed task and then delete it from the scheduled task array
                user[i].completedTask.push(taskContent);
                user[i].scheduledTask.splice(taskId,1);

                res.json(
                    {
                        "scheduledTaskArr": user[i].scheduledTask,
                        'completedTaskArr': user[i].completedTask
                    }
                )
                break;

            }
    }

    
    }
    catch
    {
        res.json({
            "message": "shifting request unsuccessful.\n Invalid token"
        })
    }

})


// to start the express server
const port = 3007;
app.listen(port, ()=>
{
    console.log(`Server started at ${port} `);
})

