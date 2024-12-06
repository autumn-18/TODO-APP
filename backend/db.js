// A separate file for database logic

const mongoose = require('mongoose');

// we need something to define schema of the documents. Schema class from mongoose library is needed
const schema = mongoose.Schema;
const objectId = schema.ObjectId;

// A different schema for each collection in the database (.ie. each table)
// Even though mongoDB is schemaless, there has to a minimum set of fields defined for each document in the collection

// Step 1: define a schema for each collection
// schema for users collection
const UserSchema = new schema({
    email : {type:String, unique:true},      // this ensures that all the documents have different emails
    name : String,
    password : String
});



// schema for tasks collection
const TaskSchema = new schema({
    description : String,
    done : Boolean,
    // userId references to the user in the users table
    userId: objectId,
    date : String       
});

// Models in mongoDB are used to bind the schema to the mongoDB collection. Model name is written in PascalCase.
// define a model for each collection
// Step 2: define a model for binding each collection to their respective schema
const UserModel = mongoose.model('users', UserSchema);
const TaskModel = mongoose.model('tasks', TaskSchema);

// Step 3: export these models to app.js file
module.exports = {
    UserModel, 
    TaskModel
}


