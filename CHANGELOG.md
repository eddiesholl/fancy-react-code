# Change Log
All notable changes to the "fancy-react-code" extension will be documented in this file.

## 2.2.1
- fix: When trying to generate new component from snippet, only matches multiline components - issue #1
## 2.2.0
- feature: new component tree view, currently disabled by default
- feature: new setting `treeViewEnabled` to control new component tree view
## 2.1.2
- fix: port initModulePaths to help with resolving eslint plugins
## 2.1.1
- fix: add settings definitions so they can be loaded by vscode from user settings
## 2.1.0
- Add support for 'switch' action, which jumps from a source file to it's test file and back
## 2.0.0
- Exposes 'tests' action for generating jest tests from the export in the current source file
## 1.0.1
- Bugfix: activate new file before writing generated content
## 1.0.0
- Initial release
- Implements `generate` action
