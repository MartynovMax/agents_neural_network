/* eslint-disable */
import Matter from 'matter-js'



export default class Food {
  constructor (data) {
    this.world = data.world

    this.id = data.id || _generateUID()
    this.type = 'food'
    this.score = 0
    this.fitness = 0
    this.parents = []
    this.startParams = data || {}

    // this._status = ''

    // radians
    this.visionAngle = _toRadians(110)
    this.visionRadius = 70
    this._visionArcPath = []

    // this.colors = []
    // this.brain = new NeuralNetwork(4, 100, 2)

    this.$body = null

    Object.assign(this, data)

    this.init()
    this.world.addSubject(this)
  }


  get position () {
    if (!this.$body) return Vec2()
    return this.$body.position
  }

  /**
   * @param {Vec2} vec
   */
  set position (vec) {
    if (!this.$body) return
    Matter.Body.setPosition(this.$body, vec)
  }


  get width () {
    return 4
  }
  // get height () {
    // return 15
  // }


  get angle () {
    if (!this.$body) return -1
    return this.$body.angle
  }

  /**
   * @param {number} angle - in radians
   */
  set angle (val) {
    if (!this.$body) return
    Matter.Body.setAngle(this.$body, val)
  }


  // get status () {
  //   return this._status
  // }
  // set status (val) {
  //   let render

  //   if (this._status === val) return

  //   switch (val) {
  //     case 'see_food': {
  //       render = {fill: 'red', stroke: '#ffffff'}
  //       break
  //     }
  //     default: {
  //       render = {fill: '#0077ff', stroke: '#ffffff'}
  //     }
  //   }

  //   this._status = val
  //   this._fixture.render = render
  //   console.log('render: ', render)
  // }


  init () {
    var rect = Matter.Bodies.circle(
      this.startParams.position.x,
      this.startParams.position.y,
      this.width,
      {
        id: this.id,
        label: this.type,
        frictionAir: 0.01
      }
    );

    Matter.Body.setMass(rect, 5)

    this.$body = rect;

    this.angle = this.startParams.angle || 0
    // this.position = this.startParams.position || Vec2()
  }


  draw () {
    // const ctx = this.world.canvas.getContext('2d')

    // const x = this.position.x
    // const y = this.position.y
    // let pathArea = this._visionArcPath

    // const baseX = pathArea[0].x + x
    // const baseY = pathArea[0].y + y

    // pathArea = pathArea.map((point) => {
    //   return _rotatePoint(
    //     point.x + x,
    //     point.y + y,
    //     baseX,
    //     baseY,
    //     this.angle
    //   );
    // });

    // ctx.beginPath();
    // ctx.moveTo(pathArea[0].x, pathArea[0].y);

    // for (var i = 1; i < pathArea.length; i++) {
    //   ctx.lineTo(pathArea[i].x, pathArea[i].y);
    // }

    // ctx.lineWidth = 1;
    // ctx.strokeStyle = '#ccc';
    // ctx.stroke();
  }


  // applyForce (force) {
  //   Matter.Body.applyForce(this.$body, this.position, {
  //     x: Math.cos(this.angle) * force,
  //     y: Math.sin(this.angle) * force
  //   });
  // }

  // /**
  //  * @param {number} impulse
  //  */
  // applyAngularForce (impulse) {
  //   Matter.Body.setAngularVelocity(this.$body, impulse);
  // }



  // clone () {
  //   let params = Object.assign({}, this.startParams);
  //   params = Object.assign(params, {
  //     position: this.position,
  //     angle: this.angle
  //   });

	// 	let newEntity = new Agent(params);
	// 	newEntity.brain.dispose();
	// 	newEntity.brain = this.brain.clone();

	// 	return newEntity;
  // }



  // kill () {
  //   this.world.$body.destroyBody(this.$body)

	// 	// Dispose its brain
	// 	this.brain.dispose();
  // }

  destroy () {
    this.world.emit('food:destroy', this)
    this.world.removeSubject(this)
  }
}
