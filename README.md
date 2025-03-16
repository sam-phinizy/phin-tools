# Phin Tools

just a collection of custom vscode commands for myself.

## Commands

- `extension.clipboardToFilePath`: Write clipboard to file
This command will write the clipboard content to a file in the current workspace.
The file path is expected to be the first line of the clipboard content, prefixed with `# filepath: FILEPATH`.

## Installation

1. Download the latest release from the [releases page](https://github.com/phin-tech/phin-tools/releases).
2. Open the Extensions view by clicking on the Extensions icon in the Activity Bar on the side of the window or by pressing `Ctrl+Shift+X`.
3. Click on the `...` button in the top right corner of the Extensions view.
4. Click on `Install from VSIX...`.
5. Select the `phin-tools-0.0.1.vsix` file.
6. Click on the `Install` button.

## Usage

- `Ctrl+Alt+V`: Write clipboard to file
