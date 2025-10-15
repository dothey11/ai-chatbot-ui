const WEBHOOK_URL = "https://n8n-pqwczqzamttu.n8x.my.id/webhook/ai_dothey";
const chatBox = document.getElementById("chat-box");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const fileInput = document.getElementById("file-input");
const filePreview = document.getElementById("file-preview");

let session_id = crypto.randomUUID();

// === Auto grow textarea ===
chatInput.addEventListener("input", () => {
  chatInput.style.height = "auto";
  chatInput.style.height = chatInput.scrollHeight + "px";
});

function scrollToBottom() {
  chatBox.scrollTop = chatBox.scrollHeight;
}

// === Render pesan di UI ===
function addMessage(content, sender = "bot") {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add(`${sender}-message`);
  const msg = document.createElement("div");
  msg.classList.add("message");

  if (sender === "bot") {
    msg.innerHTML = marked.parse(content);
  } else {
    msg.textContent = content;
  }

  messageDiv.appendChild(msg);
  chatBox.appendChild(messageDiv);
  scrollToBottom();
}

// === Preview nama file saat user pilih ===
fileInput.addEventListener("change", () => {
  filePreview.innerHTML = "";

  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    filePreview.innerHTML = `
      <i class='bx bx-file'></i>
      <span>📎 File terpilih: <strong>${file.name}</strong></span>
      <i class='bx bx-x-circle remove-file' style="cursor:pointer;color:#ff7675;"></i>
    `;

    // tombol untuk menghapus file yang dipilih
    document.querySelector(".remove-file").addEventListener("click", () => {
      fileInput.value = "";
      filePreview.innerHTML = "";
    });
  }
});

// === Proses kirim chat / file ===
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const text = chatInput.value.trim();
  const file = fileInput.files[0];

  if (!text && !file) return;

  if (text) addMessage(text, "user");
  if (file) addMessage(`📤 Mengirim file: ${file.name}`, "user");

  chatInput.value = "";
  chatInput.style.height = "auto";

  const formData = new FormData();
  formData.append("session_id", session_id);
  if (file) formData.append("files", file);
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
  filePreview.innerHTML = ""; // hapus preview setelah terkirim
});
