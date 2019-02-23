import { 
  World,
  Bodies,
  Vertices,
  Svg
} from 'matter-js';

import { 
  COLOR_ITEM_LIFE,
  COLOR_ITEM_FATPILL,
} from '../colors'

import $ from 'jquery'

export default class Item {
  constructor({ engine }, { x, y, type, svg }) {
  
    this.state = {};
    this.engine = engine;

    let vertexSets = [];

    $(svg).find('path').each(function(i, path) {
      var points = Svg.pathToVertices(path);
      vertexSets.push(Vertices.scale(points, 0.1, 0.1));
    });

    this.body = Bodies.fromVertices(x, y, vertexSets, { 
      label: 'item', 
      itemType: type,
      render: { fillStyle: type === 'life' ? COLOR_ITEM_LIFE : COLOR_ITEM_FATPILL },
      chamfer: { radius: 3 }
    });
  }

  update() {
  }

  addToWorld() {
    World.add(this.engine.world, [this.body]);
  }
}
