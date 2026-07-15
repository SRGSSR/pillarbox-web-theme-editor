import './components/resizable-split-view.js';
import './components/tree-view.js';
import './components/toggle-pane-button.js';
import './components/confirmation-dialog.js';
import './components/preview-box.js';
import './components/css-editor.js';
import './components/editor-tabs.js';
import './components/media-search.js';
import sassCompiler from './workspace/workspace.js';
import TabManager from './app/tab-manager.js';
import initEditorController from './app/editor-controller.js';
import initLayoutController from './app/layout-controller.js';
import initPreviewController from './app/preview-controller.js';

const byId = (id) => document.getElementById(id);

const tabManager = new TabManager(sassCompiler.workspace);

initLayoutController({
  split: byId('main-split'),
  sidebar: byId('sidebar'),
  sidebarButton: byId('toggle-sidebar-button'),
  previewButton: byId('toggle-preview-button'),
  dockButton: byId('dock-button')
});

initPreviewController({
  compiler: sassCompiler,
  preview: byId('preview'),
  navigation: byId('navigation'),
  mediaSearch: byId('media-search'),
  downloadButton: byId('download-button'),
  resetButton: byId('reset-button'),
  resetDialog: byId('reset-confirmation-dialog')
});

initEditorController({
  compiler: sassCompiler,
  tabManager,
  navigation: byId('navigation'),
  tabs: byId('tabs'),
  editor: byId('editor'),
  preview: byId('preview'),
  editorPane: byId('editor-pane')
});
