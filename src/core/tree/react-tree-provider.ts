import * as vscode from 'vscode';
import { IState } from 'fancy-react-core';
const glob = require('glob');
const path = require('path');

import { ReactTreeItem } from './react-tree-item';
import { TreeItem } from 'vscode';

export class ReactTreeProvider implements vscode.TreeDataProvider<ReactTreeItem> {
  rootItem: ReactTreeItem;

  constructor({ project }: IState) {
    // super();
    const srcFullPath = path.join(
      project.projectRoot,
      project.srcInsideProject
    );

    const srcGlob = srcFullPath + "/**/*.@(js|jsx|ts|tsx)";

    this.rootItem = new ReactTreeItem(srcFullPath, 'Components');

    // options is optional
    glob(srcGlob, {}, (err: any, files: string[]) => {
      if (!err) {
        const itemsForFiles = files.map((filePath) => {
          return new ReactTreeItem(
            filePath,
            path.basename(filePath),
            this.rootItem
          );
        });
        
        this.rootItem.addChildren(itemsForFiles);
      }
      // files is an array of filenames.
      // If the `nonull` option is set, and nothing
      // was found, then files is ["**/*.js"]
      // er is an error object or null.
    });
  }

  getChildren(element: ReactTreeItem): vscode.ProviderResult<ReactTreeItem[]> {
    return element ? element.children : [this.rootItem];
  }

  getParent(element: ReactTreeItem): vscode.ProviderResult<ReactTreeItem> {
    return element.parent;
  }

  getTreeItem(element: ReactTreeItem): TreeItem | Thenable<TreeItem> {
    return element as TreeItem;
  }
}
