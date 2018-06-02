
import * as vscode from 'vscode';

export interface IDE {
  log : (msg: string) => void;
}

let ide;

export class CodeIDE implements IDE {
  constructor() {}
  log(msg: string) {
    vscode.window.showInformationMessage(msg);
  }
}
