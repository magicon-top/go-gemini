//________________________________________________________
//Injects mandatory root stylesheet to override existing response height styles, adds high-contrast custom scrollbar styling, sets h3 heading color to green, colors code elements with data-path-to-node attribute to #f70, and sets user-query-container width to 100% with a 10px font size. Function
function injectRootStyles() {
const style = document.createElement('style');
style.textContent = `
model-response { max-height: 400px !important; overflow-y: auto !important; display: block !important; }
model-response::-webkit-scrollbar { width: 10px !important; }
model-response::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.15) !important; border-radius: 5px !important; }
model-response::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.6) !important; border-radius: 5px !important; }
model-response::-webkit-scrollbar-thumb:hover { background: rgba(0, 0, 0, 0.8) !important; }
model-response h3 { color: #50dd00 !important; }
model-response code[data-path-to-node] { color: #f70 !important; }
.query-text-line { font-size: 18px !important;  color:#fff; line-height:1.3em; }
.user-query-bubble-with-background, .user-query-content { background:#000 !important; border-bottom:2px #f70 solid !important;}
.user-query-bubble-with-background { padding:10px !important; border-radius:5px !important; background:#111 !important}
.query-content  {padding:0px !important;}
.user-query-container, .user-query-content {width:100% !important;}
.conversation-container, .enable-lr26-response-chrome-updates, .response-container, .code-block, .enable-luminous-code-block {width:100% !important;}
/*.conversation-container, .enable-lr26-response-chrome-updates,  .ng-star-inserted, .response-container {width:100% !important;}*/
`;
document.head.appendChild(style); //Inject style rule into head
}
injectRootStyles(); //Execute style injection