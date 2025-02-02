const socket = io("https://chatapp-ylzi.vercel.app");

const clientsTotal = document.getElementById("client-total");
const messageContainer = document.getElementById("message-container");
const nameInput = document.getElementById("name-input");
const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("message-input");

// Handle message form submission
messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    sendMessage();
});

// Update total client count
socket.on("client-number", (data) => {
    console.log(data)
   
    clientsTotal.innerText = `Total Clients: ${data}`;
});

// Send message to the server
function sendMessage() {
    if (messageInput.value.trim() === "") return;

    const data = {
        name: nameInput.value.trim() || "Anonymous",
        message: messageInput.value.trim(),
    };

    socket.emit("message", data);
    addMessageToUI(true, data);
    messageInput.value = "";
}

// Listen for incoming messages
socket.on("chat-message", (data) => {
    data.forEach((msg) => {
        if (msg && msg.sender && msg.text && msg.dateTime) {
            addMessageToUI(false, msg);
        } else {
            console.error("Received malformed message:", msg);
        }
    });
});

// Add message to UI
function addMessageToUI(isOwnMessage, data) {
    clearFeedback();

    const messageDate = new Date(data.dateTime);
    const hours = messageDate.getHours();
    const minutes = messageDate.getMinutes();
    const formattedTime = `${hours}:${minutes < 10 ? "0" : ""}${minutes}`;

    const senderName = data.sender || "Unknown";
    const messageText = data.text || "Message content missing";

    const element = `
        <li class="${isOwnMessage ? "message-right" : "message-left"}">
            <p class="message">
                ${messageText}
                <span>${senderName} ● ${formattedTime}</span>
            </p>
        </li>
    `;

    messageContainer.innerHTML += element;
    scrollToBottom();
}

// Scroll to the bottom of the message container
function scrollToBottom() {
    messageContainer.scrollTo(0, messageContainer.scrollHeight);
}

// Handle typing feedback
messageInput.addEventListener("focus", () => {
    socket.emit("feedback", {
        feedback: `✍️ ${nameInput.value || "Anonymous"} is typing a message`,
    });
});

messageInput.addEventListener("keypress", () => {
    socket.emit("feedback", {
        feedback: `✍️ ${nameInput.value || "Anonymous"} is typing a message`,
    });
});

messageInput.addEventListener("blur", () => {
    socket.emit("feedback", { feedback: "" });
});

// Display feedback for typing status
socket.on("feedback", (data) => {
    clearFeedback();
    if (data.feedback) {
        const element = `
            <li class="message-feedback">
                <p class="feedback">${data.feedback}</p>
            </li>
        `;
        messageContainer.innerHTML += element;
    }
});

// Clear typing feedback
function clearFeedback() {
    document.querySelectorAll("li.message-feedback").forEach((element) => {
        element.remove();
    });
}
