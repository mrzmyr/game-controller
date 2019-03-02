import React, { Component } from 'react';
import { 
  Engine,
  Render,
  World,
  Bodies,
  Events,
  Composite,
  Body
} from 'matter-js';

import Player from './components/Player';
import gamepad from './services/gamepad';
import { generateRooms, generateRoom, generateDoor } from './roomGenerator';

import { range, random } from './helpers';
import { COLOR_BG, COLOR_WALLS, COLOR_PLAYERS } from './colors';

import { Howl } from 'howler';

var sound_drink_1 = new Howl({ src: ['./sounds/bubble.wav'] });
var sound_drink_2 = new Howl({ src: ['./sounds/bottle.wav'] });
var sound_door = new Howl({ src: ['./sounds/door.wav'] });
var sound_bg = new Howl({ src: ['./sounds/bg.mp3'], loop: true });
var sound_start = new Howl({ src: ['./sounds/selection.wav'] });
var sound_dead = new Howl({ src: ['./sounds/pain.wav'] });
var sound_victory_1 = new Howl({ src: ['./sounds/victory.mp3'] });
var sound_victory_2 = new Howl({ src: ['./sounds/vic.mp3'] });
var sound_hit = new Howl({ src: ['./sounds/hit.mp3'] });

class Game extends Component {
  constructor(props) {
    super(props);
    
    this.width = 800;
    this.height = 600;

    this.state = {
      lifes: null,
      gameover: true
    };

    this.players = {};
    this.rooms = null;

    this.currentRoomIndex = 0;

    this.renderElement = <div style={{ width: '100%', height: '100%' }}></div>;
  }

  cleanRoom() {
    World.clear(this.engine.world)
  }
  
  setupRoom({ id, playerPosition }) {

    let gp = gamepad.getState();

    World.add(this.engine.world, [
        Bodies.rectangle(400, 0, 800, 50, { isStatic: true, label: 'wall', render: { fillStyle: COLOR_WALLS }  }),
        Bodies.rectangle(400, 600, 800, 50, { isStatic: true, label: 'wall', render: { fillStyle: COLOR_WALLS }  }),
        Bodies.rectangle(800, 300, 50, 600, { isStatic: true, label: 'wall', render: { fillStyle: COLOR_WALLS }  }),
        Bodies.rectangle(0, 300, 50, 600, { isStatic: true, label: 'wall', render: { fillStyle: COLOR_WALLS }  })
    ]);

    console.log(id);
    
    this.currentRoomIndex = id;
    this.rooms[this.currentRoomIndex].visited = true;
    let room = this.rooms[this.currentRoomIndex];

    gp.gamepads.forEach((g, i) => {
      if(this.players[i]) return;
      let player = new Player({
        engine: this.engine,
        render: this.render,
        index: g.index
      }, { 
        color: COLOR_PLAYERS[i],
        x: random(100, this.width - 100), 
        y: random(100, this.height - 100)
      })
      this.players[g.index] = player;
    })
    
    Object.keys(this.players).forEach(i => {
      let p = this.players[i];
      p.addToWorld()
      Body.setPosition(p.body, { x: playerPosition.x, y: playerPosition.y })
    })

    room.doors.forEach(c => c.addToWorld())
    room.items.forEach(c => c.addToWorld())
    room.enemies.forEach(c => c.addToWorld())

    if(room.enemies.length === 0) {
      room.doors.forEach(d => d.unlock())
    }
  }

  update() {

    let gp = gamepad.getState();
    this.setState({ gamepadConnected: gp.connected })

    if(!gp.connected) return;

    this.setState({ gamepadStr: JSON.stringify(gp, null, 2), })

    gp.gamepads.forEach((g, i) => {
      if(this.state.gameover && g.start.pressed) {
        this.players = {};
        this.start();
      }
    });

    if(this.rooms === null || this.state.loading) return;

    let room = this.rooms[this.currentRoomIndex];

    room.enemies.forEach(c => c.update(this.players));
    Object.keys(this.players).forEach(i => this.players[i].update());

    if(this.state.gameover) return;

    gp.gamepads.forEach((g, i) => {
      let gamepadPlayer = this.players[g.index];
      if(!gamepadPlayer) return;

      if(g.rightStick.pressed) {
        gamepadPlayer.activateEffect({ id: 'ultimate' })
        this.setState({ lastUlti: +new Date() })
      }

      if(Math.abs(g.rightStick.x) > 0.95 || Math.abs(g.rightStick.y) > 0.95) {
        gamepadPlayer.fire({ x: g.rightStick.x, y: g.rightStick.y })
      }

      gamepadPlayer.moveToDirection({ x: g.leftStick.x, y: g.leftStick.y })
    })
  }

