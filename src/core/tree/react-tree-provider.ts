import * as vscode from 'vscode';
import { IState, SourceFileCache } from 'fancy-react-core';
const path = require('path');

import { ReactTreeItem, ReactRootItem, ReactComponentRootItem, ReactBasicRootItem } from './react-tree-item';
import { TreeItem } from 'vscode';

export class ReactTreeProvider implements vscode.TreeDataProvider<ReactTreeItem> {
  componentRoot: ReactRootItem;
  nonComponentRoot: ReactRootItem;
  cache: SourceFileCache;

  constructor({ project }: IState) {
    // super();
    const srcFullPath = path.join(
      project.projectRoot,
      project.srcInsideProject
    );

    this.cache = new SourceFileCache();

    const srcGlob = srcFullPath + "/**/*.@(js|jsx|ts|tsx)";

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
