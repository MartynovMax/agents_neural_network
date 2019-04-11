/* eslint-disable */
import planck from 'planck-js/dist/planck-with-testbed.js'
import Matter from 'matter-js'

const Engine = Matter.Engine,
    Render = Matter.Render,
    MWorld = Matter.World,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies;


// create an engine
var engine = Engine.create()
const world = engine.world

var render = Render.create({
  element: document.body,
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
});

// const pl = planck
// const Vec2 = pl.Vec2


export default class World {
  constructor (data = {}) {
    this.id = data.id || _randomInteger(1e7, 1e8 - 1)

    this.subjects = {}
    this.$body = null

    this.engine = engine

    Object.assign(this, data)

    this.init()

    // run the engine
    Engine.run(engine);

    // run the renderer
    Render.run(render);

    var runner = Runner.create();
    Runner.run(runner, engine);
  }


  get width () {
    return 20
  }
  get height () {
    return 20
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
    // const wallWidth = 0.1
    // const WORLD_GRAVITY_X = 0
    // const WORLD_GRAVITY_Y = 0

    // const world = pl.World({
    //   gravity: Vec2(WORLD_GRAVITY_X, WORLD_GRAVITY_Y),
    //   velocityIterations: 8
    // })

    // const ground = world.createBody();

    // const container = world.createBody({
    //   // userData: this,
    //   allowSleep: false,
    //   // position: Vec2(0, height)
    // });

    // const wallFixtureDef = {
    //   filterGroupIndex: -1
    // }

    // walls
    // container.createFixture(pl.Box(wallWidth, this.height, Vec2(this.width, 0), 0), wallFixtureDef)
    // container.createFixture(pl.Box(wallWidth, this.height, Vec2(-this.width, 0), 0), wallFixtureDef)
    // container.createFixture(pl.Box(this.height, wallWidth, Vec2(0, this.width), 0), wallFixtureDef)
    // container.createFixture(pl.Box(this.height, wallWidth, Vec2(0, -this.width), 0), wallFixtureDef)

    MWorld.add(world, [
      // walls
      Bodies.rectangle(400, 0, 800, 50, { isStatic: true }),
      Bodies.rectangle(400, 600, 800, 50, { isStatic: true }),
      Bodies.rectangle(800, 300, 50, 600, { isStatic: true }),
      Bodies.rectangle(0, 300, 50, 600, { isStatic: true })
    ]);

    // Render.lookAt(render, {
    //   min: { x: 0, y: 0 },
    //   max: { x: 800, y: 600 }
    // });

    // this.$body = world
  }

  addSubject (subject) {
    if (!subject || !subject.id) return
    if (!this.subjects[subject.type]) this.subjects[subject.type] = {}
    this.subjects[subject.type][subject.id] = subject

    world.add(engine.world, subject.$body);
  }

  removeSubject (subject) {
    if (!subject || !subject.id) return
    if (!this.subjects[subject.type]) return
    delete this.subjects[subject.type][subject.id]
  }

  getCollectionSubjects (subjectType) {
    if (!this.subjects[subjectType]) return []
    return Object.values(this.subjects[subjectType])
  }

}
