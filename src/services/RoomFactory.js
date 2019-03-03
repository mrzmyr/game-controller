import EnemyShooter from '../components/EnemyShooter';
import EnemyStation from '../components/EnemyStation';
import EnemyDubber from '../components/EnemyDubber';
import Item from '../components/Item';
import Door from '../components/Door';

import { random, range } from '../helpers';


export default class RoomFactory {
  constructor({ engine, render }) {
    this.engine = engine;
    this.render = render;
    this.width = render.options.width;
    this.height = render.options.height;

    this.templateMap = [
      [-1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1]
    ];
  }

  goTop(x, y) {
    return;
  }

  getRandomDirection({ x, y, map }) {
    let possibleDirections = this.getPossibleDirections({ x, y, map });
    return possibleDirections[random(0, possibleDirections.length - 1)];
  }

  getPossibleDirections({ x, y, map }) {
    let directions = [];
    if (map[y - 1] && map[y - 1][x] === -1) directions.push('top');
    if (map[y + 1] && map[y + 1][x] === -1) directions.push('bottom');
    if (map[y][x - 1] === -1) directions.push('left');
    if (map[y][x + 1] === -1) directions.push('right');

    if (directions.length === 0) {
      console.log('found dead end');
    }

    return directions;
  }

  generateMap(template) {
    let map = template.slice();
    
    let rooms = [];
    let roomIndex = 0;
    let x = random(0, map[0].length - 1);
    let y = random(0, map.length - 1);

    let direction = null;

    for (let i = 0; i < 20; i++) {
      rooms.push({ x, y });
      map[y][x] = roomIndex;
      roomIndex += 1;

      direction = this.getRandomDirection({ x, y, map });

      if (direction === 'top') y -= 1;
      if (direction === 'bottom') y += 1;
      if (direction === 'right') x += 1;
      if (direction === 'left') x -= 1;
    }

    return {map, rooms};
  }

  generateEnemy() {
    let possibleEnemies = [EnemyStation, EnemyShooter, EnemyDubber];
    let enemyClass = possibleEnemies[random(0, possibleEnemies.length - 1)];
    let x = random(100, this.width - 100);
    let y = random(100, this.height - 100);
    
    return new enemyClass({
      render: this.render,
      engine: this.engine
    }, { x, y });
  }

  generateItem() {
    let possibleItems = ['life', 'bigshot', 'fatpill'];
    return new Item({
      render: this.render,
      engine: this.engine
    }, {
      type: possibleItems[random(0, possibleItems.length - 1)],
      x: random(100, this.width - 100),
      y: random(100, this.height - 100)
    });
  }

  generateRoom(roomIndex, doorDefinitions) {
    let enemies = range(roomIndex - 1).map(i => this.generateEnemy());
    let items = range(roomIndex + 1).map(i => this.generateItem());

    let doors = doorDefinitions.map(door => {
      return new Door({
        render: this.render,
        engine: this.engine
      }, {
        targetRoom: door.target,
        type: door.type,
        roomIndex
      })
    })

    return {
      enemies,
      items,
      doors
    };
  }

  generateRooms() {
    const { map, rooms } = this.generateMap(this.templateMap);
    
    let result = rooms.map((coords, i) => {
      let x = coords.x;
      let y = coords.y;
      let doors = [];
      if (map[y - 1] !== undefined && map[y - 1][x] !== -1) doors.push({ type: 'top', target: map[y - 1][x] });
      if (map[y + 1] !== undefined && map[y + 1][x] !== -1) doors.push({ type: 'bottom', target: map[y + 1][x] });
      if (map[y][x + 1] !== undefined && map[y][x + 1] !== -1) doors.push({ type: 'right', target: map[y][x + 1] });
      if (map[y][x - 1] !== undefined && map[y][x - 1] !== -1) doors.push({ type: 'left', target: map[y][x - 1] });
      // dmap[y][x] = doors.map(d => d.type+d.target).join('');
      return this.generateRoom(map[y][x], doors);
    })

    console.log(map);
    console.log(result);

    return { rooms: result, map };
  }
}
