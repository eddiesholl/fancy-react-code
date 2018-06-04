'use strict';

import { generate as generateCore, IState } from 'fancy-react-core';

export function generate(state: IState) {
  state.ide.log('Running generate');

  return generateCore(state);
}
