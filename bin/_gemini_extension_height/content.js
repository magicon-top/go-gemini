//________________________________________________________
//Injects mandatory root stylesheet to override existing response height styles, adds high-contrast custom scrollbar styling, sets h3 heading color to green, and colors code elements with data-path-to-node attribute to #f70. Function
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
`;
document.head.appendChild(style); //Inject style rule into head
}
injectRootStyles(); //Execute style injection