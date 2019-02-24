import EnemyShooter from './components/EnemyShooter'
import EnemyStation from './components/EnemyStation'
import EnemyDubber from './components/EnemyDubber'
import Item from './components/Item'
import Door from './components/Door'

import { random } from './helpers'
import heart from './svgs/heart.svg';
import pill from './svgs/pill.svg';

// import { safeLoad } from 'js-yaml';
// import { readFileSync } from 'fs';
 
export async function generateRooms ({ engine, render, width, height }) {

  return {
    0: {
      enemies: [
      ],
      items: [
        new Item({ engine, render }, { type: 'fatpill', x: random(100, width - 100), y: random(100, height - 100)}),
        new Item({ engine, render }, { type: 'life', x: random(100, width - 100), y: random(100, height - 100)}),
      ],
      doors: [
        new Door({ engine, render }, { targetRoom: 1, type: 'left' }),
      ]
    },
    1: {
      enemies: [
        new EnemyStation({ engine, render }, {x: width - 100, y: 100}),
        new EnemyStation({ engine, render }, { x: random(100, width - 100), y: random(100, height - 100)}),
        new EnemyStation({ engine, render }, { x: random(100, width - 100), y: random(100, height - 100)}),
      ],
      items: [
      ],
      doors: [
        new Door({ engine, render }, { targetRoom: 0, type: 'right' }),
        new Door({ engine, render }, { targetRoom: 2, type: 'bottom' }),
        new Door({ engine, render }, { targetRoom: 3, type: 'left' }),
      ]
    },
    2: {
      enemies: [
        new EnemyDubber({ engine, render }, { x: width - 100, y: height - 100 }),
        new EnemyShooter({ engine, render }, { x: random(100, width - 100), y: random(100, height - 100)}),
      ],
      items: [
        new Item({ engine, render }, { type: 'fatpill', x: random(100, width - 100), y: random(100, height - 100)}),
        new Item({ engine, render }, { type: 'life', x: random(100, width - 100), y: random(100, height - 100)}),
        new Item({ engine, render }, { type: 'life', x: random(100, width - 100), y: random(100, height - 100)}),
      ],
      doors: [
        new Door({ engine, render }, { targetRoom: 1, type: 'top' }),
      ]
    },
    3: {
      enemies: [
        new EnemyStation({ engine, render }, {x: 100, y: 100}),
        new EnemyShooter({ engine, render }, { x: random(100, width - 100), y: random(100, height - 100)}),
        new EnemyShooter({ engine, render }, { x: random(100, width - 100), y: random(100, height - 100)}),
        new EnemyShooter({ engine, render }, { x: random(100, width - 100), y: random(100, height - 100)}),
        new EnemyStation({ engine, render }, {x: width - 100, y: height - 100}),
      ],
      items: [
        new Item({ engine, render }, { type: 'bigshot', x: random(100, width - 100), y: random(100, height - 100)}),
        new Item({ engine, render }, { type: 'life', x: random(100, width - 100), y: random(100, height - 100)}),
      ],
      doors: [
        new Door({ engine, render }, { targetRoom: 1, type: 'right' }),
      ]
    },
  }
};