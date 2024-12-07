Author- Shrasti Katiyar

TO-DO Application is a beginner friendly project and gives us an in-depth knowledge about the frontend and backend parts of an application. This project has been developed using basic HTML, CSS and Javascript. It also provides an understanding of how the project grows through the development lifecycle.

TODO APP - version 0

1. first the user has to sign up in order to create an account in the in-memory user array.
2. then the user logs in to their account, but all TODO task entries are created afresh for each login session.

user array does not store the user account details once the express server shuts down. Those details are usable only till the express server is running in  the backend.(as of now)

the todo list associated to each user is empty everytime the user logs in. (as of now)

3. In the TODO page, there is delete button associated to each task, in case you want to delete that task.

4. A checkbox that will be clicked when that task is completed.

5. As soon as the checkbox of that task is clicked, it is moved to the completedTask list below. 

6. logout button : when click the Logout button, it logs out of that session and displays you the login page again.



**Incomplete features:**

1. Nothing to update the task once created.

2. Nothing to store the login session data so that it can be displayed later on, like the user account details displayed on the side of the todo list.

3. Nothing to set an expiration duration to the login session.

4. Password not hashed before storing.

5. not using a database to store user details.






**TODO APP - version 1  (several upgradations have been made to the version-0 of the TODO APP)**

1. use database to store the signed up users and their tasks.

2. It will be used to store the user details of those who signed up.

3. Saves and displays the user's todo list for the day whenever they login.

4. the TODO list will get refreshed each day. Not after each login.

5. Enable 'Enter' key to allow adding elements to the list.

6. Password hashing a and user verification at signup. (to enhance security)




**Incomplete features:**

1. Unable to update the task details. 
Functionality where the user can update the entered task.  When click on the task, it appears in a separate block where it can be modified. It is non-modifiable when as a normal list entry.

2. Add a feature to mark a task important using a star symbol. This will store all the important tasks for that particular date.

3. set an expiration duration to the login session stored in teh localStorage along with the token for that session.

4. Nothing to store the login session data so that it can be displayed later on, like the user account details displayed on the side of the todo list.