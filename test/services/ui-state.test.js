import { afterEach, describe, expect, it } from 'vitest';
import UiState from '../../src/services/ui-state.js';

describe('UiState', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('returns the defaults when nothing is stored', () => {
    const state = UiState.load();

    expect(state).toEqual({
      previewDock: 'bottom',
      previewVisible: true,
      sidebarCollapsed: false,
      bu: 'srf',
      openTabs: [],
      activeTab: null
    });
  });

  it('only persists explicitly saved properties', () => {
    UiState.save({ bu: 'rts' });

    const raw = JSON.parse(localStorage.getItem('pbte-ui-state'));

    expect(raw).toEqual({ bu: 'rts' });
  });

  it('merges saved partials over the defaults', () => {
    UiState.save({ previewDock: 'right' });
    UiState.save({ bu: 'rts' });

    const state = UiState.load();

    expect(state.previewDock).toBe('right');
    expect(state.bu).toBe('rts');
    expect(state.previewVisible).toBe(true);
  });

  it('round-trips complex values', () => {
    const openTabs = ['pillarbox.scss', 'components/_slider.scss'];

    UiState.save({ openTabs, activeTab: 'pillarbox.scss' });

    const state = UiState.load();

    expect(state.openTabs).toEqual(openTabs);
    expect(state.activeTab).toBe('pillarbox.scss');
  });

  it('returns the defaults again after clear', () => {
    UiState.save({ sidebarCollapsed: true });
    UiState.clear();

    expect(UiState.load().sidebarCollapsed).toBe(false);
  });
});
