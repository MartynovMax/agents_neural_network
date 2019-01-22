/* eslint-disable */
import planck from 'planck-js/dist/planck-with-testbed.js'

const pl = planck
const Vec2 = pl.Vec2


export default class World {
  constructor (data = {}) {
    this.id = data.id || _randomInteger(1e7, 1e8 - 1)

    this.subjects = {}
    this.$body = null

    Object.assign(this, data)

    this.init()
  }


  get width () {
    return 20
  }
  get height () {
    return 20
  }


  init () {
    const wallWidth = 0.1
    const WORLD_GRAVITY_X = 0
    const WORLD_GRAVITY_Y = 0

    const world = pl.World({
      gravity: Vec2(WORLD_GRAVITY_X, WORLD_GRAVITY_Y),
      velocityIterations: 8
    })

    const ground = world.createBody();

    const container = world.createBody({
      // userData: this,
      allowSleep: false,
      // position: Vec2(0, height)
    });


    // walls
    container.createFixture(pl.Box(wallWidth, this.height, Vec2(this.width, 0), 0), 5)
    container.createFixture(pl.Box(wallWidth, this.height, Vec2(-this.width, 0), 0), 5)
    container.createFixture(pl.Box(this.height, wallWidth, Vec2(0, this.width), 0), 5)
    container.createFixture(pl.Box(this.height, wallWidth, Vec2(0, -this.width), 0), 5)

    world.createJoint(pl.RevoluteJoint({
      // motorSpeed: 0.08 * Math.PI,
      // maxMotorTorque: 1e2,
      // enableMotor: true,
    }, ground, container, Vec2(0, 10)));

    this.$body = world
  }

  addSubject (subject) {
    if (!subject || !subject.id) return
    if (!this.subjects[subject.type]) this.subjects[subject.type] = {}
    this.subjects[subject.type][subject.id] = subject
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


function _randomInteger(min, max) {
  var rand = min + Math.random() * (max - min);
  rand = Math.round(rand);
  return rand;
}
