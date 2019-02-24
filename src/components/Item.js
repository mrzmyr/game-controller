import { 
  World,
  Bodies,
  Vertices,
  Svg
} from 'matter-js';

import { 
  COLOR_ITEM_LIFE,
  COLOR_ITEM_FATPILL,
  COLOR_ITEM_BIGSHOT,
} from '../colors'

export default class Item {
  constructor({ engine }, { x, y, type }) {
  
    this.state = {};
    this.engine = engine;

    let settings = {
      life: { color: COLOR_ITEM_LIFE },
      fatpill: { color: COLOR_ITEM_FATPILL },
      bigshot: { color: COLOR_ITEM_BIGSHOT }
    }[type]

    this.width = 15;
    this.height = 15;

    this.body = Bodies.rectangle(x, y, this.width, this.height, { 
      label: 'item', 
      itemType: type,
      render: { fillStyle: settings.color },
      chamfer: { radius: 3 }
    });
  }

  update() {
  }

  addToWorld() {
    World.add(this.engine.world, [this.body]);
  }
}
