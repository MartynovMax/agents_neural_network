/* eslint-disable */
// import planck from 'planck-js/dist/planck-with-testbed.js'
import Konva from 'konva'
import planck from 'planck-js'

const pl = planck
const Vec2 = pl.Vec2
const SCALE_FACTOR = 25


export default function () {
  const {world, layer} = app()

  start(world, layer)
}





function start (world, layer) {
  function fn () {
    // in each frame call world.step(timeStep) with fixed timeStep
    world.meta.step(1 / 60)

    // const body = world.meta.getBodyList()
    // body.getNext()
    // console.log('body: ', body)
    // world.meta.getNext()

    // for (let subject of world.subjects) {
    //   // console.log('subject: ', subject)
    //   const fixtureList = subject.meta.getFixtureList()
    //   // console.log('\n fixtureList: ', subject.meta.getPosition())
    //   var s = subject.meta.getPosition()
    //   fixtureList.getNext()
    //   var e = subject.meta.getPosition()
    //   if (s.x !== e.x || s.y !== e.y) {
    //     console.log('subject: ', subject)
    //   }
    // }

    // iterate over bodies and fixtures
    for (var body = world.meta.getBodyList(); body; body = body.getNext()) {
      // console.log('body: ', body, body.getUserData())

      for (var fixture = body.getFixtureList(); fixture; fixture = fixture.getNext()) {
        // console.log('fixture: ', fixture.getUserData())
        const agent = fixture.getUserData()
        if (agent && agent.draw) agent.draw()
        // draw or update fixture
      }
    }

    for (var j = world.meta.getJointList(); j; j = j.getNext()) {}

    layer.draw()
    window.requestAnimationFrame(fn)
  }

  window.requestAnimationFrame(fn)
}


class World {
  constructor (layer) {
    this.layer = layer

    this.x = 0
    this.y = 0

    const WORLD_WIDTH = this.width = this.WORLD_WIDTH = 20
    const WORLD_HEIGHT = this.height = this.WORLD_HEIGHT = 20
    const WALL_WIDTH = this.WALL_WIDTH = 0.1

    const WORLD_GRAVITY_X = 0
    const WORLD_GRAVITY_Y = 0

    var world = pl.World({
      m_userData: this,
      gravity: Vec2(WORLD_GRAVITY_X, WORLD_GRAVITY_Y),
      velocityIterations: 8
    })

    var ground = world.createBody()

    var container = world.createBody({
      position: Vec2(0, WORLD_HEIGHT)
    })

    // walls
    container.createFixture(pl.Box(WALL_WIDTH, WORLD_HEIGHT, Vec2(WORLD_WIDTH, 0), 0), 5)
    container.createFixture(pl.Box(WALL_WIDTH, WORLD_HEIGHT, Vec2(-WORLD_WIDTH, 0), 0), 5)
    container.createFixture(pl.Box(WORLD_HEIGHT, WALL_WIDTH, Vec2(0, WORLD_WIDTH), 0), 5)
    container.createFixture(pl.Box(WORLD_HEIGHT, WALL_WIDTH, Vec2(0, -WORLD_WIDTH), 0), 5)

    world.createJoint(pl.RevoluteJoint({
      motorSpeed: 0.08 * Math.PI,
      maxMotorTorque: 1e8,
      enableMotor: true
    }, ground, container, Vec2(0, 10)))


    this.$el = null
    this.meta = world
    this.subjects = []

    this.init()
  }

  addSubject (subject) {
    this.subjects.push(subject)
    this.layer.add(subject.$el)
  }

  init () {
    this.$el = new Konva.Rect({
      x: this.x * SCALE_FACTOR,
      y: this.y * SCALE_FACTOR,
      width: this.width * SCALE_FACTOR,
      height: this.height * SCALE_FACTOR,
      fill: '#00D2FF',
      // stroke: 'black',
      // strokeWidth: 0,
      draggable: false
    })

    this.layer.add(this.$el)
  }

  draw () {

  }
}




class Agent {
  constructor (world) {
    var AGENT_WIDTH = this.width = this.AGENT_WIDTH = 0.5
    var AGENT_HEIGHT = this.height = this.AGENT_HEIGHT = 0.5

    // this.x = pl.Math.random(-world.WORLD_WIDTH + AGENT_WIDTH, world.WORLD_WIDTH - AGENT_WIDTH)
    // this.y = world.WORLD_HEIGHT + pl.Math.random(-world.WORLD_HEIGHT + AGENT_HEIGHT, world.WORLD_HEIGHT - AGENT_HEIGHT)

    this.x = pl.Math.random(AGENT_WIDTH, world.WORLD_WIDTH - AGENT_WIDTH)
    this.y = pl.Math.random(AGENT_HEIGHT, world.WORLD_HEIGHT - AGENT_HEIGHT)

    var agentShape = pl.Box(AGENT_WIDTH, AGENT_HEIGHT)
    var agentKg = 10
    var agentFixtureDef = {
      userData: this,
      friction: 5,
      restitution: 0.1,
      density: 1000 / Math.sqrt(agentKg)
    }

    var agent = world.meta.createDynamicBody()
    agent.setPosition(Vec2(this.x, this.y))
    agent.createFixture(agentShape, agentFixtureDef, 1)

    this.meta = agent
    // console.log('agent ??: ', this.meta.getPosition())

    this.$el = new Konva.Rect({
      x: this.x * SCALE_FACTOR,
      y: this.y * SCALE_FACTOR,
      width: this.width * SCALE_FACTOR,
      height: this.height * SCALE_FACTOR,
      fill: '#00D2FF',
      stroke: 'black',
      strokeWidth: 1,
      // draggable: true
    })
  }

  draw () {
    const coords = this.meta.getPosition()
    this.$el.position({
      x: coords.x * SCALE_FACTOR,
      y: coords.y * SCALE_FACTOR,
    })
  }
}




function app () {
  var stage = new Konva.Stage({
    container: 'agents-app__container',
    width: window.innerWidth,
    height: window.innerHeight
  })

  var layer = new Konva.Layer();
  stage.add(layer);


  const world = new World(layer)

  var AGENTS_COUNT = 200
  // var AGENTS_COUNT = 50
  // var AGENTS_COUNT = 1

  var count = 0
  while (count < AGENTS_COUNT) {
    const agent = new Agent(world)
    world.addSubject(agent)
    ++count
  }

  return {
    world,
    stage,
    layer
  }
}
