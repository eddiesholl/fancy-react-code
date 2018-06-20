'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { getState } from './state';
import { generate, tests, switchFiles } from './actions';
import { ReactTreeProvider } from './core/tree/react-tree-provider';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "code-fancy-react" is now active!');

    const state = getState();

    try {
        const reactTreeProvider = new ReactTreeProvider(state);
        vscode.window.registerTreeDataProvider('fancyReactTree', reactTreeProvider);
    } catch (e) {
        console.error('Failed to create tree: ' + e)
    }

    const generateDisposable = vscode.commands.registerCommand('extension.generate', () => {
        generate(state);
    });
    const testsDisposable = vscode.commands.registerCommand('extension.tests', () => {
        tests(state);
    });
    const switchDisposable = vscode.commands.registerCommand('extension.switchFiles', () => {
        switchFiles(state);
    });

    const openDisposable = vscode.commands.registerCommand('extension.openFile', (args) => {
        state.ide.open(args);
    });

    context.subscriptions.push(generateDisposable);
    context.subscriptions.push(testsDisposable);
    context.subscriptions.push(switchDisposable);
    context.subscriptions.push(openDisposable);

    initModulePaths(state.project.projectRoot);
}

// this method is called when your extension is deactivated
export function deactivate() {
}

const initModulePaths = (root: string) => {
    process.env.NODE_PATH = root + '/node_modules';
    require('module').Module._initPaths();
};
  