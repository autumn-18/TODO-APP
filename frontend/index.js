const { z } = window.Zod;
// Event handler for Signup button
// the template for signup details should appear when signup button is clicked
// verify the entered details whether they match the required format and then signup the user.
async function signup()
{
    // When signup button is clicked, fetch the values entered in username, email and password.
    // Verify the entered user details.
    // check whether the entered email exists in the in-memory user array or not

    // fetch the username, email, password values
    const username = document.getElementById('username-input');
    const email = document.getElementById('email-input');
    const password = document.getElementById('password-input');

    // fetch the divisions to display error messages for each
    const usernameError = document.getElementById('username-error');
    const emailError = document.getElementById('email-error');
    const passwordError = document.getElementById('password-error');

    // Clear the previous error styles and messages
    const allInputs = [username, email, password];
    const allError = [usernameError, emailError, passwordError];

    allInputs.forEach((input)=>{ input.classList.remove("error")});
    allError.forEach((errorDiv)=>{ errorDiv.textContent = ""});
    

    
    // create a Zod schema for the details
    const userSchema = z.object(
        {
            email : z.string().email("Invalid email format"),

            username : z.string().min(5, "Username must be atleast 5 characters long")
            .max(10, "Username must not exceed 10 characters"),

            password : z.string().regex(/[A-Z]/, "Password should contain atleast 1 uppercase alphabet")
            .regex(/[a-z]/, "Password should contain atleast 1 lowercase alphabet")
            .regex(/[0-9]/, "Password should contain atleast 1 numeric character")
            .regex(/[^A-Za-z0-9]/, "Password should contain atleast 1 special character")
            .regex(/^\S*$/, "Password should not contain blank spaces")

        }
    )

    // parse the entered data and compare it with the Zod schema
    // Whatever feels like it might throw some error, write it inside the try{} block.
    try
    {
        userSchema.parse(
            {
                email : email.value.trim(), 
                username : username.value.trim(), 
                password : password.value.trim()
            });

        // if validation successful
        console.log("validation successful");

        const response = await axios.post('/signup',
        {
            "username": username.value,
            "email":email.value,
            "password":password.value
        }
        )

        if(response.data.email)
            {
                alert("Yaee 🤩🎉😎\nSigned up successfully!!\nKindly Login into your account");
            }
        
            else
            {
                alert("⚠️⚠️Signup failed\nUser already exists!!");
            }
    }
    catch(err)
    {
        if(err instanceof z.ZodError)
        {
            err.errors.forEach(({path, message})=>
            {
                const field = path[0];
                const inputElement = document.getElementById(`${field}-input`);
                const errorElement = document.getElementById(`${field}-error`);

                // Highlight the invalid input
                if (inputElement) 
                    inputElement.classList.add("error");


                // Display the error message
                if (errorElement) 
                    errorElement.textContent = message;
            });
        }

        

    }


}


//event handler for login button
async function login()
{
    // firstly display the template for login using DOM manipulation
    const app = document.querySelector('.app');
    app.innerHTML = 
    `
        <div class="signup-login-block">
                <div class="email-field">
                    <span>Email : </span>
                    <input id="email-input" type="text" placeholder="Enter email here">
                </div>
                <div class="password-field">
                    <span>Password : </span>
                    <input id="password-input" type="text" placeholder="Enter password here">
                </div>
                <div class="signup-button-class">
                    <button id="signup-button" onclick="handleLoginButton()">LOGIN</button>
                </div>
        </div>

    `
    

}

// to handle the event when Login button is clicked
async function handleLoginButton()
{

    const email = document.getElementById('email-input').value;
    const password = document.getElementById('password-input').value;

    if(!email)
        alert("Kindly enter email id");

    else if(!password)
        alert("Kindly enter the password");

    else
    {

        const response = await axios.post('/login',
            {
                "email":email,
                "password":password
            }
        )

        // access the data in the response object that came from the backend Express server
        const token = response.data.token;
    

        if(token)
        {
            localStorage.setItem('token', token);
            console.log("token stored in localStorage successfully");

            //navigate to '/todo' route to access the TODO list for that user
            await loadToDoPage();
            
        }

        else
        {
            alert('⚠️⚠️Login Unsuccessful\nKindly enter correct user details');
        }

    }

}



