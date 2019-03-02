import EnemyShooter from './components/EnemyShooter'
import EnemyStation from './components/EnemyStation'
import EnemyDubber from './components/EnemyDubber'
import Item from './components/Item'
import Door from './components/Door'

import { Common } from 'matter-js'
import { random, range } from './helpers'

export function generateRooms ({ engine, render, width, height }) {

  return [
    {
      enemies: [
      ],
      items: [
        new Item({ engine, render }, { type: 'bigshot', x: random(100, width - 100), y: random(100, height - 100)}),
        new Item({ engine, render }, { type: 'fatpill', x: random(100, width - 100), y: random(100, height - 100)}),
        new Item({ engine, render }, { type: 'life', x: random(100, width - 100), y: random(100, height - 100)}),
        new Item({ engine, render }, { type: 'life', x: random(100, width - 100), y: random(100, height - 100)}),
        new Item({ engine, render }, { type: 'life', x: random(100, width - 100), y: random(100, height - 100)}),
        new Item({ engine, render }, { type: 'life', x: random(100, width - 100), y: random(100, height - 100)}),
        new Item({ engine, render }, { type: 'life', x: random(100, width - 100), y: random(100, height - 100)}),
        new Item({ engine, render }, { type: 'life', x: random(100, width - 100), y: random(100, height - 100)}),
      ],
      doors: [
        new Door({ engine, render }, { targetRoom: 1, type: 'top' }),
      ]
    },
    // 1: {
    //   enemies: [
    //     new EnemyStation({ engine, render }, {x: width - 100, y: 100}),
    //     new EnemyStation({ engine, render }, { x: random(100, width - 100), y: random(100, height - 100)}),
    //     new EnemyStation({ engine, render }, { x: random(100, width - 100), y: random(100, height - 100)}),
    //   ],
    //   items: [
    //   ],
    //   doors: [
    //     new Door({ engine, render }, { targetRoom: 0, type: 'right' }),
    //     new Door({ engine, render }, { targetRoom: 2, type: 'bottom' }),
    //     new Door({ engine, render }, { targetRoom: 3, type: 'left' }),
    //   ]
    // },
    // 2: {
    //   enemies: [
    //     new EnemyDubber({ engine, render }, { x: width - 100, y: height - 100 }),
    //     new EnemyShooter({ engine, render }, { x: random(100, width - 100), y: random(100, height - 100)}),
    //   ],
    //   items: [
    //     new Item({ engine, render }, { type: 'fatpill', x: random(100, width - 100), y: random(100, height - 100)}),
    //     new Item({ engine, render }, { type: 'life', x: random(100, width - 100), y: random(100, height - 100)}),
    //     new Item({ engine, render }, { type: 'life', x: random(100, width - 100), y: random(100, height - 100)}),
    //   ],
    //   doors: [
    //     new Door({ engine, render }, { targetRoom: 1, type: 'top' }),
    //   ]
    // },
    // 3: {
    //   enemies: [
    //     new EnemyStation({ engine, render }, {x: 100, y: 100}),
    //     new EnemyShooter({ engine, render }, { x: random(100, width - 100), y: random(100, height - 100)}),
    //     new EnemyShooter({ engine, render }, { x: random(100, width - 100), y: random(100, height - 100)}),
    //     new EnemyShooter({ engine, render }, { x: random(100, width - 100), y: random(100, height - 100)}),
    //     new EnemyStation({ engine, render }, {x: width - 100, y: height - 100}),
    //   ],
    //   items: [
    //     new Item({ engine, render }, { type: 'bigshot', x: random(100, width - 100), y: random(100, height - 100)}),
    //     new Item({ engine, render }, { type: 'life', x: random(100, width - 100), y: random(100, height - 100)}),
    //   ],
    //   doors: [
    //     new Door({ engine, render }, { targetRoom: 1, type: 'right' }),
    //   ]
    // },
  ]
};

export function generateDoor({ engine, render, existingDoors, targetRoom }) {
  
  let doorTypes = ['left', 'top', 'bottom', 'right']
  
  existingDoors.forEach(door => {
    doorTypes.splice(doorTypes.indexOf(door.body.doorType), 1)
  })

  if(doorTypes.length === 0) {
    console.log('no free door space')
  }
  
  let type = Common.choose(doorTypes);
  console.log('roll a dice for:', doorTypes, '->', type);

  return new Door(
    { render, engine },{
      type,
      targetRoom
    }
  )
}

export function generateRoom({ engine, render, width, height, entrance }) {

  let possibleEnemies = [EnemyStation, EnemyShooter, EnemyDubber]
  let possibleItems = ['life', 'bigshot', 'fatpill']
  let doorTypes = ['left', 'top', 'bottom', 'right']
  let oppositeDoorTypes = {
    left: 'right', 
    top: 'bottom', 
    bottom: 'top', 
    right: 'left'
  }

  let entranceType = entrance.body.doorType;
  doorTypes.splice(doorTypes.indexOf(entranceType), 1)
  
  let enemies = range(1).map(i => {
    return new possibleEnemies[random(0, possibleEnemies.length - 1)](
      { engine, render }, { x: random(100, width - 100), y: random(100, height - 100) }
    );
  })
  
  let items = range(3).map(i => {
    return new Item(
      { engine, render }, { 
        type: possibleItems[random(0, possibleEnemies.length - 1)], 
        x: random(100, width - 100), 
        y: random(100, height - 100) 
      }
    );
  })
  
  let doors = [];

  console.log(oppositeDoorTypes[entranceType], entranceType);
  
  doors.push(new Door(
    { render, engine },{
      type: oppositeDoorTypes[entranceType],
      targetRoom: entrance.body.targetRoom - 1,
    }
  ))
  
  return {
    visited: false,
    enemies,
    items,
    doors
  }
}