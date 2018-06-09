import * as vscode from 'vscode';
import { IEditor, IIDE } from 'fancy-react-core';

import CodeEditor from './editor';

export class CodeIDE implements IIDE {
  log(msg: string) {
    vscode.window.showInformationMessage(msg);
  }

  open(filePath: string) {
    return new Promise<IEditor>((resolve) => {
      vscode.workspace.openTextDocument(filePath).then(document => {
        return vscode.window.showTextDocument(document);
      }).then(editor => {
        resolve(new CodeEditor(editor));
      });
    });
  }

  getEditor() {
    return new CodeEditor(vscode.window.activeTextEditor as vscode.TextEditor);
  }
}
