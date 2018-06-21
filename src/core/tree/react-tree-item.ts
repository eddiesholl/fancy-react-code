import * as vscode from 'vscode';
import { ICachedSourceFile, IReactComponent } from 'fancy-react-core';
const glob = require('glob');
const path = require('path');

export interface IReactTreeItem extends vscode.TreeItem {
  getChildren(): Promise<IReactTreeItem[]>;
  parent?: IReactTreeItem;
}

export type ReactTreeItem = ReactRootItem | ReactComponentItem | ReactBasicItem;

type FileLoader = (filePath: string) => Promise<ICachedSourceFile>;
// type SourceFilter = (sourceFile: ICachedSourceFile) => ReactTreeItem | undefined;

const sortTreeItems = (a: ReactTreeItem, b: ReactTreeItem) => {
  const aLabel = a.label || '';
  const bLabel = b.label || '';

  return aLabel.localeCompare(bLabel);
};

export class ReactRootItem extends vscode.TreeItem implements IReactTreeItem {
  parent: undefined;
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
    return new Promise((resolve, reject) => {
      glob(this.fileGlob, {}, (err: any, files: string[]) => {
        if (err) {
          reject(err);
        } else {
          const itemsForFiles = files.map((sourceFilePath) => {
            return this.fileLoader(sourceFilePath).then(this.sourceFilter);
          });
          Promise.all(itemsForFiles).then((components) => {
            resolve(
              (components.filter(item => item !== undefined) as ReactTreeItem[])
                .sort(sortTreeItems));
          })
          .catch((e) => {
            console.log('Failed to parse files: ' + e);
          });
        }
      });
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
