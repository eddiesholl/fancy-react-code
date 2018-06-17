import * as vscode from 'vscode';
import { ICachedSourceFile } from 'fancy-react-core';
const glob = require('glob');
const path = require('path');

export interface IReactTreeItem extends vscode.TreeItem {
  getChildren(): Promise<IReactTreeItem[]>;
  parent?: IReactTreeItem;
}

export type ReactTreeItem = ReactRootItem | ReactComponentItem | ReactBasicItem;

type FileLoader = (filePath: string) => Promise<ICachedSourceFile>;
// type SourceFilter = (sourceFile: ICachedSourceFile) => ReactTreeItem | undefined;

export class ReactRootItem extends vscode.TreeItem implements IReactTreeItem {
  parent: undefined;
  private childNodes: Promise<ReactTreeItem[]> | undefined;
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
    if (this.childNodes === undefined) {
      return new Promise((resolve, reject) => {
        glob(this.fileGlob, {}, (err: any, files: string[]) => {
          if (err) {
            reject(err);
          } else {
            const itemsForFiles = files.map((sourceFilePath) => {
              return this.fileLoader(sourceFilePath).then(this.sourceFilter);
            });
            Promise.all(itemsForFiles).then((components) => {
              resolve(components.filter(item => item !== undefined) as ReactTreeItem[]);
            });
          }
        });
      });
    } else {
      return this.childNodes;
    }
  }

  sourceFilter(content: ICachedSourceFile): ReactTreeItem | undefined {
    return new ReactBasicItem(
      content.filePath,
      content.fileName,
      this,
    );
  }
}

export class ReactComponentRootItem extends ReactRootItem {
  sourceFilter(content: ICachedSourceFile): ReactTreeItem | undefined {
    if (content.component !== undefined) {
      return new ReactComponentItem(
        content.filePath,
        content.component.componentName,
        this,
      );
    }
  }
}

export class ReactBasicRootItem extends ReactRootItem {
  sourceFilter(content: ICachedSourceFile): ReactTreeItem | undefined {
    if (content.component === undefined) {
      return new ReactBasicItem(
        content.filePath,
        content.fileName,
        this,
      );
    }
  }
}

export class ReactComponentItem extends vscode.TreeItem implements IReactTreeItem {
  children: ReactTreeItem[];
  parent: ReactTreeItem | undefined;
  filePath: string;
  iconPath: string;

  constructor(filePath: string, label: string, parent?: ReactTreeItem, children: ReactTreeItem[] = []) {
    super(label, vscode.TreeItemCollapsibleState.None);

    this.filePath = filePath;
    this.children = children;
    this.parent = parent;

    this.iconPath = path.join(process.cwd(), 'doc', 'F-R.png');
  }

  getChildren(): Promise<ReactTreeItem[]> {
    return Promise.resolve([]);
  }
}

export class ReactBasicItem extends vscode.TreeItem implements IReactTreeItem {
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
