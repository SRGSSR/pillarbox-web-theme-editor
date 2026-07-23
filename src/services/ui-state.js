const STORAGE_KEY = 'pbte-ui-state';

/**
 * Default values of the UI state, used when nothing has been persisted yet.
 */
const DEFAULTS = {
  previewDock: 'bottom',
  previewVisible: true,
  sidebarCollapsed: false,
  openTabs: [],
  activeTab: null
};

/**
 * Reads and parses the persisted state, tolerating missing or corrupted
 * values so a bad entry can never prevent the app from starting.
 *
 * @returns {Object} The stored state, or an empty object.
 */
function readStored() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

/**
 * Utility class for loading and saving the workbench UI state (layout,
 * open tabs) to local storage under a single key.
 *
 * @class UiState
 */
class UiState {
  /**
   * Loads the UI state from local storage, merged over the defaults.
   *
   * @static
   * @returns {typeof DEFAULTS} The current UI state.
   */
  static load() {
    return { ...DEFAULTS, ...readStored() };
  }

  /**
   * Merges the given partial state into the stored UI state. Only explicitly
   * saved properties are persisted, so future changes to the defaults still
   * apply to untouched settings.
   *
   * @static
   * @param {Partial<typeof DEFAULTS>} partial The properties to update.
   * @returns {void}
   */
  static save(partial) {
    const next = { ...readStored(), ...partial };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  /**
   * Clears the UI state from the local storage.
   */
  static clear() {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export default UiState;
