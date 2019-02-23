import { 
  World,
  Bodies,
} from 'matter-js';

import { 
  COLOR_DOORS,
  COLOR_DOORS_UNLOCKED,
} from '../colors'

export default class Door {
  constructor({ engine, render }, { type, targetRoom }) {
  
    this.state = {};
    this.engine = engine;

    let { x, y, width, height } = {
      right: {x: render.options.width, y: render.options.height / 2, width: 50, height: 100 },
      left: {x: 0, y: render.options.height / 2, width: 50, height: 100 },
      top: { x: render.options.width / 2, y: 0, width: 100, height: 50 },
      bottom: { x: render.options.width / 2, y: render.options.height, width: 100, height: 50 }
    }[type];

    this.body = Bodies.rectangle(x, y, width, height, { 
      isStatic: true, 
      label: 'door',
      doorType: type,
      targetRoom: targetRoom,
      render: { fillStyle: COLOR_DOORS },
      locked: true
    });
  }

  unlock() {
    this.body.render.fillStyle = COLOR_DOORS_UNLOCKED;
    this.body.locked = false;
  }

  update() {
  }

  addToWorld() {
    // console.log(this.body)
    World.add(this.engine.world, [this.body]);
  }
}
