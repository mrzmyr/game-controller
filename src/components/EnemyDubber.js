import { 
  Bodies,
  Body,
} from 'matter-js';

import Enemy from './Enemy'

import { 
  COLOR_ENEMY_DUBBER,
} from '../colors'

import { random } from '../helpers'

export default class EnemyShooter extends Enemy {
  constructor({ engine, render }, { x, y }) {
    super(...arguments);

    this.width = 40;
    this.height = 40;

    this.body = Bodies.rectangle(x, y, this.width, this.height, { 
      label: 'enemy',
      lifes: 10,
      render: {
        fillStyle: COLOR_ENEMY_DUBBER
      }
    });

    let randoms = [random(0, 5), random(0, 5), random(0, 5)]

    this.directionIndex = 0;
    this.directionPathsIndex = 0;
    this.directionPaths = [
      [
        { x: 0, y: 2 },
        { x: 0, y: 2 },
        { x: 0, y: 2 },
        { x: -2, y: 0 },
        { x: -2, y: 0 },
        { x: -2, y: 0 },
        { x: -2, y: 0 },
      ],
      [
        { x: randoms[0], y: -randoms[0] },
        { x: randoms[1], y: -randoms[1] },
        { x: randoms[2], y: -randoms[2] },
        { x: randoms[0], y: -randoms[0] },
      ]
    ];
    this.directions = 

    this.lastShot1 = +new Date();
    this.lastShot2 = +new Date();
  }

  update(players) {
    super.update();

    let focusPlayer = players[random(0, players.length - 1)];
    let timestamp = +new Date();

    // movement
    if (this.counter >= 60 * 1) {
      this.counter = 0;
      Body.setAngularVelocity(this.body, 0.02)

      let directions = this.directionPaths[this.directionPathsIndex];
      let direction = directions[this.directionIndex];
      Body.setVelocity(this.body, direction)

      this.directionIndex += 1;
      if(this.directionIndex > directions.length - 1) {
        this.directionIndex = 0;
        this.directionPathsIndex += 1;
        if(this.directionPathsIndex > this.directionPaths.length - 1) {
          this.directionPathsIndex = 0;
        }
      }
    }

    if(!focusPlayer) return;

    if(timestamp - this.lastShot2 > 500) {
      this.lastShot2 = +new Date();
      this.fireBulletToBody(focusPlayer.body, 3.5, 2000)
    }

    let intervalLShot1 = this.body.lifes * 1000 / 2;

    if(timestamp - this.lastShot1 > intervalLShot1) {
      Body.setAngularVelocity(this.body, 0.05)
      this.lastShot1 = +new Date();
      this.fireBulletStar()
      this.fireBulletRectangle()

      if(this.body.lifes < 3) {
        this.moveToBody(focusPlayer.body);
      }

      Body.scale(this.body, 2, 2)
      setTimeout(() => Body.scale(this.body, 0.5, 0.5), 200);
    }
  }

  die() {
    super.die()

    for (var i = 0; i < 100; i++) {
      this.fireBulletToDirection({ x: Math.random(), y: Math.random() })
    }
    this.engine.timing.timeScale = 0.1;
    setTimeout(() => this.engine.timing.timeScale = 1, 10000)
  }
}
