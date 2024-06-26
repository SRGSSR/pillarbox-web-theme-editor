import * as sass from 'sass';
import { VirtualSassImporter } from './virtual-sass-importer.js';
import ZipWorkspace from './zip-workspace.js';

/**
 * Compiles SCSS files using a virtual filesystem. The compiler utilizes a
 * custom importer to resolve imports based on a provided workspace and resources.
 *
 * @property workspace The virtual workspace. Changes in the `content` of any
 *                     file will be reflected once the CSS compiled.
 * @property mainScss The main scss file.
 *
 * @example
 * // Define your workspace
 * const workspace = [
 *   {
 *     name: 'main.scss',
 *     content: '@import "variables"; .body { color: $primaryColor; }',
 *     type: 'scss'
 *   },
 *   {
 *     name: 'variables.scss',
 *     content: '$primaryColor: blue;',
 *     type: 'scss'
 *   }
 * ];
 *
 * // Instantiate the compiler with the workspace
 * const compiler = new SassWorkspaceCompiler(testWorkspace, {}, 'main.scss');
 *
 * // Compile the SCSS
 * const compiledCss = compiler.compile();
 */
export class SassWorkspaceCompiler {
  /**
   * The sass importer of this workspace.
   *
   * @type {import('sass/types/importer').Importer}
   */
  #importer;

  /**
   * Initializes a new instance of the SassWorkspaceCompiler.
   *
   * @param {TreeItem[]} workspace An array of TreeItem objects representing the files and directories in the workspace.
   * @param {string} main The name of the main SCSS file to compile.
   * @param {{[key:string]: TreeItem}} [resources] (Optional) An object mapping file paths to TreeItem objects for static resources.
   */
  constructor(workspace, main, resources = {}) {
    this.workspace = workspace;
    this.#importer = new VirtualSassImporter(workspace, resources);
    this.mainScss = this.workspace.find(item => item.name === main);
  }

  /**
   * Compiles the main SCSS file into CSS.
   *
   * @param {Boolean} [compressed=true]  whether the output css will be compressed or not.
   *
   * @returns {string} The compiled CSS.
   */
  compile(compressed = true) {
    const opts = {
      importer: this.#importer,
      style: compressed ? 'compressed' : 'expanded'
    };

    return sass.compileString(this.mainScss.content, opts).css;
  }

  /**
   * Generates the zip file containing the theme workspace and triggers a download in the browser.
   *
   * @param {string} [fileName='pillarbox-theme.zip'] The name for the downloaded zip file.
   *
   * @returns {Promise<void>} A promise that resolves when the download has been triggered.
   */
  async download(fileName = 'pillarbox-theme.zip') {
    await new ZipWorkspace(this.workspace).download(fileName);
  }
}
