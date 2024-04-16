import './components/resizable-split-view.js';
import './components/tree-view.js';
import './components/toggle-pane-button.js';
import './components/confirmation-dialog.js';
import './components/preview-box.js';
import './components/css-editor.js';
import sassCompiler from './workspace/workspace.js';
import WorkspaceProvider from './workspace/workspace-provider.js';

// Preview Initialisation
const preview = document.getElementById('preview');
const sourceInput = document.getElementById('src-input');

sourceInput.addEventListener('keyup', (event) => {
  const src = event.target.value;

  if (event.key === 'Enter' && src) {
    preview.mediaSrc = src;
  }
});

preview.appliedCss = sassCompiler.compile();

// Editor Initialisation
const editor = document.getElementById('editor');
let currentItem = sassCompiler.mainScss;

editor.setValue(sassCompiler.mainScss.content);
editor.addEventListener('value-changed', (event) => {
  currentItem.content = event.detail.value;
  preview.appliedCss = sassCompiler.compile();
  WorkspaceProvider.saveWorkspace(sassCompiler.workspace);
});

// Navigation Control
const navigation = document.getElementById('navigation');
const navigationButton = document.getElementById('navigation-button');

navigation.items = sassCompiler.workspace;
navigation.addEventListener('selected', (event) => {
  currentItem = event.detail;
  navigationButton.label = currentItem.name;
  editor.setValue(currentItem.content);
  navigationButton.opened = false;
});

navigationButton.label = sassCompiler.mainScss.name;

// Download Control
const downloadButton = document.getElementById('download-button');

downloadButton.addEventListener('click', () => sassCompiler.download());

// Reset Control
const resetButton = document.getElementById('reset-button');
const confirmationDialog = document.getElementById('reset-confirmation-dialog');

resetButton.addEventListener('click', () => {
  confirmationDialog.toggle();
});
confirmationDialog.addEventListener('close', (event) => {
  if (event.detail.accepted) {
    WorkspaceProvider.clear();
    window.location.reload();
  }
});
