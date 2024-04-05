/**
 * This script scans scss folder of the `@srgssr/pillarbox-web` dependency and
 * recursively includes all the files and their content to create json
 * representation of the workspace for the theme editor.
 */
import { readdirSync, statSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const isDebugEnabled = process.argv.includes('--debug');

/**
 * Print a debug log.
 * @param message the message to log.
 */
function debug(message) {
  if (isDebugEnabled) {
    console.debug(message);
  }
}

/**
 * Checks if the given file path is a directory.
 *
 * @param {string} filePath - The path to the file to check.
 * @returns {boolean} True if the path is a directory, false otherwise.
 */
function isDirectory(filePath) {
  return statSync(filePath).isDirectory();
}

/**
 * Recursively generates a workspace structure of SCSS files and folders from a given directory.
 *
 * @param {string} dirPath - The path to the directory to generate the workspace from.
 * @returns {Array} A structured array of objects representing the directory and file structure.
 */
function generateWorkspace(dirPath) {
  return readdirSync(dirPath).map(name => {
    const fullPath = join(dirPath, name);
    if (isDirectory(fullPath)) {
      return { name, type: 'folder', children: generateWorkspace(fullPath) };
    } else {
      debug(`Reading file: ${fullPath}`);
      const content = readFileSync(fullPath, 'utf-8');
      return { name, type: 'scss', content };
    }
  });
}

try {
  console.log("Starting the generation of the SCSS workspace structure...");

  // Specify the directory to generate the workspace from.
  const structure = generateWorkspace('./node_modules/@srgssr/pillarbox-web/scss');

  // Define the output path for the generated workspace structure JSON file.
  const outputPath = './src/assets/pillarbox-scss-workspace.json';

  // Write the structured workspace to a JSON file, pretty-printed.
  console.log(`Writing the workspace structure to ${outputPath}...`);
  writeFileSync(outputPath, JSON.stringify(structure, null, 2), 'utf-8');

  console.log(`Successfully wrote the workspace structure to ${outputPath}`);
} catch(error) {
  console.error("Error occurred during the generation of the workspace:", error);
  process.exit(1);
}
