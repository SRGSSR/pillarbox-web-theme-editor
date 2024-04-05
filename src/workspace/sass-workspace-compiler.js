import * as sass from 'sass';
import { VirtualSassImporter } from './virtual-sass-importer.js';

/**
 * Compiles SCSS files using a virtual filesystem. The compiler utilizes a
 * custom importer to resolve imports based on a provided workspace and resources.
 *
 * @property workspace The virtual workspace. Changes in the `content` of any
 *                     file will be reflected once the CSS compiled.
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
   * The main scss file.
   *
   * @type {TreeItem}
   */
  #mainScss;

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
    this.#mainScss = this.workspace.find(item => item.name === main);
  }

  /**
   * Compiles the main SCSS file into CSS.
   *
   * @returns {string} The compiled CSS.
   */
  compile() {
    const opts = {
      importer: this.#importer,
      style: 'compressed'
    };

    return sass.compileString(this.#mainScss.content, opts).css;
  }
}
