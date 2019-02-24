import { 
  World,
  Bodies,
  Composite,
  Body
} from 'matter-js';

import { 
  COLOR_PLAYER,
  COLOR_PLAYER_ULTIMATE_BODY,
  COLOR_PLAYER_ULTIMATE_BULLET,
  COLOR_PLAYER_FATPILL,
} from '../colors'

import { Howl } from 'howler';

var sound_fire = new Howl({ src: ['./sounds/bow.wav'] });

export default class Player {
  constructor({ engine }, { x, y }) {
  
    this.state = {};
    this.engine = engine;

    this.radius = 20;
    this.color = COLOR_PLAYER;

    this.body = Bodies.circle(x, y, this.radius, { 
      label: 'player', 
      render: { fillStyle: this.color },
      lifes: 3
    });

    this.effects = {
      ultimate: false
    }

    this.ts = {
       shot: +new Date(),
       ultimate: +new Date()
    }
    this.ulti = false;
  }

  moveToDirection(direction, speed = 2) {
    speed = this.effects.fatpill ? 4 : speed;

    Body.setVelocity(this.body, {
      x: direction.x * speed,
      y: direction.y * speed,
    })
  }

  activateEffect(params) {
    let timestamp = +new Date();

    if(params.id === 'bigshot') {
      this.effects[params.id] = true;
      this.ts[params.id] = +new Date();
    }

    if(params.id === 'ultimate' && timestamp - this.ts[params.id] > 10000) {
      this.recentColor = this.body.render.fillStyle;
      this.body.render.fillStyle = COLOR_PLAYER_ULTIMATE_BODY;
      Body.scale(this.body, 0.5, 0.5)
      this.effects[params.id] = true;
      this.ts[params.id] = +new Date();
      setTimeout(() => this.deactivateEffect(params), 1000)
    }
    if(params.id === 'fatpill') {
      this.recentColor = this.body.render.fillStyle;
      this.body.render.fillStyle = COLOR_PLAYER_FATPILL;
      this.effects[params.id] = true;
      this.ts[params.id] = +new Date();
      // setTimeout(() => this.deactivateEffect(params), 30000)
    }
  }

  deactivateEffect(params) {
    this.effects[params.id] = false;

    if(params.id === 'ultimate') {
      this.body.render.fillStyle = this.color;
      Body.scale(this.body, 2, 2)
    }
    if(params.id === 'fatpill') {
      this.body.render.fillStyle = this.color;
    }
  }

  deactivateEffects() {
    console.log(Object.keys(this.effects).filter(k => !!this.effects[k]))
    Object.keys(this.effects)
      .filter(k => !!this.effects[k])
      .forEach(k => this.deactivateEffect({ id: k }))
  }

  fireBulletToDirection(direction, speed = 3.5) {
    let bulletRadius = this.effects.bigshot ? 10 : 5;
    let margin = this.radius + bulletRadius;
    let bullet = Bodies.circle(
      this.body.position.x + (margin * direction.x), 
      this.body.position.y + (margin * direction.y), 
      bulletRadius, 
      {
        label: 'bullet-player',
        static: true
      }
    );
    bullet.frictionAir = 0;

    if(this.effects.ultimate) bullet.render.fillStyle = COLOR_PLAYER_ULTIMATE_BULLET;

    Body.setVelocity(bullet, { x: direction.x * speed, y: direction.y * speed });
    World.add(this.engine.world, [bullet]);
    setTimeout(() => Composite.remove(this.engine.world, bullet), 2000)
  }

  fire(direction) {
    let timestamp = +new Date();
    let fireSpeed = (this.effects.ultimate ? 10 : 300);

    if((timestamp - this.ts.shot) > fireSpeed) {
      sound_fire.play();
      this.fireBulletToDirection(direction)
      this.ts.shot = +new Date();
    }
  }

  update() {
  }

  addToWorld() {
    World.add(this.engine.world, [this.body]);    
  }

  removeFromWorld() {
    Composite.remove(this.engine.world, this.body);
  }
}
