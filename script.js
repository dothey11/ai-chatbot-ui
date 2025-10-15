
const WEBHOOK_URL = "https://n8n-pqwczqzamttu.n8x.my.id/webhook/ai_dothey";  
const chatBox = document.getElementById("chat-box");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const fileInput = document.getElementById("file-input");

const filePreview = document.getElementById("file-preview");

// Event saat user memilih file
fileInput.addEventListener("change", () => {
  filePreview.innerHTML = ""; // reset tampilan

  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    const fileIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
      d="M12 4v16m8-8H4" />
    </svg>`;

    filePreview.innerHTML = `${fileIcon} <span>📎 File terpilih: <strong>${file.name}</strong></span>`;
  }
});

let session_id = crypto.randomUUID();

chatInput.addEventListener("input", () => {
  chatInput.style.height = "auto";
  chatInput.style.height = chatInput.scrollHeight + "px";
});

function scrollToBottom() {
  chatBox.scrollTop = chatBox.scrollHeight;
}

function addMessage(content, sender = "bot") {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add(`${sender}-message`);
  const msg = document.createElement("div");
  msg.classList.add("message");
  
  // Jika pesan dari bot, render markdown jadi HTML
  if (sender === "bot") {
    msg.innerHTML = marked.parse(content);
  } else {
    msg.textContent = content; // user tetap plain text
  }


  
  messageDiv.appendChild(msg);
  chatBox.appendChild(messageDiv);
  scrollToBottom();
}

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
  addMessage(file, "bot");
  if (text) formData.append("chatInput", text);

  addMessage("⏳ Sedang menghubungi AI Agent...", "bot");

  console.log("🔗 Mengirim ke:", WEBHOOK_URL);
  console.log("📦 FormData:", [...formData.entries()]);

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      body: formData,
    });

    console.log("📡 Response Status:", response.status);

    if (!response.ok) {
      const errText = await response.text();
      console.error("HTTP Error:", errText);
      addMessage(`⚠️ Error dari server n8n (${response.status})`, "bot");
      return;
    }

    const resultText = await response.text();
    console.log("✅ Respons mentah dari n8n:", resultText);

    let parsed;
    try {
      parsed = JSON.parse(resultText);
    } catch {
      parsed = null;
    }

    if (parsed && parsed.AIResponse) {
      addMessage(parsed.AIResponse, "bot");
    } else {
      addMessage(resultText.trim() || "⚠️ Tidak ada respons dari backend.", "bot");
    }

  } catch (error) {
    console.error("❌ Fetch Error:", error);
    addMessage("❌ Gagal menghubungi server n8n. CORS atau koneksi bermasalah.", "bot");
  }

  fileInput.value = "";
});

