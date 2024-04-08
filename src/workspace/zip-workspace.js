import JSZip from 'jszip';

/**
 * Bundles a workspace into a zip file and triggers the download.
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
 * // Instantiate the zip workspace and trigger the download
 * await new ZipWorkspace(testWorkspace).download('testWorkspace.zip');
 */
export default class ZipWorkspace {
  #zip;

  /**
   * Initializes a new instance of the ZipWorkspace.
   *
   * @param {TreeItem[]} workspace An array of TreeItem objects representing the files and directories in the workspace.
   */
  constructor(workspace) {
    this.#zip = new JSZip();
    this.#addItems(workspace);
  }

  /**
   * Recursively adds items to the zip archive.
   *
   * @param {TreeItem[]} workspace An array of TreeItem objects to add to the zip. Each item can be a file or a folder.
   * @param {string} [path=''] The current path in the zip archive. Used for recursive calls to maintain folder structure.
   * @private
   */
  #addItems(workspace, path = '') {
    workspace.forEach(item => {
      const currentPath = [path, item.name].filter(Boolean).join('/');

      if (item.type === 'folder') {
        this.#addItems(item.children, currentPath);
      } else {
        this.#zip.file(currentPath, item.content);
      }
    });
  }

  /**
   * Generates the zip file and triggers a download in the browser.
   *
   * @param {string} fileName The name for the downloaded zip file.
   *
   * @returns {Promise<void>} A promise that resolves when the download has been triggered.
   */
  async download(fileName) {
    const content = await this.#zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');

    a.download = fileName;
    a.href = url;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
