import * as vscode from 'vscode';
import { ICachedSourceFile } from 'fancy-react-core';
const glob = require('glob');

export interface IReactTreeItem extends vscode.TreeItem {
  getChildren(): Promise<IReactTreeItem[]>;
  parent?: IReactTreeItem;
}

export type ReactTreeItem = ReactRootItem | ReactComponentItem;

type FileLoader = (filePath: string) => Promise<ICachedSourceFile>;

export class ReactRootItem extends vscode.TreeItem implements IReactTreeItem {
  parent: undefined;
  private components: Promise<ReactComponentItem[]> | undefined;
  filePath: string;
  fileGlob: string;
  fileLoader: FileLoader;

  constructor(filePath: string, label: string, fileLoader: FileLoader, fileGlob: string) {
    super(label, vscode.TreeItemCollapsibleState.Expanded);

    this.filePath = filePath;
    this.fileGlob = fileGlob;
    this.fileLoader = fileLoader;
  }

  getChildren(): Promise<ReactTreeItem[]> {
    if (this.components === undefined) {
      return new Promise((resolve, reject) => {
        glob(this.fileGlob, {}, (err: any, files: string[]) => {
          if (err) {
            reject(err);
          } else {
            const itemsForFiles = files.map((sourceFilePath) => {
              return this.fileLoader(sourceFilePath).then((content) => {
                if (content.component !== undefined) {
                  return new ReactComponentItem(
                    sourceFilePath,
                    content.fileName,
                    this,
                  );
                }
              });
            });
            Promise.all(itemsForFiles).then((components) => {
              resolve(components.filter(item => item !== undefined) as ReactComponentItem[]);
            });
          }
        });
      });
    } else {
      return this.components;
    }
  }
}


export class ReactComponentItem extends vscode.TreeItem implements IReactTreeItem {
  children: ReactTreeItem[];
  parent: ReactTreeItem | undefined;
  filePath: string;

  constructor(filePath: string, label: string, parent?: ReactTreeItem, children: ReactTreeItem[] = []) {
    super(label, vscode.TreeItemCollapsibleState.None);

    this.filePath = filePath;
    this.children = children;
    this.parent = parent;
  }

  getChildren(): Promise<ReactTreeItem[]> {
    return Promise.resolve([]);
  }
}
