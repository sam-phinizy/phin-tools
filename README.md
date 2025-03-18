# Phin Tools

Just a collection of custom vscode commands for myself.

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

## URI Handler

This extension supports being triggered via a URI protocol, which allows you to invoke extension commands from outside VS Code.

### URI Format

```
vscode://phin-tech.phin-tools/clipboardToFilePath
```

### Examples

You can create:

- Browser links that open VS Code and trigger the clipboard-to-file action
- Shell scripts that automate VS Code actions
- Integration with other applications

### Example HTML link

```html
<a href="vscode://phin-tech.phin-tools/clipboardToFilePath">
  Create file from clipboard
</a>
```

### Example shell command

```bash
# Copy something to clipboard first
open 'vscode://phin-tech.phin-tools/clipboardToFilePath'
```

Note: The exact URI scheme (`vscode://`) may vary depending on your VS Code environment (VS Code desktop, VS Code Insiders, etc.). The code automatically uses the correct scheme for your environment.
