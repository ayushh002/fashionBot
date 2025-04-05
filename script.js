let prompt = document.querySelector("#prompt");
let submitbtn = document.querySelector("#submit");
let micbtn = document.querySelector("#mic");
let audioIcon = document.querySelector("#audio-icon");
let chatContainer = document.querySelector(".chat-container");
let imagebtn = document.querySelector("#image");
let image = document.querySelector("#image img");
let imageinput = document.querySelector("#image input");

const Api_Url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_API_KEY";
let user = {
    message: null,
    file: {
        mime_type: null,
        data: null
    }
};

const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'en-US';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

const synth = window.speechSynthesis;


micbtn.addEventListener("click", () => {
    recognition.start();
    micbtn.style.backgroundColor = "#ffeb3b";
});

recognition.onresult = (event) => {
    const speechResult = event.results[0][0].transcript;
    prompt.value = speechResult;
    micbtn.style.backgroundColor = "#4682b4";
    handlechatResponse(speechResult);
};

recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    micbtn.style.backgroundColor = "#4682b4";
    alert("Could not understand audio. Please try again.");
};

recognition.onend = () => {
    micbtn.style.backgroundColor = "#4682b4";
};

async function generateResponse(aiChatBox, userMessage) {
    let text = aiChatBox.querySelector(".ai-chat-area");
    let speakBtn = aiChatBox.querySelector(".speak-btn");

    const creatorQuestionRegex = /(who created you|who made you|who built you)/i;
    if (creatorQuestionRegex.test(userMessage)) {
        const response = "I am a Fashion AI Tool, Ayush Raj, Utkarsh Singh, and Akash created me!";
        text.innerHTML = response;

        // Add click event to speak button
        speakBtn.addEventListener("click", () => {

            if(synth.speaking){
                synth.cancel();
            }
            else{
                const utterance = new SpeechSynthesisUtterance(response);
                utterance.lang = 'en-US';
                utterance.rate = 1.5;
                utterance.pitch = 2;
                synth.speak(utterance);
            }
        });

    } else {
        const FashionPrompt = `You are FashionBot, an AI assistant specialized in suggesting new fashion trends. Provide detailed and practical advice on fashion trends, clothing, accessories, or personal style. If the question is outside the realm of clothing, accessories, or personal style, simply reply the user that you may not be the best source of information as you are personalized for fashion related queries. Also try to keep the reply concise. If Someone says ok bye then reply them with best regards and see you soon. User's question: ${userMessage}`;
        
        let RequestOption = {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "contents": [
                    {
                        "parts": [{ text: FashionPrompt }, (user.file.data ? [{ inline_data: user.file }] : [])]
                    }
                ]
            })
        };
        try {
            let response = await fetch(Api_Url, RequestOption);
            let data = await response.json();
            let apiResponse = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1").trim();
            text.innerHTML = apiResponse;

            // Add click event to speak button
            speakBtn.addEventListener("click", () => {

                if(synth.speaking){
                    synth.cancel();
                    return;
                }
                const utterance = new SpeechSynthesisUtterance(apiResponse);
                utterance.lang = 'en-US';
                utterance.rate = 1.5;
                utterance.pitch = 2;
                synth.speak(utterance);
            });
        } 
        catch (error) {
            console.log(error);
            text.innerHTML = "Sorry, something went wrong. Please ask about clothing, accessories, or personal style.";
            // Add click event to speak button
            speakBtn.addEventListener("click", () => {
                const utterance = new SpeechSynthesisUtterance("Sorry, something went wrong. Please ask about clothing, accessories, or personal style.");
                synth.speak(utterance);
            });
        }
    }

    chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });
    // Only reset the image upload icon if a file was uploaded
    if (user.file.data) {
        image.src = "./img/img.svg";
        image.classList.remove("choose");
    }
    user.file = {};
}

function createChatBox(element, className) {
    let div = document.createElement("div");
    div.innerHTML = element;
    div.classList.add(className);
    return div;
}

function handlechatResponse(userMessage) {
    user.message = userMessage;
    let html = `<img src="./img/images.png" alt="" id="userImage" width="8%">
                <div class="user-chat-area">
                ${user.file.data ? `<img src="data:${user.file.mime_type};base64,${user.file.data}" id="chooseimg" />` : ""}
                ${user.message}
                </div>`;

    prompt.value = "";
    let userChatBox = createChatBox(html, "user-chat-box");
    chatContainer.appendChild(userChatBox);

    chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });

    setTimeout(() => {
        let html = `<div style = "display: flex;" > 
                        <img src="./img/logo.webp" alt="" id="aiImage" width="10%">
                        <div class="ai-chat-area">
                        <img src="./img/icons8-loading.gif" alt="" class="load" width="50px">
                        </div>
                    </div>
                    <button class="speak-btn"><img id = "audio-icon" src="./img/vol.svg"></button>`;
                    
        let aiChatBox = createChatBox(html, "ai-chat-box");
        chatContainer.appendChild(aiChatBox);
        generateResponse(aiChatBox, userMessage);
    }, 600);
}

prompt.addEventListener("keydown", (e) => {
    if (e.key == "Enter") {
        handlechatResponse(prompt.value);
    }
});

submitbtn.addEventListener("click", () => {
    handlechatResponse(prompt.value);
});

imageinput.addEventListener("change", () => {
    const file = imageinput.files[0];
    if (!file) return;
    let reader = new FileReader();
    reader.onload = (e) => {
        let base64string = e.target.result.split(",")[1];
        user.file = {
            mime_type: file.type,
            data: base64string
        };
        image.src = `data:${user.file.mime_type};base64,${user.file.data}`;
        image.classList.add("choose");
    };
    reader.readAsDataURL(file);
});

imagebtn.addEventListener("click", () => {
    imagebtn.querySelector("input").click();
});
