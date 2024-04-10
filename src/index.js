import './components/css-editor.js';
import './components/resizable-split-view.js';
import './components/preview-box.js';
import './components/tree-view.js';
import './components/toggle-pane-button.js';
import sassCompiler from './workspace/workspace.js';

let currentItem = sassCompiler.mainScss;

const navigation = document.getElementById('navigation');
const navigationButton = document.getElementById('navigation-button');
const editor = document.getElementById('editor');
const preview = document.getElementById('preview');
const downloadButton = document.getElementById('download');
const sourceInput = document.getElementById('src-input');

navigation.items = sassCompiler.workspace;
navigationButton.label = currentItem.name;
editor.setValue(currentItem.content);

navigation.addEventListener('selected', (event) => {
  currentItem = event.detail;
  navigationButton.label = currentItem.name;
  editor.setValue(currentItem.content);
  navigationButton.opened = false;
});

preview.appliedCss = sassCompiler.compile();
editor.addEventListener('value-changed', (event) => {
  currentItem.content = event.detail.value;
  preview.appliedCss = sassCompiler.compile();
});

downloadButton.addEventListener('click', () => sassCompiler.download());

sourceInput.addEventListener('keyup', (event) => {
  const src = event.target.value;

  if (event.key === 'Enter' && src) {
    preview.src = src;
  }
});
