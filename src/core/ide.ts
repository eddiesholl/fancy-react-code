import * as vscode from 'vscode';
import { IEditor, IIDE } from 'fancy-react-core';

import CodeEditor from './editor';

export class CodeIDE implements IIDE {
  log(msg: string) {
    vscode.window.showInformationMessage(msg);
  }

  open(filePath: string) {
    return new Promise<IEditor>((resolve, reject) => {
      vscode.workspace.openTextDocument(filePath).then(document => {
        return vscode.window.showTextDocument(document);
      }, reject).then(editor => {
        resolve(new CodeEditor(editor));
      });
    });
  }

  getEditor() {
    return new CodeEditor(vscode.window.activeTextEditor as vscode.TextEditor);
  }

  getSetting(settingName: string) {
    const extensionConfig = vscode.workspace.getConfiguration('fancyReact');

    return extensionConfig.get<string>(settingName);
  }

  getPkgJson() {
    const projectRoot = this.getProjectRoot();

    let pkgJson = {
      fancyReact: undefined
    };

    try {
      pkgJson = require(`${projectRoot}/package.json`);
    } catch (e) {
      this.log(`Could not load package.json from project folder '${projectRoot}'`);
    }

    return pkgJson;
  }

  getProjectRoot() {
    const pathFromProject = vscode.workspace.workspaceFolders!.shift();

    if (pathFromProject === undefined) {
      throw new Error('Could not find the current project root');
    } else {
      /*const editor = atom.workspace.getActivePaneItem()
      const pathFromEditor = editor ? pathEnv.getProjectRoot(editor.getPath()) : ''*/
      return pathFromProject.uri.fsPath; //|| pathFromEditor
    }
  }
}
