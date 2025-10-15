const WEBHOOK_URL = "https://n8n-pqwczqzamttu.n8x.my.id/webhook/ai_dothey";
const chatBox = document.getElementById("chat-box");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const fileInput = document.getElementById("file-input");

let session_id = crypto.randomUUID(); // Generate session for this user

// Auto-grow textarea like ChatGPT
chatInput.addEventListener("input", () => {
  chatInput.style.height = "auto";
  chatInput.style.height = chatInput.scrollHeight + "px";
});

// Scroll to bottom helper
function scrollToBottom() {
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Add message to chat UI
function addMessage(content, sender = "bot") {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add(`${sender}-message`);
  const msg = document.createElement("div");
  msg.classList.add("message");
  msg.textContent = content;
  messageDiv.appendChild(msg);
  chatBox.appendChild(messageDiv);
  scrollToBottom();
}

// Send text or file
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = chatInput.value.trim();
  const file = fileInput.files[0];

  if (!text && !file) return;

  if (text) addMessage(text, "user");
  chatInput.value = "";
  chatInput.style.height = "auto";

  const formData = new FormData();
  formData.append("session_id", session_id);

  if (file) formData.append("files", file);
  if (text) formData.append("chatInput", text);

  addMessage("⏳ Sedang diproses...", "bot");

try {
  const response = await fetch(webhookUrl, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  let resultText = await response.text(); // pakai text() dulu agar fleksibel
  let data;

  try {
    data = JSON.parse(resultText); // coba parse ke JSON
  } catch {
    // fallback: treat as plain text
    data = { AIResponse: resultText };
  }

  if (data.AIResponse) {
    displayMessage(data.AIResponse, "bot");
  } else {
    displayMessage("⚠️ Tidak ada respons dari server n8n.", "bot");
  }

} catch (error) {
  console.error("Fetch Error:", error);
  displayMessage("❌ Terjadi kesalahan menghubungi server n8n.", "bot");
}

  fileInput.value = "";
});
