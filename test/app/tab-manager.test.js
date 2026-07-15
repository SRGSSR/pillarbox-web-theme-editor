import { beforeEach, describe, expect, it, vi } from 'vitest';
import TabManager from '../../src/app/tab-manager.js';

describe('TabManager', () => {
  let manager, workspace, main, slider, menu;

  beforeEach(() => {
    main = { name: 'pillarbox.scss', type: 'scss', content: 'main' };
    slider = { name: '_slider.scss', type: 'scss', content: 'slider' };
    menu = { name: '_menu.scss', type: 'scss', content: 'menu' };
    workspace = [
      {
        name: 'components',
        type: 'folder',
        children: [
          slider,
          { name: 'menu', type: 'folder', children: [menu] }
        ]
      },
      main
    ];
    manager = new TabManager(workspace);
  });

  it('indexes nested files by path', () => {
    expect(manager.idOf(main)).toBe('pillarbox.scss');
    expect(manager.idOf(slider)).toBe('components/_slider.scss');
    expect(manager.idOf(menu)).toBe('components/menu/_menu.scss');
    expect(manager.itemByPath('components/menu/_menu.scss')).toBe(menu);
  });

  it('opens tabs once and activates the opened item', () => {
    manager.open(main);
    manager.open(slider);
    manager.open(main);

    expect(manager.tabs).toEqual([main, slider]);
    expect(manager.active).toBe(main);
    expect(manager.activeId).toBe('pillarbox.scss');
    expect(manager.tabEntries).toEqual([
      { id: 'pillarbox.scss', name: 'pillarbox.scss' },
      { id: 'components/_slider.scss', name: '_slider.scss' }
    ]);
  });

  it('activates the nearest neighbour when closing the active tab', () => {
    manager.open(main);
    manager.open(slider);
    manager.open(menu);
    manager.activate('components/_slider.scss');

    manager.close('components/_slider.scss');

    expect(manager.tabs).toEqual([main, menu]);
    expect(manager.active).toBe(menu);
  });

  it('keeps the active tab when closing another tab', () => {
    manager.open(main);
    manager.open(slider);
    manager.activate('pillarbox.scss');

    manager.close('components/_slider.scss');

    expect(manager.active).toBe(main);
  });

  it('has no active tab once every tab is closed', () => {
    manager.open(main);
    manager.close('pillarbox.scss');

    expect(manager.tabs).toEqual([]);
    expect(manager.active).toBeNull();
    expect(manager.activeId).toBeUndefined();
  });

  it('restores persisted tabs and drops stale paths', () => {
    manager.restore(
      ['pillarbox.scss', 'gone/_missing.scss', 'components/_slider.scss'],
      'components/_slider.scss'
    );

    expect(manager.tabs).toEqual([main, slider]);
    expect(manager.active).toBe(slider);
  });

  it('falls back to the first tab when the active path is stale', () => {
    manager.restore(['pillarbox.scss'], 'gone/_missing.scss');

    expect(manager.active).toBe(main);
  });

  it('dispatches a change event on every mutation', () => {
    const listener = vi.fn();

    manager.addEventListener('change', listener);
    manager.open(main);
    manager.activate('pillarbox.scss');
    manager.close('pillarbox.scss');

    expect(listener).toHaveBeenCalledTimes(3);
  });

  it('registers new items created at runtime', () => {
    const preset = { name: '_preset.scss', type: 'scss', content: '' };

    manager.registerItem(preset, '_preset.scss');

    expect(manager.itemByPath('_preset.scss')).toBe(preset);
    expect(manager.idOf(preset)).toBe('_preset.scss');
  });
});
