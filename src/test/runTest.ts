import * as path from 'path';
import * as cp from 'child_process';

import {
  runTests,
  downloadAndUnzipVSCode,
  resolveCliArgsFromVSCodeExecutablePath
} from '@vscode/test-electron';

async function main() {
  try {
    // The folder containing the Extension Manifest package.json
    // Passed to `--extensionDevelopmentPath`
    const extensionDevelopmentPath = path.resolve(__dirname, '../../');

    // The path to the extension test script
    // Passed to --extensionTestsPath
    const extensionTestsPath = path.resolve(__dirname, './suite/index');

    // Download VS Code, unzip it and run the integration test
    const vscodeExecutablePath = await downloadAndUnzipVSCode('stable');
    const [cliPath, ...args] = resolveCliArgsFromVSCodeExecutablePath(vscodeExecutablePath);

    // Use cp.spawn to launch a new VS Code process
    cp.spawnSync(cliPath, [...args, '--extensionDevelopmentPath', extensionDevelopmentPath, '--extensionTestsPath', extensionTestsPath], {
      encoding: 'utf-8',
      stdio: 'inherit'
    });
  } catch (err) {
    console.error('Failed to run tests:', err);
    process.exit(1);
  }
}

main();