async function loadToDoPage()
{
    const body = document.querySelector('body');
    body.style.height = `${window.height}`;
    
    // add an input box to add a new task, with it there should be a button to add the task to the ToDo list

    body.innerHTML = 
    `
    <div class="todo-template">
        <div class="header-section">
            <h3>Schedule it!👊</h3>
            <button id="logout-button" onclick="logout()">LOGOUT</button>
            
        </div>
        <div class="todo-list">
            <div id="current-day">
                <h4 id="day">My day</h4>
                <h4 id="date"></h4>
            </div>
            <div id="todo-items">
                <div id="newTodo">
                    <input id="taskInput" type="text" placeholder="Enter the new task">  
                    <button id="add-button" onclick="addTask()">+</button>
                </div>
                <div id="scheduledTaskList">

                </div>
                <div id="completedTaskList">

                </div>


            </div>
            
        </div>
    </div>
    `

    // set the current date
    setDayAndDate();
    await showUserData();


    
    console.log("DOM loaded");
    document.getElementById('taskInput').focus();
    document.getElementById('taskInput').addEventListener('keydown', async (event)=>
    {
        if(event.key==='Enter')
        {
            console.log("Enter key pressed");
            await addTask();
        }

    })
    
}



function setDayAndDate()
{
    const dateEle = document.getElementById('date');

    const now = new Date();

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const dayName = days[now.getDay()];
    const date = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();

    dateEle.textContent =  `${dayName}, ${date} ${month} ${year}`;

}

// Displays the already existing scheduled task list and completed task list for that user for that particular date
async function showUserData()
{
    const token = localStorage.getItem('token');

    const response = await axios.post('/showUserData', 
        {
            'token':token
        }
    )

    try
    {
    if(response.data.scheduledTaskArr)
    {
        const scheduledTaskArray = response.data.scheduledTaskArr;
        const completedTaskArray = response.data.completedTaskArr;

        displayScheduledTasks(scheduledTaskArray);
        displayCompletedTasks(completedTaskArray);
    }
    }
    catch(err)
    {
        console.log("Unable to display user data");
    }

}

// we need 3 main functions: addTask(), deleteTask(), updateTask()
async function addTask()
{
    const newTaskInputBox = document.querySelector('input');
    const newTask = newTaskInputBox.value;

    const token = localStorage.getItem('token');        //fetch the token from localStorage

    if(newTask=="")
        alert("Kindly enter a task");

    else
    {
        const response = await axios.post('/addTask',
            {
                'newTask' : newTask,
                'token': token
            }
        )
    
    
        if(response.data.scheduledTaskArr)     // res.data  refers to the content inside {} in the json response
        {
            const scheduledTaskArray = response.data.scheduledTaskArr;
            //if a response is returned from the backend server, then perform DOM manipulation to add the new task div to the list

            // add all the tasks from the user's scheduledTask array to the UI through DOM manipulation
            displayScheduledTasks(scheduledTaskArray);
            newTaskInputBox.value = "";

        }

    }

}



// to display the complete list of all the scheduled tasks when the addTask button is clicked.
// But it is re-rendering the complete list of tasks again and again everytime a new task is added, but we need to render only the new task, not the complete list again and again.
function displayScheduledTasks(scheduledTaskArray)
{

    const scheduledTaskEle = document.getElementById('scheduledTaskList');

    //the innerHTML is made empty because everytime this function is called, first the scheduled task list is emptied and then the complete list is re-rendered. Otherwise the new list is displayed below the previous list.
    scheduledTaskEle.innerHTML = "";

    const scheduledTaskHeading = document.createElement('h3');
    scheduledTaskHeading.textContent = "Scheduled Tasks";

    scheduledTaskEle.appendChild(scheduledTaskHeading);

    scheduledTaskArray.forEach((taskObj,index)=>
    {
        // if(taskObj.done == false)    // if the 'done' field for a task is false , then display it in the scheduled task list.
        // {
            const singleTaskDivEle = document.createElement('div');
            singleTaskDivEle.id = "taskDiv";

            //task text part component
            const taskTextPart = document.createElement('div');
            taskTextPart.className = "task-text-part";
            const taskCheckBox = document.createElement('input');
            taskCheckBox.type = 'checkbox';
            taskCheckBox.id = taskObj._id;          // the checkbox's id is the unique id of each task
            taskCheckBox.addEventListener('click',()=>
            {
                shiftToCompletedTasks(taskCheckBox.id);     // Done
            })
            const taskText = document.createElement('p');
            taskText.innerHTML = taskObj.description;

            taskTextPart.appendChild(taskCheckBox);
            taskTextPart.appendChild(taskText);

            // task delete button
            const taskDeleteBtnEle = document.createElement('button');
            taskDeleteBtnEle.innerHTML = "delete";
            taskDeleteBtnEle.id = taskObj._id;      // Each del button is associated to it's respective task's index in the array of documents
            taskDeleteBtnEle.className = "task-delete-button";
            taskDeleteBtnEle.addEventListener('click', ()=>
            {
                // trigger the deleteTask() function when that delete button is clicked
                deleteTask(taskDeleteBtnEle.id);          // Done
            });     

            
            //append the taskTextPart and deleteBtn elements to the singleTaskDiv
            singleTaskDivEle.appendChild(taskTextPart);
            singleTaskDivEle.appendChild(taskDeleteBtnEle);

            scheduledTaskEle.appendChild(singleTaskDivEle);
        // }

    })

}

