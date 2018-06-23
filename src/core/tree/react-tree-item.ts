import * as vscode from 'vscode';
import { ICachedSourceFile, IReactComponent, SourceFileCache, Project } from 'fancy-react-core';
const fs = require('fs');
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

  constructor(filePath: string, label: string, cache: SourceFileCache, project: Project) {
    super(label, vscode.TreeItemCollapsibleState.Expanded);

    this.filePath = filePath;
    this.cache = cache;
    this.project = project;
  }

  getChildren(): Promise<ReactTreeItem[]> {
    return Promise.all(this.cache.cachedFiles())
        .then(cachedFiles => {
          return (cachedFiles
            .map(this.sourceFilter.bind(this))
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
        this.project,
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
  project: Project;
  testsChild: ReactComponentTestsItem;

  constructor(filePath: string, label: string, parent: ReactTreeItem, component: IReactComponent, project: Project) {
    super(label, vscode.TreeItemCollapsibleState.Collapsed);

    this.filePath = filePath;
    this.component = component;
    this.parent = parent;
    this.project = project;

    // this.iconPath = path.join(__dirname, '..', '..', '..', 'assets', 'resistor-green-64.png');
    this.iconPath = path.join(__dirname, '..', '..', '..', 'assets', 'resistor-grey-64.png');

    this.command = {
      arguments: [filePath],
      command: 'extension.openFile',
      title: 'openFile',
      tooltip: 'clicked'
    };

    this.testsChild = new ReactComponentTestsItem(this, this.filePath,  this.project.sourceFileToTestFile(this.filePath));
  }

  getChildren(): Promise<ReactTreeItem[]> {
    return Promise.resolve(
      [this.testsChild].concat(
        this.component.props.map(prop => {
          return new ReactBasicItem(
            this.filePath,
            `${prop.name}: ${prop.type || '?'} (${prop.optional ? 'optional' : 'required'})`,
            this,
            'down-right-64.png');
          });
    )
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

export class ReactComponentTestsItem extends vscode.TreeItem implements IReactTreeItem {
  parent: ReactTreeItem;

  constructor(parent: ReactTreeItem, sourceFilePath: string, testFilePath: string) {
    const testsExist = fs.existsSync(testFilePath);
    
    super(testsExist ? 'Open tests' : 'Create tests', vscode.TreeItemCollapsibleState.None);
    this.parent = parent;

    if (testsExist) {
      this.command = {
        arguments: [testFilePath],
        command: 'extension.openFile',
        title: 'Open test file',
        tooltip: 'Open test file'
      };
    } else {
      this.command = {
        arguments: [sourceFilePath],
        command: 'extension.tests',
        title: 'Create tests',
        tooltip: 'Create tests'
      };
    }
  }
}
