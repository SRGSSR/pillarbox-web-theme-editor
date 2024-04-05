/**
 * A custom importer for the sass compiler that resolves imports from a virtual file system.
 *
 * @implements {import('sass/types/importer').Importer}
 */
export class VirtualSassImporter {
  /**
   * A map of virtual file paths to TreeItem objects.
   *
   * @type {{[key: string]: TreeItem}}
   */
  #files = {};

  /**
   * Creates an instance of VirtualSassImporter.
   *
   * @param {TreeItem[]} workspace The workspace array of TreeItem objects.
   * @param {{[key:string]: TreeItem}} [resources] (Optional) Static resources to include in the virtual filesystem.
   */
  constructor(workspace, resources = {}) {
    Object.entries(resources).forEach(([key, value]) => {
      this.#files[key] = value;
    });

    // Virtual files can override resources.
    this.#init(workspace);

    // Bind methods to ensure 'this' refers to the VirtualSassImporter instance
    this.canonicalize = this.canonicalize.bind(this);
    this.load = this.load.bind(this);
  }

  /**
   * Recursively initializes the virtual file system with the given workspace.
   *
   * @param {TreeItem[]} workspace - The workspace to process.
   * @param {string} path - The current path, used internally for recursion.
   * @private
   */
  #init(workspace, path = '') {
    workspace.forEach(item => {
      const currentPath = [path, item.name].filter(Boolean).join('/');

      if (item.type !== 'folder') {
        this.#files[currentPath] = item;
      } else {
        this.#init(item.children, currentPath);
      }
    });
  }

  /**
   * Resolves the canonical path for an import.
   *
   * @param {string} url - The URL to canonicalize.
   *
   * @returns {URL|null} The canonical URL, or null if not found.
   */
  canonicalize(url) {
    const folders = url.split('/');
    const filename = folders.pop();
    const resolvedUrl = [
      // Original url
      url,
      // scss extension
      [...folders, `${filename}.scss`].join('/'),
      // css extension
      [...folders, `${filename}.css`].join('/'),
      // Partial without extension
      [...folders, `_${filename}`].join('/'),
      // Partial with scss extension
      [...folders, `_${filename}.scss`].join('/'),
      // Partial with css extension
      [...folders, `_${filename}.css`].join('/')
    ].find(path => this.#files[path]);

    if (resolvedUrl) {
      // Return a custom virtual-file protocol
      return new URL(`virtual-file://${resolvedUrl}`);
    }

    return null;
  }

  /**
   * Loads the content and syntax of a file given its canonical URL.
   *
   * @param {URL} canonicalUrl - The canonical URL of the file to load.
   * @returns {{contents: string, syntax: string}|null} The file contents and syntax, or null if not found.
   */
  load(canonicalUrl) {
    const url = canonicalUrl.href.slice('virtual-file://'.length);
    const file = this.#files[url];

    if (!file) return null;

    return {
      contents: file.content,
      syntax: file.type
    };
  }
}
