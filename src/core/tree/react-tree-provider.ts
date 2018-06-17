import * as vscode from 'vscode';
import { IState, SourceFileCache } from 'fancy-react-core';
const path = require('path');

import { ReactTreeItem, ReactRootItem } from './react-tree-item';
import { TreeItem } from 'vscode';

export class ReactTreeProvider implements vscode.TreeDataProvider<ReactTreeItem> {
  rootItem: ReactRootItem;
  cache: SourceFileCache;

  constructor({ project }: IState) {
    // super();
    const srcFullPath = path.join(
      project.projectRoot,
      project.srcInsideProject
    );

    this.cache = new SourceFileCache();

    const srcGlob = srcFullPath + "/**/*.@(js|jsx|ts|tsx)";

    this.rootItem = new ReactRootItem(srcFullPath, 'Components', this.cache.getFile.bind(this.cache), srcGlob);
  }

  getChildren(element: ReactTreeItem): Promise<ReactTreeItem[]> {
    return element ? element.getChildren() : Promise.resolve([this.rootItem]);
  }

  getParent(element: ReactTreeItem): vscode.ProviderResult<ReactTreeItem> {
    return element.parent;
  }

  getTreeItem(element: ReactTreeItem): TreeItem | Thenable<TreeItem> {
    return element as TreeItem;
  }
}
