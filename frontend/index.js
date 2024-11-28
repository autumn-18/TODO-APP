
// Event handler for Signup button
// the template for signup details should appear when signup button is clicked
async function signup()
{
    // When signup button is clicked, fetch the values entered in username, email and password
    // check whether the entered email exists in the in-memory user array or not

    // fetch the username, email, password values
    const username = document.getElementById('username-input').value;
    const email = document.getElementById('email-input').value;
    const password = document.getElementById('password-input').value;

    if(!username)
        alert("Kindly enter username");
    else if(!email)
        alert("Kindly enter email-id");
    else if(!password)
        alert("Kindly enter password");

    else if(username!=null && email!=null && password!=null)
    {
    const response = await axios.post('/signup',
        {
            "username": username,
            "email":email,
            "password":password
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

            //navigate to '/todo' route to access the TODO list
            loadToDoPage();
            
        }

        else
        {
            alert('⚠️⚠️Login Unsuccessful\nKindly enter correct user details');
        }

    }

}



function loadToDoPage()
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
                    <input type="text" placeholder="Enter the new task">  
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
        const singleTaskDivEle = document.createElement('div');
        singleTaskDivEle.id = "taskDiv";

        //task text part component
        const taskTextPart = document.createElement('div');
        taskTextPart.className = "task-text-part";
        const taskCheckBox = document.createElement('input');
        taskCheckBox.type = 'checkbox';
        taskCheckBox.id = taskObj._id;         // the checkbox's id is the unique id of each task
        taskCheckBox.addEventListener('click',()=>
        {
            shiftToCompletedTasks(taskCheckBox.id);     // Not done yet
        })
        const taskText = document.createElement('p');
        taskText.innerHTML = taskObj.description;

        taskTextPart.appendChild(taskCheckBox);
        taskTextPart.appendChild(taskText);

        // task delete button
        const taskDeleteBtnEle = document.createElement('button');
        taskDeleteBtnEle.innerHTML = "delete";
        taskDeleteBtnEle.id = index;      // Each del button is associated to it's respective task's index in the array of documents
        taskDeleteBtnEle.className = "task-delete-button";
        taskDeleteBtnEle.addEventListener('click', ()=>
        {
            deleteTask(taskDeleteBtnEle.id);          // Not yet done
        });     // trigger the deleteTask() function when that delete button is clicked

        //append the taskTextPart and deleteBtn elements to the singleTaskDiv

        singleTaskDivEle.appendChild(taskTextPart);
        singleTaskDivEle.appendChild(taskDeleteBtnEle);

        scheduledTaskEle.appendChild(singleTaskDivEle);

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

    
    completedTaskArray.forEach((task,index)=>
    {
        const singleTaskDivEle = document.createElement('div');
        singleTaskDivEle.id = "taskDiv";

        //task text part component
        const taskTextPart = document.createElement('div');
        taskTextPart.className = "task-text-part";
        const taskCheckBox = document.createElement('input');
        taskCheckBox.type = 'checkbox';
        // id for checkboxes are like 'task0', 'task1' and so on.....
        taskCheckBox.id = 'task'+index;

        const taskText = document.createElement('p');
        taskText.innerHTML = task;

        taskTextPart.appendChild(taskCheckBox);
        taskTextPart.appendChild(taskText);

        // task delete button
        const taskDeleteBtnEle = document.createElement('button');
        taskDeleteBtnEle.innerHTML = "delete";
        taskDeleteBtnEle.id = index;      // Each del button is associated to it's respective task's index in the array
        //delete button id's are like '1', '2', '3' and so on.......
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

 