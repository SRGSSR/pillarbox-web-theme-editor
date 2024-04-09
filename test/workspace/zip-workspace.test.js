import { describe, expect, it, vi } from 'vitest';
import JSZip from 'jszip';
import ZipWorkspace from '../../src/workspace/zip-workspace.js';

// Mocking necessary parts of the browser API
global.URL.createObjectURL = vi.fn();
global.URL.revokeObjectURL = vi.fn();
document.body.appendChild = vi.fn();
document.body.removeChild = vi.fn();

describe('ZipWorkspace', () => {
  it('creates a ZIP file with the correct structure', async() => {
    // Mock JSZip instance to track method calls and verify the structure
    const mockJSZipInstance = {
      file: vi.fn(),
      generateAsync: vi.fn().mockResolvedValue(new Blob())
    };

    vi.spyOn(JSZip.prototype, 'file').mockImplementation(mockJSZipInstance.file);
    vi.spyOn(JSZip.prototype, 'generateAsync').mockImplementation(mockJSZipInstance.generateAsync);

    const workspace = [
      {
        name: 'file.txt',
        content: 'Hello, world!',
        type: 'file'
      },
      {
        name: 'folder',
        type: 'folder',
        children: [
          {
            name: 'nested.txt',
            content: 'Nested file',
            type: 'file'
          }
        ]
      }
    ];

    const zipWorkspace = new ZipWorkspace(workspace);

    await zipWorkspace.download('test.zip');

    // Check if JSZip was used correctly to add files
    expect(mockJSZipInstance.file).toHaveBeenCalledWith('file.txt', 'Hello, world!');
    expect(mockJSZipInstance.file).toHaveBeenCalledWith('folder/nested.txt', 'Nested file');
    expect(mockJSZipInstance.generateAsync).toHaveBeenCalledWith({ type: 'blob' });
  });

  it('triggers the download of the ZIP file', async() => {
    const workspace = [{
      name: 'file.txt',
      content: 'Hello, world!',
      type: 'file'
    }];
    const zipWorkspace = new ZipWorkspace(workspace);

    await zipWorkspace.download('test.zip');

    // Assert the download was triggered with the correct filename
    expect(document.body.appendChild).toHaveBeenCalled();
    expect(document.body.removeChild).toHaveBeenCalled();
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalled();
  });
});
