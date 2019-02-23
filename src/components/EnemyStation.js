import { 
  Bodies,
} from 'matter-js';

import Enemy from './Enemy'

import { 
  COLOR_ENEMY_STATION,
} from '../colors'

import { random } from '../helpers'

export default class EnemyStation extends Enemy {
  constructor({ engine }, { x, y }) {
    super(...arguments);

    this.state = {};
    this.engine = engine;

    this.radius = 10;

    this.body = Bodies.circle(x, y, this.radius, { 
      label: 'enemy',
      lifes: 1,
      isStatic: true,
      render: {
        fillStyle: COLOR_ENEMY_STATION
      }
    });

    this.lastShot = +new Date();
  }

  update(players) {
    let timestamp = +new Date();

    if(timestamp - this.lastShot > 1000) {
      this.lastShot = +new Date();
      this.fireBulletToDirection({ x: random(-1,1), y: 1 })
      this.fireBulletToDirection({ x: random(-1,1), y: -1 })
    }
  }
}
