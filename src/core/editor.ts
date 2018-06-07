import * as vscode from 'vscode';
import { IEditor, Position } from 'fancy-react-core';

export default class CodeEditor implements IEditor {
  editorInstance: vscode.TextEditor;
  constructor(editorInstance: vscode.TextEditor) {
    this.editorInstance = editorInstance;
  }
  getText() {
    return this.editorInstance.document.getText();
  }
  getCursorPosition() {
    return this.editorInstance.selection.active;
  }
  insertText(position: Position, text: string) {
    const codePosition = new vscode.Position(position.line, position.character);
    return new Promise<boolean>((resolve, reject) => {
      this.editorInstance.edit((edit: vscode.TextEditorEdit) => {
        edit.insert(codePosition, text + '\n');
      })
      .then((result: boolean) => resolve(result));
      // .catch((error) => reject(false));
    });
  }
  setText(text: string) {
    const lineCount = this.editorInstance.document.lineCount;
    const lastLine = this.editorInstance.document.lineAt(lineCount - 1);
    this.editorInstance.edit((edit: vscode.TextEditorEdit) => {
      const range = new vscode.Range(
        new vscode.Position(0, 0),
        new vscode.Position(lineCount, lastLine.range.end.character)
      );
      edit.replace(range, text);
    });
  }
}
