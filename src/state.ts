import { IState } from 'fancy-react-core';

import { CodeIDE } from './core/ide';

export class CodeState implements IState {
  ide: CodeIDE;
  constructor() {
    this.ide = new CodeIDE();
  }
}

export function getState() : IState {
  return new CodeState();
}
