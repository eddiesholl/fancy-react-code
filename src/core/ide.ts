import * as vscode from 'vscode';
import { IEditor, IIDE } from 'fancy-react-core';

import CodeEditor from './editor';

export class CodeIDE implements IIDE {
  constructor() {}
  log(msg: string) {
    vscode.window.showInformationMessage(msg);
  }

  open(filePath: string) {
    return new Promise<IEditor>((resolve) => {
      vscode.workspace.openTextDocument(filePath).then(() => {
        resolve(this.getEditor());
      });
    });
  }

  getEditor() {
    return new CodeEditor(vscode.window.activeTextEditor as vscode.TextEditor);
  }
}
