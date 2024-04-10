import pillarboxScssWorkspace from '../assets/pillarbox-scss-workspace.json';
import videoJsStyle from 'video.js/dist/video-js.css?inline';
import { SassWorkspaceCompiler } from './sass-workspace-compiler.js';

/**
 * Instance of `SassWorkspaceCompiler` dedicated to compiling the sass styles for pillarbox
 *
 * This setup includes the main Sass file (`pillarbox.scss`) that needs to be compiled along with
 * additional static resources necessary for the compilation.
 *
 * @see SassWorkspaceCompiler
 */
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
