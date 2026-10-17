const form = document.getElementById('chatForm');
const promptInput = document.getElementById('prompt');
const messagesEl = document.getElementById('messages');
const welcome = document.getElementById('welcome');
const sendButton = document.getElementById('sendButton');
const historyEl = document.getElementById('history');
const sidebar = document.getElementById('sidebar');
let conversation = [];
let busy = false;

function escapeHTML(value) {
  return value.replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}
function renderBasicMarkdown(text) {
  // Escaping first keeps model output from injecting HTML. This supports simple inline code and fenced code.
  let safe = escapeHTML(text);
  safe = safe.replace(/```([\w-]*)\n([\s\S]*?)```/g, (_, lang, code) => `<pre><code>${code.trim()}</code></pre>`);
  safe = safe.replace(/`([^`]+)`/g, '<code>$1</code>');
  safe = safe.split(/\n{2,}/).map(part => part.startsWith('<pre>') ? part : `<p>${part.replace(/\n/g,'<br>')}</p>`).join('');
  return safe;
}
function addMessage(role, text, extraClass='') {
  const item = document.createElement('div');
  item.className = `message ${role} ${extraClass}`.trim();
  if (role === 'assistant') {
    item.innerHTML = `<div class="avatar">✦</div><div class="bubble">${renderBasicMarkdown(text)}</div>`;
  } else {
    item.innerHTML = `<div class="bubble">${escapeHTML(text).replace(/\n/g,'<br>')}</div>`;
  }
  messagesEl.appendChild(item);
  document.getElementById('conversation').scrollTop = document.getElementById('conversation').scrollHeight;
  return item;
}
function setBusy(value) {
  busy = value;
  sendButton.disabled = value;
  sendButton.innerHTML = value ? '…' : '<span>↑</span>';
}
function newConversation() {
  conversation = [];
  messagesEl.innerHTML = '';
  welcome.classList.remove('hidden');
  historyEl.innerHTML = '<div class="history-item active">✧ <span>New conversation</span></div>';
  promptInput.value = '';
  sidebar.classList.remove('open');
}
async function sendMessage(text) {
  const clean = text.trim();
  if (!clean || busy) return;
  welcome.classList.add('hidden');
  addMessage('user', clean);
  conversation.push({role:'user', content:clean});
  if (conversation.length === 1) {
    const label = clean.length > 28 ? clean.slice(0,28) + '…' : clean;
    historyEl.innerHTML = `<div class="history-item active">✧ <span>${escapeHTML(label)}</span></div>`;
  }
  promptInput.value = '';
  promptInput.style.height = 'auto';
  setBusy(true);
  const typing = addMessage('assistant', '');
  typing.querySelector('.bubble').innerHTML = '<div class="typing"><i></i><i></i><i></i></div>';
  try {
    const response = await fetch('/api/chat', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({messages:conversation})
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
    const answer = data.reply || 'I could not generate a response. Please try again.';
    conversation.push({role:'assistant', content:answer});
    typing.querySelector('.bubble').innerHTML = renderBasicMarkdown(answer);
  } catch (error) {
    typing.querySelector('.bubble').innerHTML = `<p class="error">${escapeHTML(error.message || 'Something went wrong. Please try again.')}</p><p>Check that GEMINI_API_KEY is set in Vercel Environment Variables, then redeploy.</p>`;
  } finally {
    setBusy(false);
    promptInput.focus();
    document.getElementById('conversation').scrollTop = document.getElementById('conversation').scrollHeight;
  }
}
form.addEventListener('submit', event => { event.preventDefault(); sendMessage(promptInput.value); });
promptInput.addEventListener('input', () => { promptInput.style.height='auto'; promptInput.style.height=Math.min(promptInput.scrollHeight,180)+'px'; });
promptInput.addEventListener('keydown', event => { if(event.key==='Enter' && !event.shiftKey){event.preventDefault();form.requestSubmit();} });
document.getElementById('newChat').addEventListener('click', newConversation);
document.getElementById('clearChat').addEventListener('click', newConversation);
document.getElementById('mobileMenu').addEventListener('click', () => sidebar.classList.toggle('open'));
document.querySelectorAll('.suggestion').forEach(button => button.addEventListener('click', () => sendMessage(button.dataset.prompt)));
