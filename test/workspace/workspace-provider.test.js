import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import WorkspaceProvider from '../../src/workspace/workspace-provider.js';
import pillarboxScssWorkspace from '../../src/assets/pillarbox-scss-workspace.json';

describe('WorkspaceProvider', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('loads the default workspace when local storage is empty', () => {
    expect(WorkspaceProvider.loadWorkspace()).toEqual(pillarboxScssWorkspace);
  });

  it('loads the workspace correctly from local storage', () => {
    const mockWorkspace = {
      id: 1,
      setting: 'test'
    };

    localStorage.setItem('pbte-workspace', JSON.stringify(mockWorkspace));
    expect(WorkspaceProvider.loadWorkspace()).toEqual(mockWorkspace);
  });

  it('saves the workspace correctly to local storage', () => {
    const mockWorkspace = {
      id: 2,
      setting: 'test2'
    };

    WorkspaceProvider.saveWorkspace(mockWorkspace);

    const savedWorkspace = JSON.parse(localStorage.getItem('pbte-workspace'));

    expect(savedWorkspace).toEqual(mockWorkspace);
  });

  it('clears the workspace from local storage', () => {
    localStorage.setItem('pbte-workspace', JSON.stringify({ id: 3 }));
    WorkspaceProvider.clear();

    const workspace = localStorage.getItem('pbte-workspace');

    expect(workspace).toBeNull();
  });
});
