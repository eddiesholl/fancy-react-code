import * as vscode from 'vscode';
import { IState, SourceFileCache } from 'fancy-react-core';
const path = require('path');

import { ReactTreeItem, ReactRootItem, ReactComponentRootItem, ReactBasicRootItem } from './react-tree-item';
import { TreeItem } from 'vscode';

export class ReactTreeProvider implements vscode.TreeDataProvider<ReactTreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<ReactTreeItem | undefined> = new vscode.EventEmitter<ReactTreeItem | undefined>();
	readonly onDidChangeTreeData: vscode.Event<ReactTreeItem | undefined> = this._onDidChangeTreeData.event;
  
  componentRoot: ReactRootItem;
  nonComponentRoot: ReactRootItem;
  cache: SourceFileCache;
  fsw: vscode.FileSystemWatcher;

  constructor({ project }: IState) {
    // super();
    const srcFullPath = path.join(
      project.projectRoot,
      project.srcInsideProject
    );

    this.cache = new SourceFileCache();

    const srcGlob = srcFullPath + "/**/*.{js,jsx,ts,tsx}";

    this.componentRoot = new ReactComponentRootItem(
      srcFullPath,
      'Components',
      this.cache.getFile.bind(this.cache),
      srcGlob
    );

    this.nonComponentRoot = new ReactBasicRootItem(
      srcFullPath,
      'Non-Components',
      this.cache.getFile.bind(this.cache),
      srcGlob
    );

    this.fsw = vscode.workspace.createFileSystemWatcher(srcGlob);
    this.fsw.onDidChange(e => {
      this.cache.clear(e.fsPath);
      this.refresh();
      // console.log(JSON.stringify(e));
    });

    this.fsw.onDidCreate(e => {
      this.refresh();
    });
    this.fsw.onDidDelete(e => {
      this.cache.clear(e.fsPath);
      this.refresh();
    });
  }

  refresh(): void {
		this._onDidChangeTreeData.fire();
	}

  getChildren(element: ReactTreeItem): Promise<ReactTreeItem[]> {
    return element ? element.getChildren() : Promise.resolve([this.componentRoot, this.nonComponentRoot]);
  }

  getParent(element: ReactTreeItem): vscode.ProviderResult<ReactTreeItem> {
    return element.parent;
  }

  getTreeItem(element: ReactTreeItem): TreeItem | Thenable<TreeItem> {
    return element as TreeItem;
  }
}
