import {
  DEFAULT_PLAYER_OPTIONS_CONTENT
} from '../workspace/player-options.js';
import glass from './presets/glass.scss?raw';
import glassOptions from './presets/glass-options.js?raw';
import reel from './presets/reel.scss?raw';
import pocket from './presets/pocket.scss?raw';
import pocketOptions from './presets/pocket-options.js?raw';

/**
 * Bundled theme presets.
 */
export default [
  {
    id: 'default',
    name: 'Default',
    content: '',
    options: DEFAULT_PLAYER_OPTIONS_CONTENT
  },
  {
    id: 'glass',
    name: 'Frosted glass',
    content: glass,
    options: glassOptions
  },
  {
    id: 'reel',
    name: 'Reel',
    content: reel,
    options: DEFAULT_PLAYER_OPTIONS_CONTENT
  },
  {
    id: 'pocket',
    name: 'Pocket',
    content: pocket,
    options: pocketOptions
  }
];
