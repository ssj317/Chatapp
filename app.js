require('dotenv').config()
const express = require("express");
const routes = require("./routes/auth_route");
const app = express();
const path = require("path");
const PORT=process.env.PORT||3000;


const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const Message = require("./models/message");

// HTTP Server
const server = require("http").createServer(app);


// Integrating Socket.IO with the HTTP Server
const io = require("socket.io")(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
    pingTimeout: 60000,  // Add connection stability settings
    connectTimeout: 60000
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// View Engine
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

// Routes
app.use("/auth", routes);

let socketsConnected = new Set();

// MongoDB Connection
mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
        console.log("MongoDB successfully connected");
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
    });

// Socket.IO Connection Handling
io.on("connection", (socket) => {

    console.log("Socket connected:", socket.id);
    socketsConnected.add(socket.id);
    console.log(socketsConnected);


    // Emit the number of connected clients
    io.emit("client-number", socketsConnected.size);


    // Send all previous messages to the newly connected client
    Message.find({})
        .then((messages) => {
            socket.emit("chat-message", messages);
        })
        .catch((err) => {
            console.error("Error fetching messages:", err);
        });

    // Handle disconnection
    socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id);
        socketsConnected.delete(socket.id);
        io.emit("client-number", socketsConnected.size);
    });

    // Listen for new messages from clients
    socket.on("message", async (data) => {
        console.log("Message received:", data);

        // Ensure message contains valid data
        if (!data.message || !data.name) {
            console.error("Invalid message data received:", data);
            return;
        }

        // Save the message to the database
        const newMessage = new Message({
            sender: data.name,
            text: data.message,
            dateTime: new Date(),
        });

        try {
            await newMessage.save();
            io.emit("chat-message", [newMessage]); // Send new message to all clients
        } catch (err) {
            console.error("Error saving message:", err);
        }
    });

    // Handle typing feedback
    socket.on("feedback", (data) => {
        if (data && data.feedback) {
            socket.broadcast.emit("feedback", data);
        }
    });
});

// Home Route
app.get("/", isloggedin,(req, res) => {
    res.render("home",{user:req.user});
});

// Chat Route with Authentication Middleware
app.get("/chat", isloggedin, async (req, res) => {
    try {
        const messages = await Message.find({});
        res.render("chat", { username: req.user.name, messages });
    } catch (err) {
        console.error("Error fetching messages:", err);
        //res.render("chat", { username: req.user.name, messages: [] });
        res.redirect('/auth/login');
    }
});

// Authentication Middleware
function isloggedin(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        req.user = null;
        return res.redirect("/auth/login");
    }

    try {
        const data = jwt.verify(token, "shhxcvjhu");
        req.user = data;
        next();
    } catch (err) {
        console.error("Token verification failed:", err.message);
        req.user = null;
        next();
    }
}

// Start Server
server.listen(3000,  () => {
    console.log("Server running on port 3000");
});
