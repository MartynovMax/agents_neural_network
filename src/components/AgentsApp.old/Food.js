/* eslint-disable */
import planck from 'planck-js/dist/planck-with-testbed.js'


const pl = planck
const Vec2 = pl.Vec2


export default class Food {
  constructor (data) {
    this.world = data.world

    this.id = data.id || _randomInteger(1e7, 1e8 - 1)
    this.type = 'food'
    this.value = 1
    this.startParams = data || {}

    this.$body = null

    Object.assign(this, data)

    this.init()
    this.world.addSubject(this)
  }


  get position () {
    if (!this.$body) return Vec2()
    return this.$body.getPosition()
  }

  /**
   * @param {Vec2} vec
   */
  set position (vec) {
    if (!this.$body) return
    this.$body.setPosition(vec)
  }


  get width () {
    return 0.25
  }
  get height () {
    return 0.25
  }


  get angle () {
    if (!this.$body) return -1
    return this.$body.getAngle()
  }

  /**
   * @param {number} angle - in radians
   */
  set angle (val) {
    if (!this.$body) return
    this.$body.setAngle(val);
  }


  init () {
    // var shape = pl.Box(this.width, this.height);
    var shape = pl.Circle(this.width);
    // var shape = pl.Polygon([
    //   Vec2(-width, -height),
    //   Vec2(0, -height / 5),
    //   Vec2(width, -height),
    //   Vec2(0, height / 2)
    // ]);

    const fixtureDef = {
      userData: this,
      friction: 0.1,
      restitution: 0.1,
      // density: 1000 / Math.sqrt(data.kg)
      density: 50,

      filterGroupIndex: -1
    }

    // const $body = this.world.createDynamicBody({
    const $body = this.world.$body.createBody({
      linearDamping: 1.5,
      angularDamping: 1
    });

    $body.createFixture(shape, fixtureDef, 1);

    this.$body = $body

    this.angle = this.startParams.angle || 0
    this.position = this.startParams.position || Vec2()
  }


  // applyForce (force) {
  //   var f = this.$body.getWorldVector(Vec2(0.0, -1.0));
  //   var p = this.$body.getWorldPoint(Vec2(0.0, 2.0));
  //   this.$body.applyLinearImpulse(f, p, true);
  // }

  // /**
  //  * @param {number} impulse
  //  */
  // applyAngularForce (impulse) {
  //   this.$body.applyAngularImpulse(impulse, true)
  // }


  // kill () {
  //   this.world.destroyBody(this.$body)
  // }

  destroy () {
    this.world.$body.destroyBody(this.$body)
    this.world.removeSubject(this)
  }

}


function _randomInteger(min, max) {
  var rand = min + Math.random() * (max - min);
  rand = Math.round(rand);
  return rand;
}
