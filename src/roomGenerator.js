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

  let heartsvg = await fetch(heart).then(r => r.text());
  let pillsvg = await fetch(pill).then(r => r.text());

  return {
    0: {
      enemies: [
        new EnemyDubber({ engine, render }, { x: 100, y: 100 }),
      ],
      items: [
        new Item({ engine, render }, { type: 'fatpill', svg: pillsvg, x: random(50, width - 50), y: random(50, height - 50)}),
      ],
      doors: [
        new Door({ engine, render }, { targetRoom: 1, type: 'left' }),
      ]
    },
    1: {
      enemies: [
        new EnemyShooter({ engine, render }, { x: random(50, width - 50), y: random(50, height - 50)}),
        new EnemyShooter({ engine, render }, { x: random(50, width - 50), y: random(50, height - 50)}),
        new EnemyStation({ engine, render }, {x: 100, y: 100}),
        new EnemyStation({ engine, render }, {x: width - 100, y: 100}),
        new EnemyStation({ engine, render }, {x: 100, y: height - 100}),
        new EnemyStation({ engine, render }, {x: width - 100, y: height - 100}),
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
        new EnemyShooter({ engine, render }, { x: random(50, width - 50), y: random(50, height - 50)}),
        new EnemyShooter({ engine, render }, { x: random(50, width - 50), y: random(50, height - 50)}),
        new EnemyShooter({ engine, render }, { x: random(50, width - 50), y: random(50, height - 50)}),
      ],
      items: [
        new Item({ engine, render }, { type: 'fatpill', svg: pillsvg, x: random(50, width - 50), y: random(50, height - 50)}),
        new Item({ engine, render }, { type: 'life', svg: heartsvg, x: random(50, width - 50), y: random(50, height - 50)}),
        new Item({ engine, render }, { type: 'life', svg: heartsvg, x: random(50, width - 50), y: random(50, height - 50)}),
      ],
      doors: [
        new Door({ engine, render }, { targetRoom: 1, type: 'top' }),
      ]
    },
    3: {
      enemies: [
        new EnemyShooter({ engine, render }, { x: random(50, width - 50), y: random(50, height - 50)}),
        new EnemyShooter({ engine, render }, { x: random(50, width - 50), y: random(50, height - 50)}),
        new EnemyShooter({ engine, render }, { x: random(50, width - 50), y: random(50, height - 50)}),
      ],
      items: [
        new Item({ engine, render }, { type: 'life', svg: heartsvg, x: random(50, width - 50), y: random(50, height - 50)}),
        new Item({ engine, render }, { type: 'life', svg: heartsvg, x: random(50, width - 50), y: random(50, height - 50)}),
      ],
      doors: [
        new Door({ engine, render }, { targetRoom: 1, type: 'right' }),
      ]
    },
  }
};