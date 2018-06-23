import * as vscode from 'vscode';
import { ICachedSourceFile, IReactComponent, SourceFileCache } from 'fancy-react-core';
const path = require('path');

export interface IReactTreeItem extends vscode.TreeItem {
  getChildren(): Promise<IReactTreeItem[]>;
  parent?: IReactTreeItem;
}

export type ReactTreeItem = ReactRootItem | ReactComponentItem | ReactBasicItem;

const sortTreeItems = (a: ReactTreeItem, b: ReactTreeItem) => {
  const aLabel = a.label || '';
  const bLabel = b.label || '';

  return aLabel.localeCompare(bLabel);
};

export class ReactRootItem extends vscode.TreeItem implements IReactTreeItem {
  parent: undefined;
  filePath: string;
  cache: SourceFileCache;

  constructor(filePath: string, label: string, cache: SourceFileCache) {
    super(label, vscode.TreeItemCollapsibleState.Collapsed);

    this.filePath = filePath;
    this.cache = cache;
  }

  getChildren(): Promise<ReactTreeItem[]> {
    return Promise.all(this.cache.cachedFiles())
        .then(cachedFiles => {
          return (cachedFiles
            .map(this.sourceFilter)
            .filter(item => item !== undefined) as ReactTreeItem[])
            .sort(sortTreeItems);
        })
        .catch((e) => {
          console.log('Failed to parse files: ' + e);
          return [];
        });
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
        content.component,
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
  component: IReactComponent;
  parent: ReactTreeItem | undefined;
  filePath: string;
  iconPath: string;

  constructor(filePath: string, label: string, parent: ReactTreeItem, component: IReactComponent) {
    super(label, vscode.TreeItemCollapsibleState.Collapsed);

    this.filePath = filePath;
    this.component = component;
    this.parent = parent;

    // this.iconPath = path.join(__dirname, '..', '..', '..', 'assets', 'resistor-green-64.png');
    this.iconPath = path.join(__dirname, '..', '..', '..', 'assets', 'resistor-grey-64.png');

    this.command = {
      arguments: [filePath],
      command: 'extension.openFile',
      title: 'openFile',
      tooltip: 'clicked'
    };
  }

  getChildren(): Promise<ReactTreeItem[]> {
    return Promise.resolve(
      this.component.props.map(prop => {
        return new ReactBasicItem(
          this.filePath,
          `${prop.name}: ${prop.type || '?'} (${prop.optional ? 'optional' : 'required'})`,
          this,
          'down-right-64.png');
      })
    );
  }
}

export class ReactBasicItem extends vscode.TreeItem implements IReactTreeItem {
  parent: ReactTreeItem | undefined;
  filePath: string;

  constructor(filePath: string, label: string, parent?: ReactTreeItem, iconName: string = 'circuit-48.png') {
    super(label, vscode.TreeItemCollapsibleState.None);

    this.filePath = filePath;
    this.parent = parent;

    this.iconPath = path.join(__dirname, '..', '..', '..', 'assets', iconName);
  }

  getChildren(): Promise<ReactTreeItem[]> {
    return Promise.resolve([]);
  }
}
