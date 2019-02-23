import { 
  World,
  Bodies,
  Composite,
  Body
} from 'matter-js';

export default class Enemy {
  constructor({ engine, render }, { onDeath }) {
    this.engine = engine;
    this.render = render;

    this.counter = 0;
    this.dead = false;

    this.onDeath = onDeath;
  }

  fireBulletToBody(to, speed = 3.5, timeout = 1000) {
    this.fireBulletToPosition(to.position, speed, timeout)
  }

  fireBulletToPosition(position, speed = 3.5, timeout = 1000) {
    if(isNaN(position.x) || isNaN(position.y)) {
      throw new Error('position coordinates missing')
    }

    let dx = position.x - this.body.position.x;
    let dy = position.y - this.body.position.y;
    let distance = Math.sqrt(dx ** 2 + dy ** 2)

    let bulletRadius = 5;
    let margin = (this.radius || this.width) + bulletRadius + 20;

    let _from = { 
      x: this.body.position.x + margin * (dx / distance),
      y: this.body.position.y + margin * (dy / distance)
    }

    // console.log('fireBulletToBody', 'to', position, 'speed', speed, 'from', _from)

    let bullet = Bodies.circle(_from.x, _from.y, bulletRadius, { label: 'bullet-enemy' })

    bullet.frictionAir = 0;
    Body.setVelocity(bullet, { x: dx / distance * speed, y: dy / distance * speed });
    World.add(this.engine.world, [bullet]);
    setTimeout(() => Composite.remove(this.engine.world, bullet), timeout)
  }

  fireBulletToDirection(direction, speed = 3.5, timeout = 1000) {
    if(isNaN(direction.x) || isNaN(direction.y)) {
      throw new Error('position coordinates missing')
    }

    let bulletRadius = 3;
    let margin = (this.radius || this.width) + bulletRadius + 20;

    let _from = { 
      x: this.body.position.x + (margin * direction.x),
      y: this.body.position.y + (margin * direction.y)
    }

    // console.log('fireBulletToDirection', 'to', direction, 'speed', speed, 'from', _from)

    let bullet = Bodies.circle(_from.x, _from.y, bulletRadius, {
      label: 'bullet-enemy',
      static: true
    });
    bullet.frictionAir = 0;

    World.add(this.engine.world, [bullet]);
    Body.setVelocity(bullet, { x: direction.x * speed, y: direction.y * speed });
    setTimeout(() => Composite.remove(this.engine.world, bullet), timeout)
  }

  fireBulletRectangle() {
    this.fireBulletToDirection({ x: -1, y: 0 }, 5)
    this.fireBulletToDirection({ x: 1, y: 0 }, 5)
    this.fireBulletToDirection({ x: 0, y: -1 }, 5)
    this.fireBulletToDirection({ x: 0, y: 1 }, 5)
  }

  fireBulletStar() {
    this.fireBulletToDirection({ x: -1, y: 0 }, 5)
    this.fireBulletToDirection({ x: 1, y: 0 }, 5)
    this.fireBulletToDirection({ x: 0, y: -1 }, 5)
    this.fireBulletToDirection({ x: 0, y: 1 }, 5)
  }

  moveToBody(player, speed = 1) {
    let dx = player.position.x - this.body.position.x;
    let dy = player.position.y - this.body.position.y;
    let distance = Math.sqrt(dx ** 2 + dy ** 2)

    Body.setVelocity(this.body, { x: dx / distance * speed, y: dy / distance * speed })
  }

  moveToDirection(direction, speed = 1) {
    Body.setVelocity(this.body, { x: direction.x, y: direction.y })
  }

  update(players) {
    this.counter += 1;
  }

  die() {
    this.dead = true;
    Composite.remove(this.engine.world, this.body)
  }

  addToWorld() {
    World.add(this.engine.world, [this.body]);    
  }
}
