export interface State {
  ide: IDE;
}

import { CodeIDE } from './core/ide';

export class CodeState implements State {
  ide: CodeIDE;
  constructor() {
    this.ide = new CodeIDE();
  }
}

export function getState() : State {
  return new CodeState();
}
