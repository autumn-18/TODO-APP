// create a separate file for authentication logic and import it in app.js file

// auth middleware is used to verify the token and decode the payload content from the token
const pathInstance = require('path');
require('dotenv').config({path: pathInstance.join(__dirname,'../.env')});

let jwt = require('jsonwebtoken');
const { UserModel } = require('./db');
const secret_key = process.env.JWT_SECRET;  // secret_key only known to backend

async function auth(req, res, next)
{
    const token = req.body.token;

    try
    {
        const decodedEmailObject = jwt.verify(token, secret_key);   // jwt.verify() returns an object
        const decodedEmail = decodedEmailObject.email;   // you need to extract the required payload from that object

        const user =  await UserModel.findOne({email:decodedEmail});

        if(user)
        {
            req.body.userId = user._id;    // userId is also unique for each user
            next();
        }

        else
        {
            res.json({
                'message':"user not present in db"
            })
        }


    }
    catch(err)
    {
        // display the error in the console as it is
        console.error(err);
    }

}


module.exports = {
    secret_key,
    jwt,
    auth
}