  getPlayerById(id) {
    let keys = Object.keys(this.players);
    for (let i = 0; i < keys.length; i++) {
      if(this.players[keys[i]].body.id === id) {
        return this.players[keys[i]];
      }
    }
  }

  setupCollisions() {
    Events.on(this.engine, 'collisionStart', (event) => {
      let currentRoom = this.rooms[this.currentRoomIndex];

      event.pairs.forEach(pair => {
        let a = pair.bodyA;
        let b = pair.bodyB;

        if(a.label === 'enemy' && b.label === 'bullet-player') {
          sound_hit.play()
          a.lifes -= 1;
          Composite.remove(this.engine.world, b)

          if(a.lifes <= 0) {
            sound_victory_2.play();
            for (let i = 0; i < currentRoom.enemies.length; i++) {
              if(currentRoom.enemies[i].body.id === a.id) {
                currentRoom.enemies[i].die();
                currentRoom.enemies.splice(i, 1);
                break;
              }
            }
          }

          if(currentRoom.enemies.length === 0) {
            sound_victory_1.play();
            currentRoom.doors.map(d => d.unlock())
          }
        }

        if(a.label === 'player' && b.label === 'bullet-enemy') {
          if(this.state.gameover) return;
          
          // if(+new Date() - a.lastHit < 100) return;
          // a.lastHit = +new Date();

          sound_hit.play()
          Composite.remove(this.engine.world, b)
          
          a.lifes = a.lifes <= 0 ? 0 : a.lifes - 1;

          if(a.lifes <= 0) {
            sound_dead.play();
            Composite.remove(this.engine.world, a)
            delete this.players[a.index]
          }
          
          if(Object.keys(this.players).length === 0) {
            this.setState({ gameover: true })
          } 
        }

        if(a.label === 'wall' && ['bullet-player', 'bullet-enemy'].includes(b.label)) {
          Composite.remove(this.engine.world, b)
        }

        if(
          (a.label === 'player' && b.label === 'door') ||
          (a.label === 'door' && b.label === 'player')
        ) {
          let door = a.label === 'player' ? b : a;
          let player = a.label === 'player' ? a : b;
          let enteredRoom = this.rooms[door.targetRoom];

          // if(+new Date() - player.lastDoorEntered < 100) return;
          // player.lastDoorEntered = +new Date();

          if(!door.locked) {
            sound_door.play()
            this.cleanRoom()

            if(!enteredRoom.visited) {
              let newDoor = generateDoor({ 
                engine: this.engine,
                render: this.renderer,
                existingDoors: enteredRoom.doors,
                targetRoom: this.rooms.length
              });
              this.rooms.push(generateRoom({ 
                engine: this.engine,
                render: this.renderer,
                width: this.width,
                height: this.height,
                entrance: newDoor
              }))
              enteredRoom.doors.push(newDoor);
            }

            this.setupRoom({ id: door.targetRoom, door, playerPosition: {
              left: { x: this.width - 100, y: this.height / 2, },
              right: { x: 100, y: this.height / 2, },
              top: { x: this.width / 2, y: this.height - 100, },
              bottom: { x: this.width / 2, y: 100, },
            }[door.doorType] })
          }
        }

        if(
          (b.label === 'item' && a.label === 'player') ||
          (a.label === 'item' && b.label === 'player')
        ) {
          let item = a.label === 'item' ? a : b;
          let player = a.label === 'player' ? a : b;

          // if(+new Date() - player.lastItemLoop < 50) return;
          // player.lastItemLoop = +new Date();
          
          Composite.remove(this.engine.world, item)

          if(item.itemType === 'fatpill') {
            sound_drink_2.play();
            player.lifes = 1;
            this.getPlayerById(player.id).activateEffect({ id: 'fatpill' })
          }

          if(item.itemType === 'life') {
            sound_drink_1.play();
            player.lifes += 1;
          }

          if(item.itemType === 'bigshot') {
            this.getPlayerById(player.id).activateEffect({ id: 'bigshot' })
          }

          for (let i = 0; i < currentRoom.items.length; i++) {
            if(currentRoom.items[i].body.id === item.id) {
              currentRoom.items.splice(i, 1);
              break;
            }
          }
        }

      })
    });
  }