function displayCompletedTasks(completedTaskArray)
{
    const completeTaskEle = document.getElementById('completedTaskList');

    //the innerHTML is made empty because everytime this function is called, first the scheduled task list is emptied and then the complete list is re-rendered
    completeTaskEle.innerHTML = "";

    const completedTaskHeading = document.createElement('h3');
    completedTaskHeading.textContent = "Completed Tasks";

    completeTaskEle.appendChild(completedTaskHeading);

    
    completedTaskArray.forEach((taskObj,index)=>
    {
        const singleTaskDivEle = document.createElement('div');
        singleTaskDivEle.id = "taskDiv";

        //task text part component
        const taskTextPart = document.createElement('div');
        taskTextPart.className = "task-text-part";
        const taskCheckBox = document.createElement('input');
        taskCheckBox.type = 'checkbox';
        taskCheckBox.id = taskObj._id;

        const taskText = document.createElement('p');
        taskText.innerHTML = taskObj.description;

        taskTextPart.appendChild(taskCheckBox);
        taskTextPart.appendChild(taskText);

        // task delete button
        const taskDeleteBtnEle = document.createElement('button');
        taskDeleteBtnEle.innerHTML = "delete";
        taskDeleteBtnEle.id = taskObj._id;      
        taskDeleteBtnEle.className = "task-delete-button";

        //append the taskTextPart and deleteBtn elements to the singleTaskDiv
        singleTaskDivEle.appendChild(taskTextPart);
        // singleTaskDivEle.appendChild(taskDeleteBtnEle);

        completeTaskEle.appendChild(singleTaskDivEle);

    })
}


//function to delete the task from the user's scheduled task array when it's deleteButton is clicked
async function deleteTask(deleteButtonId)
{
    console.log("delete button clicked");
    console.log(deleteButtonId);
    const token = localStorage.getItem('token');

    const response = await axios.post('/deleteTask', {
        'taskId': deleteButtonId,
        'token': token

    })

    if(response.data.scheduledTaskArr)
    {
        const scheduledTaskArray = response.data.scheduledTaskArr;
        displayScheduledTasks(scheduledTaskArray);

    }
    
}


async function shiftToCompletedTasks(checkBoxId)
{
    console.log("Task checkbox clicked");

    // a token will be sent along the request for verification. It will be sent along all the requests.
    const token = localStorage.getItem('token');

    const response = await axios.post('/shiftTask',{
        'token':token,
        'taskId':checkBoxId
    })

    if(response.data.completedTaskArr)
    {
        const completedTaskArray = response.data.completedTaskArr;
        const scheduledTaskArray = response.data.scheduledTaskArr;

        displayScheduledTasks(scheduledTaskArray);
        displayCompletedTasks(completedTaskArray);
        
    }
}


// to logout from the current User Account
function logout()
{
    // When click on the Logout button, it removes the token from localStorage which will indicate that that particular logged in session has ended and the user has logged out.
    // It will move back to the login page and in order to view the TODO page, the user has to login again and generate the jwt token again.

    // delete the jwt token
    localStorage.removeItem('token');

    // move back to the login page
    const body = document.querySelector('body');
    body.innerHTML = 
    `
    <div>
        <div class="header">
            <h2>Schedule it !👊</h2>
        </div>
        <div class="app">
            <div class="signup-login-block">
                <div class="email-field">
                    <span>Email : </span>
                    <input id="email-input" type="text" placeholder="Enter email here">
                </div>
                <div class="password-field">
                    <span>Password : </span>
                    <input id="password-input" type="text" placeholder="Enter password here">
                </div>
                <div class="signup-button-class">
                    <button id="signup-button" onclick="handleLoginButton()">LOGIN</button>
                </div>
            </div>
        </div>
    </div>
    
    `

}

 