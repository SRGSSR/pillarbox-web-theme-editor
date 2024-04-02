import './components/css-editor.js';
import './components/resizable-split-view.js';
import './components/preview-box.js';
import './components/tree-view.js';

const editor = document.getElementById('editor');
const preview = document.getElementById('preview');

preview.appliedCss = editor.getValue();
editor.addEventListener('value-changed', (event) => {
  preview.appliedCss = event.detail.value;
});
