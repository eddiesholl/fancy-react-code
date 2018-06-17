import * as vscode from 'vscode';

export class ReactTreeItem extends vscode.TreeItem {
  children: ReactTreeItem[];
  parent: ReactTreeItem | undefined;
  filePath: string;

  constructor(filePath: string, label: string, parent?: ReactTreeItem, children: ReactTreeItem[] = []) {
    super(label, vscode.TreeItemCollapsibleState.Collapsed);

    this.filePath = filePath;
    this.children = children;
    this.parent = parent;
  }

  addChildren(newChildren: ReactTreeItem[]) {
    this.children = this.children.concat(newChildren);
  }
}
