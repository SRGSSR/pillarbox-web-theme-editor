import pillarboxScssWorkspace from '../assets/pillarbox-scss-workspace.json';

/**
 * Utility class for loading and saving the workspace to local storage.
 *
 * @class WorkspaceProvider
 */
class WorkspaceProvider {
  /**
   * Loads the workspace from local storage.
   *
   * @static
   * @returns {Object} An object representing the workspace.
   */
  static loadWorkspace() {
    return JSON.parse(localStorage.getItem('pbte-workspace')) || pillarboxScssWorkspace;
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
