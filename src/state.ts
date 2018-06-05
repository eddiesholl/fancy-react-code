import { IState, Project } from 'fancy-react-core';

import { CodeIDE } from './core/ide';
import { loadConfigItems } from './core/project';

export class CodeState implements IState {
  ide: CodeIDE;
  project: Project;
  constructor() {
    this.ide = new CodeIDE();
    this.project = loadConfigItems(this.ide);
  }
}

export function getState() : IState {
  return new CodeState();
}
