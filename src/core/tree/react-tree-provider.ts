import * as vscode from 'vscode';
import { IState, SourceFileCache, Project } from 'fancy-react-core';
const path = require('path');
const glob = require('glob');
import { TreeItem } from 'vscode';

import { ReactTreeItem, ReactComponentRootItem, ReactBasicRootItem } from './react-tree-item';

const extensionGlob = "/**/*.{js,jsx,ts,tsx}";

export const getTreeProvider = ({ project }: IState): Promise<ReactTreeProvider> => {
  const fullPathToSrc = path.join(
    project.projectRoot,
    project.srcInsideProject
  );
  const srcGlob = fullPathToSrc + extensionGlob;

  const fsw = vscode.workspace.createFileSystemWatcher(project.projectRoot + extensionGlob);

  const globPromise = new Promise<SourceFileCache>((resolve, reject) => {
    const result = new SourceFileCache();

    glob(srcGlob, {}, (err: any, files: string[]) => {
      if (err) {
        reject(result);
      } else {
        files.map(result.getFile.bind(result));
        resolve(result);
      }
    });
  });

  return globPromise.then(cache => {
    return new ReactTreeProvider(project, cache, fsw, fullPathToSrc);
  });
};

export class ReactTreeProvider implements vscode.TreeDataProvider<ReactTreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<ReactTreeItem | undefined> = new vscode.EventEmitter<ReactTreeItem | undefined>();
	readonly onDidChangeTreeData: vscode.Event<ReactTreeItem | undefined> = this._onDidChangeTreeData.event;
  
  project: Project;
  cache: SourceFileCache;
  fsw: vscode.FileSystemWatcher;
  fullPathToSrc: string;

  constructor(project: Project, cache: SourceFileCache, fsw: vscode.FileSystemWatcher, fullPathToSrc: string) {
    this.project = project;
    this.fsw = fsw;
    this.cache = cache;
    this.fullPathToSrc = fullPathToSrc;

    this.fsw.onDidChange(e => {
      this.cache.refresh(e.fsPath);
      this.refresh();
    });

    this.fsw.onDidCreate((e) => {
      this.cache.getFile(e.fsPath);
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
    return element ?
      element.getChildren() :
      Promise.resolve([
          new ReactComponentRootItem(
            this.fullPathToSrc,
            'Components',
            this.cache,
            this.project,
          ),
          new ReactBasicRootItem(
            this.fullPathToSrc,
            'Non-Components',
            this.cache,
            this.project,
          )]);
  }

  getParent(element: ReactTreeItem): vscode.ProviderResult<ReactTreeItem> {
    return element.parent;
  }

  getTreeItem(element: ReactTreeItem): TreeItem | Thenable<TreeItem> {
    return element as TreeItem;
  }
}
