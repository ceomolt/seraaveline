const chatMessagesEl = document.getElementById("chatMessages");
const chatFormEl = document.getElementById("chatForm");
const chatInputEl = document.getElementById("chatInput");
const chatModeEl = document.getElementById("chatMode");
const chatCardEl = document.getElementById("chatCard");
const chatToggleEl = document.getElementById("chatToggle");
const chatToggleLabelEl = document.getElementById("chatToggleLabel");
const closeChatEl = document.getElementById("closeChat");
const sendBtnEl = document.getElementById("sendBtn");

const chatHistory = [];
let typingBubbleEl = null;
let emptyStateEl = null;
let chatOpen = false;

// ─── Chat open/close ───
function openChat() {
  chatOpen = true;
  chatCardEl.classList.add("open");
  chatCardEl.setAttribute("aria-hidden", "false");
  chatToggleEl.classList.add("active");
  chatToggleEl.setAttribute("aria-expanded", "true");
  chatToggleLabelEl.textContent = "Tutup";
  // Focus input after transition
  setTimeout(() => chatInputEl.focus(), 300);
}

function closeChat() {
  chatOpen = false;
  chatCardEl.classList.remove("open");
  chatCardEl.setAttribute("aria-hidden", "true");
  chatToggleEl.classList.remove("active");
  chatToggleEl.setAttribute("aria-expanded", "false");
  chatToggleLabelEl.textContent = "Chat";
}

chatToggleEl.addEventListener("click", () => {
  chatOpen ? closeChat() : openChat();
});

closeChatEl.addEventListener("click", closeChat);

// Close on outside click (desktop)
document.addEventListener("click", (e) => {
  if (chatOpen && !chatCardEl.contains(e.target) && !chatToggleEl.contains(e.target)) {
    closeChat();
  }
});

// Close on Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && chatOpen) closeChat();
});

// ─── Bubble rendering ───
function renderBubble(role, content) {
  const bubble = document.createElement("div");
  bubble.className = `bubble ${role}`;
  bubble.textContent = content;
  chatMessagesEl.appendChild(bubble);
  chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
  return bubble;
}

function addMessage(role, content) {
  if (emptyStateEl) {
    emptyStateEl.remove();
    emptyStateEl = null;
  }
  chatHistory.push({ role, content });
  renderBubble(role, content);
}

// ─── Typing indicator (animated dots) ───
function showTypingIndicator() {
  typingBubbleEl = document.createElement("div");
  typingBubbleEl.className = "bubble assistant typing";
  typingBubbleEl.setAttribute("aria-label", "Sera sedang mengetik");

  const dotsWrap = document.createElement("span");
  dotsWrap.className = "typing-dots";
  dotsWrap.innerHTML = `<span></span><span></span><span></span>`;
  typingBubbleEl.appendChild(dotsWrap);

  chatMessagesEl.appendChild(typingBubbleEl);
  chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
}

function hideTypingIndicator() {
  if (!typingBubbleEl) return;
  typingBubbleEl.remove();
  typingBubbleEl = null;
}

// ─── Send chat ───
async function sendChat() {
  const text = chatInputEl.value.trim();
  if (!text) return;

  addMessage("user", text);
  chatInputEl.value = "";
  chatInputEl.disabled = true;
  if (sendBtnEl) sendBtnEl.disabled = true;
  showTypingIndicator();

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: chatHistory,
        mode: chatModeEl?.value || "bucin",
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.detail || data?.error || "Request failed");
    }

    hideTypingIndicator();
    addMessage("assistant", data.reply);
  } catch (error) {
    hideTypingIndicator();
    addMessage("assistant", `Aduh, ada gangguan bentar. (${error.message})`);
  } finally {
    chatInputEl.disabled = false;
    if (sendBtnEl) sendBtnEl.disabled = false;
    chatInputEl.focus();
  }
}

chatFormEl.addEventListener("submit", async (e) => {
  e.preventDefault();
  await sendChat();
});

// ─── Empty state ───
function renderEmptyState() {
  emptyStateEl = document.createElement("div");
  emptyStateEl.className = "chat-empty";
  emptyStateEl.innerHTML = `
    <div class="chat-empty-icon">✨</div>
    <h3>Halo! Aku Sera</h3>
    <p>Mau ngobrol soal apa hari ini?<br>Pilih mode dulu terus mulai chat~</p>
  `;
  chatMessagesEl.appendChild(emptyStateEl);
}

// ─── Typing dots CSS (injected) ───
const dotStyle = document.createElement("style");
dotStyle.textContent = `
  .typing-dots { display:inline-flex; gap:4px; align-items:center; height:16px; }
  .typing-dots span {
    width:6px; height:6px; border-radius:50%;
    background: rgba(196,120,78,0.6);
    animation: dotBounce 1.2s ease-in-out infinite;
  }
  .typing-dots span:nth-child(2) { animation-delay:0.18s; }
  .typing-dots span:nth-child(3) { animation-delay:0.36s; }
  @keyframes dotBounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }
`;
document.head.appendChild(dotStyle);

// Init
renderEmptyState();
