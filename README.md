# Phin Tools for VS Code

A collection of productivity tools for Visual Studio Code that streamline common development workflows.

![Phin Tools Banner](images/banner.png)

## Features

### Clipboard to File Path

This powerful feature allows you to write clipboard content directly to a file in your workspace. The extension intelligently parses the first line of your clipboard to extract a target file path.

**Two supported formats:**
- `# filepath: path/to/file.ext`
- `// filepath: path/to/file.ext`


#### How it works:

1. Copy text containing a filepath directive in the first line
2. Press `Ctrl+Alt+V` (Windows/Linux) or `Cmd+Alt+V` (Mac)
3. The extension creates the file (including any necessary directories) and opens it in the editor

#### If no filepath is specified:

The extension will prompt you with a quick picker to select or enter a destination path.

- Suggestions are based on your workspace directory structure
- The extension remembers your last used directory
- Paths are dynamically filtered as you type

## Installation

### From VS Code Marketplace

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Phin Tools"
4. Click Install

### From VSIX file

1. Download the latest VSIX from the [releases page](https://github.com/phin-tech/phin-tools/releases)
2. In VS Code, open the Extensions view
3. Click the "..." menu in the top right of the Extensions panel
4. Select "Install from VSIX..."
5. Choose the downloaded VSIX file

## URI Handler

This extension supports being triggered via a URI protocol, allowing you to invoke extension commands from outside VS Code.

### URI Format

```
vscode://phin-tech.phin-tools/clipboardToFilePath
```

### Example uses:

- Create browser links that open VS Code and trigger the clipboard-to-file action
- Build shell scripts that automate VS Code actions
- Integrate with other applications

#### HTML link example:

```html
<a href="vscode://phin-tech.phin-tools/clipboardToFilePath">
  Create file from clipboard
</a>
```

#### Shell command example:

```bash
# Copy something to clipboard first
open 'vscode://phin-tech.phin-tools/clipboardToFilePath'
```

Note: The exact URI scheme (`vscode://`) may vary depending on your VS Code environment (VS Code desktop, VS Code Insiders, etc.).

## Usage Tips

### Creating templates with filepath directives

You can set up code snippets or templates with the filepath directive in the first line:

```
# filepath: src/components/NewComponent.jsx

import React from 'react';

function NewComponent() {
  return (
    <div>
      New Component Content
    </div>
  );
}

export default NewComponent;
```

Then copy this content and use the extension to quickly create the file in the right location.

### IDE integration

This extension works especially well with:
- Multi-cursor editing
- Snippets
- Custom keyboard shortcuts

## Requirements

- VS Code 1.95.0 or higher

## Extension Settings

Currently, this extension doesn't add any VS Code settings.

## Known Issues

See our [GitHub issues page](https://github.com/phin-tech/phin-tools/issues) for a list of known issues.

## Release Notes

### 0.0.2

- Added URI handler to trigger the clipboardToFilePath command from external applications
- Initial release with clipboardToFilePath command

### 0.0.1

- Initial release with basic clipboardToFilePath functionality

## Roadmap

Upcoming features we're considering:

- Templates support for commonly used file structures
- Config options for default paths and behaviors
- Multiple workspace folder support
- Command for creating multiple files at once

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any problems or have suggestions, please [file an issue](https://github.com/phin-tech/phin-tools/issues).

---

**Enjoy!**