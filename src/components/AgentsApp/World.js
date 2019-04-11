/* eslint-disable */
// import planck from 'planck-js/dist/planck-with-testbed.js'
import Matter from 'matter-js'
import EventEmitter from 'eventemitter3'
import Food from './Food'

window.decomp = require('poly-decomp');

const Engine = Matter.Engine,
  Render = Matter.Render,
  MWorld = Matter.World,
  Runner = Matter.Runner,
  Events = Matter.Events,
  Bodies = Matter.Bodies;


// create an engine
var engine = Engine.create()
const world = engine.world

world.gravity.x = 0;
world.gravity.y = 0;



export default class World extends EventEmitter {
  constructor (data = {}) {
    super()

    this.id = data.id || _randomInteger(1e7, 1e8 - 1)

    this.subjects = {}
    this.$body = null

    this.world = world
    this.engine = engine
    this.render = this.genRender()
    this.canvas = this.render.canvas


    Object.assign(this, data)

    this.init()

    // run the engine
    Engine.run(engine);

    // run the renderer
    Render.run(this.render);

    var runner = Runner.create();
    Runner.run(runner, engine);

    // TODO: move it to a draw loop
    Events.on(this.render, 'afterRender', this.draw.bind(this))

    Events.on(engine, 'collisionStart', ($event) => {
      var pairs = $event.pairs;

      for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i];

        if (pair.bodyA.label === 'food' && pair.bodyB.label === 'agent'
          || pair.bodyA.label === 'agent' && pair.bodyB.label === 'food') {

          const agentId = pair.bodyA.label === 'agent' ? pair.bodyA.id : pair.bodyB.id
          const foodId = pair.bodyA.label === 'food' ? pair.bodyA.id : pair.bodyB.id
          const agent = this.findSubject('agent', agentId)
          const food = this.findSubject('food', foodId)

          agent.bite(food)
        }

        // if ((pair.bodyA == player && lethal(pair.bodyB))
        //   || (pair.bodyB == player && lethal(pair.bodyA))) {
        //     kill();
        //     gameOver = true;
        // }
      }
    });


    this.on('food:destroy', (food) => {
      const PADDING = 50

      new Food({
        world: this,
        position: {
          x: _randomInteger(PADDING, this.width - PADDING),
          y: _randomInteger(PADDING, this.height - PADDING),
        }
      })
    })
  }


  get width () {
    return 800
  }
  get height () {
    return 600
  }

  // init () {
  //   const wallWidth = 0.1
  //   const WORLD_GRAVITY_X = 0
  //   const WORLD_GRAVITY_Y = 0

  //   const world = pl.World({
  //     gravity: Vec2(WORLD_GRAVITY_X, WORLD_GRAVITY_Y),
  //     velocityIterations: 8
  //   })

  //   const ground = world.createBody();

  //   const container = world.createBody({
  //     // userData: this,
  //     allowSleep: false,
  //     // position: Vec2(0, height)
  //   });

  //   const wallFixtureDef = {
  //     filterGroupIndex: -1
  //   }

  //   // walls
  //   container.createFixture(pl.Box(wallWidth, this.height, Vec2(this.width, 0), 0), wallFixtureDef)
  //   container.createFixture(pl.Box(wallWidth, this.height, Vec2(-this.width, 0), 0), wallFixtureDef)
  //   container.createFixture(pl.Box(this.height, wallWidth, Vec2(0, this.width), 0), wallFixtureDef)
  //   container.createFixture(pl.Box(this.height, wallWidth, Vec2(0, -this.width), 0), wallFixtureDef)

  //   world.createJoint(pl.RevoluteJoint({
  //     // motorSpeed: 0.08 * Math.PI,
  //     // maxMotorTorque: 1e2,
  //     // enableMotor: true,
  //   }, ground, container, Vec2(0, 10)));

  //   this.$body = world
  // }

  init () {
    const wallWidth = 50
    const wallOpts = { isStatic: true };

    // walls
    MWorld.add(world, [
      Bodies.rectangle(this.width/2, wallWidth/2, this.width, wallWidth, wallOpts),
      Bodies.rectangle(this.width - wallWidth/2, this.height/2, wallWidth, this.height, wallOpts),
      Bodies.rectangle(this.width/2, this.height - wallWidth/2, this.width, wallWidth, wallOpts),
      Bodies.rectangle(wallWidth/2, this.height/2, wallWidth, this.height, wallOpts)
    ])

    // Render.lookAt(render, {
    //   min: { x: 0, y: 0 },
    //   max: { x: 800, y: 600 }
    // });
  }

  draw () {
    for (let type in this.subjects) {
      for (let id in this.subjects[type]) {
        this.subjects[type][id].draw()
      }
    }
  }


  findSubject (type, id) {
    if (!type || !this.subjects[type]) return null
    return this.subjects[type][id] || null
  }

  addSubject (subject) {
    if (!subject || !subject.id) return
    if (!this.subjects[subject.type]) this.subjects[subject.type] = {}
    this.subjects[subject.type][subject.id] = subject

    MWorld.add(world, [subject.$body])
  }

  removeSubject (subject) {
    if (!subject || !subject.id) return
    if (!this.subjects[subject.type]) return

    const _subject = this.findSubject(subject.type, subject.id)
    MWorld.remove(world, _subject.$body);

    delete this.subjects[subject.type][subject.id]
  }

  getCollectionSubjects (subjectType) {
    if (!this.subjects[subjectType]) return []
    return Object.values(this.subjects[subjectType])
  }


  genRender () {
    var render = Render.create({
      element: document.getElementById('agents-app__container'),
      engine: engine,
      options: {
        width: 800,
        height: 600,
        pixelRatio: 1,
        background: '#fafafa',
        wireframeBackground: '#222',
        hasBounds: false,
        enabled: true,
        wireframes: true,
        showSleeping: true,
        showDebug: false,
        showBroadphase: false,
        showBounds: false,
        showVelocity: false,
        showCollisions: false,
        showSeparations: false,
        showAxes: false,
        showPositions: false,
        showAngleIndicator: false,
        showIds: false,
        showShadows: false,
        showVertexNumbers: false,
        showConvexHulls: false,
        showInternalEdges: false,
        showMousePosition: false
      }
    })

    return render
  }

}
