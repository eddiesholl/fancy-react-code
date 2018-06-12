import { FileSystem, FancyReactSettings, Formatter, getSettings, getProject, IFileSystem, IState, Project } from 'fancy-react-core';

import { CodeIDE } from './core/ide';

export class CodeState implements IState {
  ide: CodeIDE;
  project: Project;
  settings: FancyReactSettings;
  fileSystem: IFileSystem;
  formatter: Formatter;

  constructor() {
    this.ide = new CodeIDE();
    this.settings = getSettings(this.ide);
    this.project = getProject(this.settings);
    this.fileSystem = new FileSystem();
    this.formatter = new Formatter(this.project, this.ide);
  }
}

export function getState() : IState {
  return new CodeState();
}
