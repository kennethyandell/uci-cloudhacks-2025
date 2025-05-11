// main.js
// At the top of main.js (or above any DOM-ready code):
// ───────────────────────────────────────────────────
// Arrays for storing chat history:
const userMessages = [];    // ← all user-typed messages
const aiMessages   = [];    // ← all AI replies
const allMessages  = [];    // ← interleaved { sender, text } records

// Utility to render into the chat box:
function renderMessage(sender, text) {
  const container = document.getElementById('chatMessages');
  const msgEl = document.createElement('div');
  msgEl.className = `chat-message ${sender}`;  // CSS hooks if you want to style
  msgEl.textContent = text;
  container.appendChild(msgEl);
  container.scrollTop = container.scrollHeight;  // auto-scroll down
}

// Call this when you have an AI response ready:
// ───────────────────────────────────────────────────
function addAIMessage(text) {
  // 1) store in arrays
  aiMessages.push(text);                        // ← stored in aiMessages
  allMessages.push({ sender: 'ai', text });     // ← stored in allMessages
  // 2) render to UI
  renderMessage('ai', text);
}


// Hook up your “Send” button:
// ───────────────────────────────────────────────────
document.getElementById('sendChatBtn').addEventListener('click', async () => {
  const inputEl = document.getElementById('chatInput');
  const text = inputEl.value.trim();
  if (!text) return;

  // store & render user text
  userMessages.push(text);
  allMessages.push({ sender: 'user', text });
  renderMessage('user', text);
  inputEl.value = '';

  // now hit your Lambda
  await chatBoxUse();
});

document.addEventListener('DOMContentLoaded', () => {
  // — Sidebar tab switching —
  const menuItems = document.querySelectorAll('.sidebar .menu-item');
  const pages     = document.querySelectorAll('.sidebar-page');

  function showPage(pageId) {
    pages.forEach(p => p.classList.toggle('active', p.id === pageId));
    console.log(`Switched to ${pageId}`);
  }

  menuItems.forEach(item => {
    item.addEventListener('click', () => showPage(item.dataset.page));
  });

  // — Subpage button handlers —
  document.getElementById('generateIdeaBtn').addEventListener('click', onGenerateIdea);
  document.getElementById('guideMeBtn').addEventListener('click', onGuideMe);
  document.getElementById('organizeIdeasBtn').addEventListener('click', onOrganizeIdeas);
});

// Placeholder logic—swap in your real implementations:
function onGenerateIdea(evt) {
  const prompt = document.getElementById('generateInput').value;
  console.log('Generate Idea → prompt:', prompt);
  requestGenerateIdea(prompt);
}

function onGuideMe(evt) {
  console.log('Guide Me clicked');
  // TODO: implement guideMe()
}

function onOrganizeIdeas(evt) {
  console.log('Organize Ideas clicked');
  // TODO: implement organizeIdeas()
}

function requestGenerateIdea(prompt) {
    const whiteBoard = document.getElementById('canvas-svg').outerHTML
    const apiUrl = 'https://z97z0fx1md.execute-api.us-west-2.amazonaws.com/default/generate-ideas-claude';
    const data = {
        "whiteboard": whiteBoard
    };
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'origin': 'https://main.d1zfh5jl8g0um5.amplifyapp.com/',
            'Access-Control-Request-Method': '*'
    },
    body: JSON.stringify(data)
  };

  console.log(data)
  fetch(apiUrl, requestOptions)
    .then(res => res.json())
    .then(json => {
      const output = json
      console.log(output)
      // Parse the returned SVG string into a fresh element
      const parser = new DOMParser();
      const doc    = parser.parseFromString(output, 'image/svg+xml');
      const newSvg = doc.documentElement;

      // Ensure it carries the same ID & styling:
      newSvg.setAttribute('id', 'canvas-svg');
      newSvg.style.width  = '100%';
      newSvg.style.height = '100%';

      // Swap it in:
      const oldSvg = document.getElementById('canvas-svg');
      oldSvg.replaceWith(newSvg);

      // Now re-wire up your observer and handlers on the new SVG:
      initStickyNotes(newSvg);
    })
    .catch(err => console.error('API error:', err));

  

}
const LAMBDA_URL = 'https://4rygkzqfcj.execute-api.us-west-2.amazonaws.com/default/claudeChatBox';
async function chatBoxUse() {
  try {
    const resp = await fetch(LAMBDA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userMessages,   // ← your array of user texts
        allMessages,    // ← interleaved history if you need context
      })
    });
    const { reply } = await resp.json();
    addAIMessage(reply);  // ← reuses your UI helper
  } catch (err) {
    console.error('Lambda error', err);
  }
}

