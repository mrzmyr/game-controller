import { 
  Bodies,
  Common
} from 'matter-js';

import Enemy from './Enemy'

import { 
  COLOR_ENEMY_SHOOTER,
} from '../colors'

export default class EnemyShooter extends Enemy {
  constructor({ engine }, { x, y }) {
    super(...arguments);

    this.state = {};
    this.engine = engine;

    this.radius = 15;

    this.body = Bodies.circle(x, y, this.radius, { 
      label: 'enemy',
      lifes: 5,
      render: {
        fillStyle: COLOR_ENEMY_SHOOTER
      }
    });

    this.lastMove = +new Date();
    this.lastShot = +new Date();
  }

  update(players) {
    let focusPlayer = players[Common.choose(Object.keys(players))];
    let timestamp = +new Date();

    if(!focusPlayer) return;

    if(timestamp - this.lastShot > 2000) {
      this.lastShot = +new Date();
      this.fireBulletToBody(focusPlayer.body)
    }

    if(timestamp - this.lastMove > 5000) {
      this.lastMove = +new Date();
      if(Math.random() < 0.3) {
        this.moveToBody(focusPlayer.body);
      } else {
        this.moveToDirection({ x: Math.random(), y: Math.random() });
      }
    }
  }
}
