const WEBHOOK_URL = "https://n8n-pqwczqzamttu.n8x.my.id/webhook/ai_dothey";
const chatBox = document.getElementById("chat-box");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const fileInput = document.getElementById("file-input");

let session_id = crypto.randomUUID(); // ID unik per user/session

// Auto-grow textarea seperti ChatGPT
chatInput.addEventListener("input", () => {
  chatInput.style.height = "auto";
  chatInput.style.height = chatInput.scrollHeight + "px";
});

// Scroll otomatis ke bawah
function scrollToBottom() {
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Tambahkan pesan ke UI
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

// Kirim pesan ke backend n8n
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const text = chatInput.value.trim();
  const file = fileInput.files[0];

  if (!text && !file) return; // tidak kirim kosong

  if (text) addMessage(text, "user");
  chatInput.value = "";
  chatInput.style.height = "auto";

  // Siapkan data
  const formData = new FormData();
  formData.append("session_id", session_id);
  if (file) formData.append("files", file);
  if (text) formData.append("chatInput", text);

  addMessage("⏳ Sedang diproses...", "bot");

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      body: formData,
    });

    // Jika backend kirim non-200 status, tangani manual
    if (!response.ok) {
      const errText = await response.text();
      console.error("HTTP Error:", errText);
      addMessage(`⚠️ Error dari server n8n (${response.status})`, "bot");
      return;
    }

    // Ambil teks mentah dari respons
    const resultText = await response.text();

    // Coba deteksi apakah JSON valid
    let parsed;
    try {
      parsed = JSON.parse(resultText);
    } catch (err) {
      parsed = null;
    }

    // Tampilkan hasil sesuai format
    if (parsed && parsed.AIResponse) {
      addMessage(parsed.AIResponse, "bot");
    } else if (parsed && typeof parsed === "object") {
      addMessage(JSON.stringify(parsed, null, 2), "bot");
    } else {
      addMessage(resultText.trim() || "⚠️ Tidak ada respons dari backend.", "bot");
    }

  } catch (error) {
    console.error("Fetch Error:", error);
    addMessage("❌ Gagal menghubungi server n8n. Cek koneksi atau URL.", "bot");
  }

  // Reset file input setelah kirim
  fileInput.value = "";
});

