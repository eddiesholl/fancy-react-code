'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { getState } from './state';
import { generate, tests } from './actions';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "code-fancy-react" is now active!');

    const state = getState();

    const generateDisposable = vscode.commands.registerCommand('extension.generate', () => {
        generate(state);
    });
    const testsDisposable = vscode.commands.registerCommand('extension.tests', () => {
        tests(state);
    });

    context.subscriptions.push(generateDisposable);
    context.subscriptions.push(testsDisposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}
