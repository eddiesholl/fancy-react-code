import { FileSystem, IFileSystem, IState, Project } from 'fancy-react-core';

import { CodeIDE } from './core/ide';
import { loadConfigItems } from './core/project';

export class CodeState implements IState {
  ide: CodeIDE;
  project: Project;
  fileSystem: IFileSystem;

  constructor() {
    this.ide = new CodeIDE();
    this.project = loadConfigItems(this.ide);
    this.fileSystem = new FileSystem();
  }
}

export function getState() : IState {
  return new CodeState();
}
