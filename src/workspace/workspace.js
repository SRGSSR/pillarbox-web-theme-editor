import pillarboxScssWorkspace from '../assets/pillarbox-scss-workspace.json';
import videoJsStyle from 'video.js/dist/video-js.css?inline';
import { SassWorkspaceCompiler } from './sass-workspace-compiler.js';

export default new SassWorkspaceCompiler(
  pillarboxScssWorkspace,
  'pillarbox.scss',
  {
    '../node_modules/video.js/dist/video-js': {
      content: videoJsStyle,
      name: 'video-js.css',
      type: 'css'
    }
  }
);
