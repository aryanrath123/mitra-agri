let prompt = document.querySelector("#prompt");
let submitBtn = document.querySelector("#submit");
let chatContainer = document.querySelector(".chat-container");
let imageBtn = document.querySelector("#image");
let imageInput = document.querySelector("#imageInput");

const Api_Url =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyCgSiQNovEozbjmkbIp4_x_ubX24nzgDSk";

let user = {
  message: null,
  file: {
    mime_type: null,
    data: null,
  },
};

async function generateResponse(aiChatBox) {
  let text = aiChatBox.querySelector(".ai-chat-area");

  let requestBody = {
    contents: [
      {
        parts: [
          { text: user.message },
          ...(user.file.data ? [{ inline_data: user.file }] : []),
        ],
      },
    ],
  };

  let requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  };

  try {
    let response = await fetch(Api_Url, requestOptions);
    let data = await response.json();
    let apiResponse = data.candidates[0].content.parts[0].text
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .trim();
    text.innerHTML = apiResponse;
  } catch (error) {
    console.error("Error:", error);
    text.innerHTML = "Sorry, something went wrong. Please try again.";
  } finally {
    chatContainer.scrollTo({
      top: chatContainer.scrollHeight,
      behavior: "smooth",
    });
    user.file = { mime_type: null, data: null }; // Reset file data
  }
}

function createChatBox(html, classes) {
  let div = document.createElement("div");
  div.innerHTML = html;
  div.classList.add(classes);
  return div;
}

function handleChatResponse(usermessage) {
  user.message = usermessage;
  let html = `
        <img src="user.png.webp" alt="User" id="userImage" width="10%" />
        <div class="user-chat-area">
            ${user.message}
            ${
              user.file.data
                ? `<img src="data:${user.file.mime_type};base64,${user.file.data}" class="chooseImg" />`
                : ""
            }
        </div>`;
  prompt.value = "";
  let userChatBox = createChatBox(html, "user-chat-box");
  chatContainer.appendChild(userChatBox);

  chatContainer.scrollTo({
    top: chatContainer.scrollHeight,
    behavior: "smooth",
  });

  setTimeout(() => {
    let html = `
            <img src="ai.png.webp" alt="AI" id="aiImage" width="10%" />
            <div class="ai-chat-area">
                <img src="loading.webp" alt="Loading" class="load" width="50px">
            </div>`;
    let aiChatBox = createChatBox(html, "ai-chat-box");
    chatContainer.appendChild(aiChatBox);
    generateResponse(aiChatBox);
  }, 600);
}

prompt.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    handleChatResponse(prompt.value);
  }
});

submitBtn.addEventListener("click", () => {
  if (prompt.value.trim() !== "") {
    handleChatResponse(prompt.value);
  }
});

imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (!file) return;

  // Check if the file is an image
  if (!file.type.startsWith("image/")) {
    alert("Please upload an image file.");
    return;
  }

  let reader = new FileReader();
  reader.onload = (e) => {
    let base64string = e.target.result.split(",")[1];
    user.file = {
      mime_type: file.type,
      data: base64string,
    };

    // Display the image in the chat area immediately
    handleChatResponse("Image uploaded:");
  };
  reader.readAsDataURL(file);
});

imageBtn.addEventListener("click", () => {
  imageInput.click();
});