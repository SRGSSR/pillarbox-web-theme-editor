import './components/resizable-split-view.js';
import './components/tree-view.js';
import './components/toggle-pane-button.js';
import './components/confirmation-dialog.js';
import './components/preview-box.js';
import './components/css-editor.js';
import './components/editor-tabs.js';
import sassCompiler from './workspace/workspace.js';
import TabManager from './app/tab-manager.js';
import initEditorController from './app/editor-controller.js';
import initLayoutController from './app/layout-controller.js';
import initPreviewController from './app/preview-controller.js';

const tabManager = new TabManager(sassCompiler.workspace);

initLayoutController({
  split: document.getElementById('main-split'),
  sidebar: document.getElementById('sidebar'),
  sidebarButton: document.getElementById('toggle-sidebar-button'),
  previewButton: document.getElementById('toggle-preview-button'),
  dockButton: document.getElementById('dock-button')
});

initPreviewController({
  compiler: sassCompiler,
  preview: document.getElementById('preview'),
  navigation: document.getElementById('navigation'),
  downloadButton: document.getElementById('download-button'),
  resetButton: document.getElementById('reset-button'),
  resetDialog: document.getElementById('reset-confirmation-dialog')
});

initEditorController({
  compiler: sassCompiler,
  tabManager,
  navigation: document.getElementById('navigation'),
  tabs: document.getElementById('tabs'),
  editor: document.getElementById('editor'),
  preview: document.getElementById('preview'),
  editorPane: document.getElementById('editor-pane')
});