  componentDidMount() {
    this.engine = Engine.create()
    this.engine.world.gravity.y = 0;
    Engine.run(this.engine);

    this.renderer = Render.create({
      element: this.renderElement,
      engine: this.engine,
      options: {
        width: this.width,
        height: this.height,
        wireframes: false,
        background: COLOR_BG,
        // pixelRatio: 1,
        // wireframeBackground: '#222',
        // hasBounds: true,
        // enabled: true,
        // showSleeping: true,
        // showDebug: true,
        // showBroadphase: true,
        // showBounds: true,
        // showVelocity: true,
        // showCollisions: true,
        // showSeparations: true,
        // showAxes: true,
        // showAngleIndicator: true,
        // showIds: true,
        // showShadows: true,
        // showVertexNumbers: true,
        // showConvexHulls: true,
        // showInternalEdges: true,
        // showPositions: true,
        // showMousePosition: true
      }
    });

    Render.run(this.renderer);

    (function run() {
        this.update(this.engine);
        window.requestAnimationFrame(run.bind(this));
        Engine.update(this.engine, 1000 / 60);
    }.bind(this))();

    // this.start();
  }

  start() {
    sound_start.play()
    // sound_bg.stop()
    // sound_bg.play()
    
    let gp = gamepad.getState();

    gp.gamepads.forEach((g, i) => {
      let player = new Player({
        engine: this.engine,
        render: this.render,
        index: g.index
      }, { 
        color: COLOR_PLAYERS[i],
        x: random(100, this.width - 100), 
        y: random(100, this.height - 100)
      })
      this.players[g.index] = player;
    })

    Engine.clear(this.engine);

    this.setState({ 
      loading: true,
      lastUlti: +new Date(),
      // lifes: player.body.lifes,
      gameover: false,
    })

    this.rooms = generateRooms({
      engine: this.engine,
      render: this.renderer,
      width: this.width,
      height: this.height
    });

    this.setupCollisions();

    this.cleanRoom()
    this.rooms.push(generateRoom({ 
      engine: this.engine,
      render: this.renderer,
      width: this.width,
      height: this.height,
      entrance: this.rooms[0].doors[0]
    }))
    this.setupRoom({
      id: 0,
      playerPosition: { x: this.width / 2, y: this.height / 2 }
    })

    this.setState({ loading: false })
  }
  
  render() {
    const lifeEmojis = ['💜', '❤️', '💙', '💛'];
    
    return (
      <div>
        <div style={{ position: 'absolute' }}>
          { this.state.gamepadConnected && !this.state.loading && !this.state.gameover &&
            <div>
              {Object.keys(this.players).map((i) => {
                return <div key={i}>{range(this.players[i].body.lifes).map(l => lifeEmojis[i])}</div>
              })} 
              {+new Date() - this.state.lastUlti >= 10000 && '💊'}
              {+new Date() - this.state.lastUlti < 10000 && 10 - Math.round((+new Date() - this.state.lastUlti) / 1000)}
            </div>
          }
          {!this.state.gamepadConnected && <code>Please connect gamepad</code>}
          {this.state.gamepadConnected && this.state.loading && <code>Loading…</code>}
          {this.state.gamepadConnected && this.state.gameover && !this.state.loading && <code>Press the 'start' button</code>}
        </div>
        {/*<pre>{this.state.gamepadStr}</pre>*/}
        <div style={{ width: '100%', height: '100%', textAlign: 'center' }} ref={node => this.renderElement = node}></div>
      </div>
    )
  }
}

export default Game;