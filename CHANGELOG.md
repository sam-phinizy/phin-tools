# Changelog

All notable changes to the "Phin Tools" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.2] - 2025-03-15

### Added
- URI handler to trigger the clipboardToFilePath command from external applications
- Support for code comment style filepaths (`// filepath: path/to/file.js`)
- Last used directory is now remembered between sessions
- Improved directory suggestions in the file path picker

### Fixed
- Issue with directory creation when filepath contained multiple nested directories

## [0.0.1] - 2025-02-28

### Added
- Initial release
- Clipboard to file path command (`extension.clipboardToFilePath`)
- Support for markdown style filepaths (`# filepath: path/to/file.md`)
- Quick pick interface for selecting file paths when not specified in clipboard
- Keyboard shortcut: Ctrl+Alt+V (Windows/Linux), Cmd+Alt+V (Mac)