import pillarboxScssWorkspace from '../assets/pillarbox-scss-workspace.json';

/**
 * Utility class for loading and saving the workspace to local storage.
 *
 * @class WorkspaceProvider
 */
class WorkspaceProvider {
  /**
   * Loads the workspace from local storage, falling back to the bundled
   * default workspace when nothing is stored or the value is corrupted.
   *
   * @static
   * @returns {Object} An object representing the workspace.
   */
  static loadWorkspace() {
    try {
      return JSON.parse(localStorage.getItem('pbte-workspace')) ||
        pillarboxScssWorkspace;
    } catch {
      return pillarboxScssWorkspace;
    }
  }

  /**
   * Save the workspace to local storage.
   *
   * @static
   * @param {Object} workspace An object representing the workspace. to be saved.
   * @returns {void}
   */
  static saveWorkspace(workspace) {
    localStorage.setItem('pbte-workspace', JSON.stringify(workspace));
  }

  /**
   * Clears the workspace from the local storage.
   */
  static clear() {
    localStorage.removeItem('pbte-workspace');
  }
}

export default WorkspaceProvider;
