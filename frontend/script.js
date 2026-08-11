const API_URL = "http://127.0.0.1:8000/chat";

let currentMode = "general";

const chatContainer = document.getElementById("chatContainer");
const userInput = document.getElementById("userInput");
const micButton = document.getElementById("micButton");
const voiceStatus = document.getElementById("voiceStatus");
const modeText = document.getElementById("modeText");


/* =========================
   SEND MESSAGE
========================= */

async function sendMessage() {

    const message = userInput.value.trim();

    if (!message) {
        return;
    }

    addMessage(message, "user");

    userInput.value = "";

    showTyping();

    try {

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                message: message,
                mode: currentMode
            })

        });

        if (!response.ok) {
            throw new Error("Server error");
        }

        const data = await response.json();

        removeTyping();

        addMessage(data.reply, "assistant");

        speak(data.reply);

    } catch (error) {

        removeTyping();

        addMessage(
            "I couldn't connect to the SHIVA AI server. Make sure the backend is running.",
            "assistant"
        );

        console.error(error);
    }
}


/* =========================
   ADD MESSAGE
========================= */

function addMessage(text, sender) {

    const message = document.createElement("div");

    message.className = `message ${sender}`;

    const content = document.createElement("div");

    content.className = "message-content";

    content.textContent = text;

    message.appendChild(content);

    chatContainer.appendChild(message);

    chatContainer.scrollTop = chatContainer.scrollHeight;
}


/* =========================
   TYPING
========================= */

function showTyping() {

    const typing = document.createElement("div");

    typing.id = "typing";

    typing.className = "message assistant";

    typing.innerHTML = `
        <div class="message-content">
            SHIVA is thinking...
        </div>
    `;

    chatContainer.appendChild(typing);

    chatContainer.scrollTop = chatContainer.scrollHeight;
}


function removeTyping() {

    const typing = document.getElementById("typing");

    if (typing) {
        typing.remove();
    }
}


/* =========================
   ENTER KEY
========================= */

function handleEnter(event) {

    if (event.key === "Enter") {
        sendMessage();
    }
}


/* =========================
   EXAMPLE BUTTON
========================= */

function useExample(text) {

    userInput.value = text;

    userInput.focus();

}


/* =========================
   MODE
========================= */

function setMode(mode) {

    currentMode = mode;

    const names = {

        general: "General AI Assistant",

        developer: "Developer Mode",

        study: "Study Mode",

        resume: "Resume Assistant",

        research: "Research Mode"

    };

    modeText.textContent = names[mode];

    addMessage(
        `SHIVA AI switched to ${names[mode]}.`,
        "assistant"
    );
}


/* =========================
   CLEAR CHAT
========================= */

function clearChat() {

    chatContainer.innerHTML = "";

    const welcome = document.createElement("div");

    welcome.className = "welcome";

    welcome.innerHTML = `
        <div class="big-logo">S</div>

        <h2>Welcome to SHIVA AI</h2>

        <p>
            Your personal AI command center.
            How can I help you?
        </p>
    `;

    chatContainer.appendChild(welcome);
}


/* =========================
   VOICE INPUT
========================= */

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

let recognition;

if (SpeechRecognition) {

    recognition = new SpeechRecognition();

    recognition.lang = "en-US";

    recognition.continuous = false;

    recognition.interimResults = false;

    recognition.onstart = function () {

        micButton.classList.add("listening");

        voiceStatus.textContent =
            "Listening... Speak to SHIVA";

    };


    recognition.onresult = function (event) {

        const transcript =
            event.results[0][0].transcript;

        userInput.value = transcript;

        voiceStatus.textContent =
            "Command received";

        sendMessage();

    };


    recognition.onerror = function () {

        voiceStatus.textContent =
            "Voice recognition failed. Try again.";

        micButton.classList.remove("listening");

    };


    recognition.onend = function () {

        micButton.classList.remove("listening");

        setTimeout(() => {

            voiceStatus.textContent =
                "Click 🎙️ to speak with SHIVA";

        }, 1500);

    };

} else {

    voiceStatus.textContent =
        "Voice input is not supported by this browser.";

}


/* =========================
   START LISTENING
========================= */

function startListening() {

    if (!recognition) {

        alert(
            "Voice recognition is not supported in this browser."
        );

        return;
    }

    recognition.start();
}


/* =========================
   VOICE OUTPUT
========================= */

function speak(text) {

    if (!("speechSynthesis" in window)) {
        return;
    }

    window.speechSynthesis.cancel();

    const speech =
        new SpeechSynthesisUtterance(text);

    speech.lang = "en-US";

    speech.rate = 1;

    speech.pitch = 1;

    speech.volume = 1;

    window.speechSynthesis.speak(speech);
}