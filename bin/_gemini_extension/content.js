let knownIds = new Set(); let isInit = false; let isProcessing = false; let lastProcessedUrl = ''; const audioCtx = new (window.AudioContext || window.webkitAudioContext)(); //Init variables
//________________
//Injects mandatory root stylesheet to override existing response height styles. Function
function injectRootStyles() {
const style = document.createElement('style'); style.textContent = 'model-response { max-height: 800px !important; overflow-y: auto !important; display: block !important; }'; document.head.appendChild(style); //Inject style rule into head
}
//________________
//Sends data to Go server and inserts response into active textarea. Function
async function sendToGo(data, titleText, fullUrl, pair) {
if (lastProcessedUrl === fullUrl) { isProcessing = false; return; }
lastProcessedUrl = fullUrl;
const controller = new AbortController(); const timeoutId = setTimeout(() => controller.abort(), 10000); //10 seconds timeout
try {
const response = await fetch('http://localhost:8080/api/topic', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data), signal: controller.signal });
clearTimeout(timeoutId); if (response.ok) { const result = await response.json(); playBeep(); if (result.status === "ok" && result.processed) { insertIntoActiveTextarea(result.processed); } }
} catch (error) { playBeep(); } finally { setTimeout(() => { isProcessing = false; }, 3000); }
}
//________________
//Inserts processed text only into the active/visible rich-textarea and clicks its corresponding send button. Function
function insertIntoActiveTextarea(text) {
const textareas = document.querySelectorAll('rich-textarea'); if (!textareas || textareas.length === 0) return; //Find all textareas
let targetTextarea = null;
for (let ta of textareas) {
if (ta.offsetParent !== null) { targetTextarea = ta; break; } //Find the first visible textarea on screen
}
if (!targetTextarea) targetTextarea = textareas[textareas.length - 1]; //Fallback to the last one if none marked visible
const pNode = targetTextarea.querySelector('div.ql-editor.textarea.new-input-ui p');
if (pNode) {
pNode.innerHTML = text; pNode.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: true })); //Set inner text and trigger input event
setTimeout(() => {
const sendBtn = targetTextarea.querySelector('button[aria-label="Отправить сообщение"]') || document.querySelector('button[aria-label="Отправить сообщение"]');
if (sendBtn) {
sendBtn.removeAttribute('disabled');
sendBtn.click();
sendBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
} //Find button inside target or globally and click
}, 400);
}
}
//________________
//Plays a short beep sound using Web Audio API. Function
function playBeep() {
if (audioCtx.state === 'suspended') { audioCtx.resume(); } //Resume audio context
const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain(); //Create audio nodes
osc.connect(gain); gain.connect(audioCtx.destination); //Connect nodes
osc.type = 'sine'; osc.frequency.value = 800; gain.gain.setValueAtTime(0.2, audioCtx.currentTime); //Set tone
osc.start(); osc.stop(audioCtx.currentTime + 0.3); //Play sound
}
//________________
//Extracts prompt and answer text from DOM nodes after page switch. Function
function getChatPair() {
const userNodes = document.querySelectorAll('user-query'); const modelNodes = document.querySelectorAll('model-response'); //Select query and response nodes
const lastUser = userNodes.length > 0 ? userNodes[userNodes.length - 1] : null; const lastModel = modelNodes.length > 0 ? modelNodes[modelNodes.length - 1] : null; //Get last items
const queryText = lastUser ? (lastUser.querySelector('.query-text')?.innerText || '').replace('Ваш запрос', '').trim() : ''; //Extract question
const responseText = lastModel ? (lastModel.querySelector('message-content')?.innerText || '').trim() : ''; //Extract answer
return { q: queryText, a: responseText }; //Return text pair
}
//________________
//Extracts title text from item node. Function
function getItemTitle(element) {
const parent = element.closest('gem-nav-list-item'); const titleNode = parent ? parent.querySelector('.title-text') : null; return titleNode ? titleNode.innerText.trim() : 'Новая тема'; //Find text node
}
//________________
//Checks for newly added links in the DOM tree. Function
function checkNewLinks() {
if (isProcessing) return; //Block execution if currently processing a request
const links = document.querySelectorAll('a[href*="/app/"]'); if (!links || links.length === 0) return; //Select links
const currentIds = new Set(); links.forEach(a => { const href = a.getAttribute('href'); if (href) currentIds.add(href); }); //Collect IDs
if (!isInit) { knownIds = currentIds; isInit = true; return; } //Set initial baseline
for (let a of links) {
const id = a.getAttribute('href');
if (id && !knownIds.has(id)) {
knownIds.add(id);
const fullUrl = 'https://gemini.google.com' + id;
if (fullUrl === lastProcessedUrl) continue;
isProcessing = true;
const titleText = getItemTitle(a);
a.click();
setTimeout(() => {
const pair = getChatPair();
sendToGo({ title: titleText, url: fullUrl, question: pair.q, answer: pair.a }, titleText, fullUrl, pair);
}, 2000);
break;
}
}
}
//________________
//Sets up MutationObserver on body to handle DOM events. Function
function initObserver() {
injectRootStyles(); checkNewLinks(); const observer = new MutationObserver(() => { checkNewLinks(); }); //Inject style rule, run scan and init observer
observer.observe(document.body, { childList: true, subtree: true }); //Watch DOM changes by event
}
setTimeout(initObserver, 6000); //Start event listener after 6 seconds delay on page load