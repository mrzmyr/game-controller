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

import Player from './components/Player'
import gamepad from './services/gamepad'
import { generateRooms } from './roomGenerator'

import { range } from './helpers'
import { COLOR_BG, COLOR_WALLS } from './colors'

window.decomp = require('poly-decomp');

class Game extends Component {
  constructor(props) {
    super(props);
    
    this.width = 800;
    this.height = 600;

    this.state = {
      lifes: null,
      gameover: true
    };

    this.players = []
    this.rooms = null;

    this.currentRoomId = 0;

    this.renderElement = <div style={{ width: '100%', height: '100%' }}></div>;
  }

  cleanRoom() {
    World.clear(this.engine.world)
  }

  setupRoom(opts) {

    World.add(this.engine.world, [
        Bodies.rectangle(400, 0, 800, 50, { isStatic: true, label: 'wall', render: { fillStyle: COLOR_WALLS }  }),
        Bodies.rectangle(400, 600, 800, 50, { isStatic: true, label: 'wall', render: { fillStyle: COLOR_WALLS }  }),
        Bodies.rectangle(800, 300, 50, 600, { isStatic: true, label: 'wall', render: { fillStyle: COLOR_WALLS }  }),
        Bodies.rectangle(0, 300, 50, 600, { isStatic: true, label: 'wall', render: { fillStyle: COLOR_WALLS }  })
    ]);

    this.currentRoomId = opts.id;
    let room = this.rooms[this.currentRoomId];

    this.players.forEach(c => {
      c.addToWorld()
      Body.setPosition(c.body, { x: opts.playerPosition.x, y: opts.playerPosition.y })
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

    if(this.rooms === null || this.state.loading) return;

    let room = this.rooms[this.currentRoomId];

    room.enemies.forEach(c => c.update(this.players));
    this.players.forEach(c => c.update());

    if(this.state.gameover && gp.buttons[8].pressed) {
      this.players = [];
      this.setState({ fatpill: false })
      this.start()
    }

    if(this.state.gameover) return;

    let gamepadPlayer = this.players[0];

    if(gp.buttons[9].pressed) {
    }

    if(gp.buttons[7].pressed) {
      gamepadPlayer.activateEffect({ id: 'ultimate' })
      this.setState({ lastUlti: +new Date() })
    }

    if(Math.abs(gp.axes[3]) > 0.95 || Math.abs(gp.axes[4]) > 0.95) {
      gamepadPlayer.fire({ x: gp.axes[3], y: gp.axes[4] })
    }

    gamepadPlayer.moveToDirection({ x: gp.axes[0], y: gp.axes[1] })
  }

  setupCollisions() {
    Events.on(this.engine, 'collisionStart', (event) => {
      let room = this.rooms[this.currentRoomId];

      event.pairs.forEach(pair => {
        let a = pair.bodyA;
        let b = pair.bodyB;

        if(a.label === 'enemy' && b.label === 'bullet-player') {
          a.lifes -= 1;
          Composite.remove(this.engine.world, b)

          if(a.lifes <= 0) {
            for (let i = 0; i < room.enemies.length; i++) {
              if(room.enemies[i].body.id === a.id) {
                room.enemies[i].die();
                room.enemies.splice(i, 1);
                break;
              }
            }
          }

          if(room.enemies.length === 0) {
            room.doors.map(d => d.unlock())
          }
        }

        if(a.label === 'player' && b.label === 'bullet-enemy') {
          Composite.remove(this.engine.world, b)

          a.lifes -= 1;
          this.setState({ lifes: a.lifes })

          if(a.lifes <= 0 && false) {
            Composite.remove(this.engine.world, a)
            this.players = [];
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

          if(!door.locked) {
            this.cleanRoom()
            this.setupRoom({ id: door.targetRoom, playerPosition: {
              left: { x: this.width - 100, y: this.height / 2, },
              right: { x: 100, y: this.height / 2, },
              top: { x: this.width / 2, y: this.height - 100, },
              bottom: { x: this.width / 2, y: 100, },
            }[door.doorType] })
          }
        }

        if(
          (a.label === 'item' && b.label === 'player') ||
          (a.label === 'player' && b.label === 'item')
        ) {
          let item = a.label === 'item' ? a : b;
          let player = a.label === 'player' ? a : b;

          if(item.itemType === 'fatpill') {
            this.players[0].activateEffect({ id: 'fatpill' })
            player.lifes = 1;
            this.setState({ fatpill: true, lifes: player.lifes })
          }

          if(item.itemType === 'life') {
            this.setState({ lifes: this.state.lifes + 1 })
            player.lifes += 1;
          }

          for (let i = 0; i < room.items.length; i++) {
            if(
              room.items[i].body.id === item.id ||
              room.items[i].body.id === item.parent.id
             ) {
              room.items.splice(i, 1);
              break;
            }
          }

          Composite.remove(this.engine.world, item.parent || item)
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

    this.start();
  }

  async start() {
    let player = new Player({
      engine: this.engine,
      render: this.render
    }, { 
      x: this.width / 2, 
      y: this.height / 2 
    })
    this.players.push(player);

    Engine.clear(this.engine);

    this.setState({ loading: true })

    this.rooms = await generateRooms({
      engine: this.engine,
      render: this.renderer,
      width: this.width,
      height: this.height
    });

    this.setupCollisions();

    this.setState({ 
      gameover: false,
      lifes: player.body.lifes
    })
    this.cleanRoom()
    this.setupRoom({
      id: 0, 
      playerPosition: { x: this.width / 2, y: this.height / 2 } 
    })

    this.setState({ loading: false })
  }

  render() {
    return (
      <div>
        <div style={{ position: 'absolute' }}>
          { this.state.gamepadConnected && !this.state.loading && !this.state.gameover &&
            <div>
              {range(this.state.lifes).map(l => this.state.fatpill ? '💜' : '❤️' )} 
              {+new Date() - this.state.lastUlti > 10000 && '💊'}
            </div>
          }
          {!this.state.gamepadConnected && <code>Please connect gamepad</code>}
          {this.state.gamepadConnected && this.state.loading && <code>Loading…</code>}
          {this.state.gamepadConnected && this.state.gameover && !this.state.loading && <code>Press the 'start' button</code>}
        </div>
        {/*<pre>{this.state.gamepadStr}</pre>*/}
        <div style={{ width: '100%', height: '100%' }} ref={node => this.renderElement = node}></div>
      </div>
    )
  }
}

export default Game;