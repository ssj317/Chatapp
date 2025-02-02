# **ChatterBox 💬**

ChatterBox is a real-time chat application built with Node.js, Express, and Socket.IO. It allows users to send messages, view live updates, and see the total number of connected clients. It’s simple, fast, and provides a responsive user interface to chat with others.

## **Features**
- **Real-time Messaging**: Users can send and receive messages instantly.
- **Client Count**: Displays the total number of connected clients in real-time.
- **Username Display**: Displays the logged-in username on the homepage.
- **Signup/Signin/Logout**: Allows users to sign up, sign in, and log out.
- **Responsive UI**: The chat interface is designed to work seamlessly on both desktop and mobile devices.

## **Tech Stack**
- **Frontend**: HTML, CSS, JavaScript (Vanilla JS for client-side)
- **Backend**: Node.js, Express
- **Real-time Communication**: Socket.IO
- **Styling**: Custom CSS + Font Awesome for icons
- **Authentication**: Passport.js, bcrypt for password hashing
- **Hosting**: Can be deployed on any Node.js-supporting platform (e.g., AWS, Heroku)

## **Installation**

### 1. Clone the repository:

```bash
git clone https://github.com/ssj317/chatterbox.git
cd chatterbox

2. Install dependencies:
bash
Copy
Edit
npm install
3. Start the server:
bash
Copy
Edit
npm start
The server will listen on port 3000, and you can access the app in your browser at http://localhost:3000.

How it Works
Server:
The server listens on port 3000 and serves the chat page.
It uses Socket.IO to handle real-time connections and emits the total number of connected clients to all clients.
When a user sends a message, it is broadcast to all connected clients in real-time.
Signup/Signin/Logout functionality is handled via POST requests:
/auth/signup for registering new users.
/auth/login for logging in.
/auth/logout for logging out.

Client:
The frontend is built using basic HTML and CSS.
The name-input field shows the username (which can be pre-set).
When the user submits a message, it’s sent via Socket.IO and displayed on all clients’ screens.
The client also listens for "typing" feedback to show when someone is typing a message.
On the homepage, the username of the logged-in user is displayed.

Authentication (Signup/Signin/Logout)
Signup:
Users can sign up by providing a username and password.
The password is hashed and stored securely in the database using bcrypt.

Signin:
Existing users can log in using their username and password.
The password is verified using bcrypt.

Logout:
Users can log out, which clears their session.

Usage
Connect: When a user visits the app, they will be assigned a username (default is "Anonymous").
Send Messages: Type a message in the input field and hit "Send".
See Real-Time Updates: As messages are sent, they will appear immediately on the screen for all users.
Check Client Count: The total number of connected clients will be displayed at the bottom.
View Username: The username of the logged-in user is shown on the homepage.