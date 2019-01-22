/* eslint-disable */
import * as tf from '@tensorflow/tfjs';
import planck from 'planck-js/dist/planck-with-testbed.js'
import NeuralNetwork from '@/NeuroEvolution/NeuralNetwork'
import { random, randomGaussian } from './random'

const pl = planck
const Vec2 = pl.Vec2


export default class Agent {
  constructor (data) {
    this.world = data.world

    // kg = 10
    // kg = 80

    this.id = data.id || _randomInteger(1e7, 1e8 - 1)
    this.type = 'agent'
    this.score = 0
    this.fitness = 0
    this.parents = []
    this.startParams = data || {}

    this.visionAngle  = 110
    this.visionRadius = 5
    this._visionArcPath = []

    // this.colors = []
    this.brain = new NeuralNetwork(4, 100, 2)

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
    return 0.5
  }
  get height () {
    return 0.5
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
    var shape = pl.Box(this.width, this.height);
    // var shape = pl.Circle(width);
    // var shape = pl.Polygon([
    //   Vec2(-width, -height),
    //   Vec2(0, -height / 5),
    //   Vec2(width, -height),
    //   Vec2(0, height / 2)
    // ]);

    const fixtureDef = {
      // userData: this,
      friction: 0.1,
      restitution: 0.1,
      // density: 1000 / Math.sqrt(data.kg)
      density: 50,
    }

    const $body = this.world.$body.createDynamicBody({
      linearDamping: 1.5,
      angularDamping: 1
    });

    $body.createFixture(shape, fixtureDef, 1);


    this._visionArcPath = _createVisionArcPath(
      0,
      0,
      this.visionRadius,
      360 - this.visionAngle / 2,
      this.visionAngle / 2
    )
    $body.createFixture(pl.Polygon(this._visionArcPath), {
      filterGroupIndex: -1
    }, 1)


    this.$body = $body

    this.angle = this.startParams.angle || 0
    this.position = this.startParams.position || Vec2()
  }


  applyForce (force) {
    var f = this.$body.getWorldVector(Vec2(0.0, -1.0));
    var p = this.$body.getWorldPoint(Vec2(0.0, 2.0));
    this.$body.applyLinearImpulse(f, p, true);
  }

  /**
   * @param {number} impulse
   */
  applyAngularForce (impulse) {
    this.$body.applyAngularImpulse(impulse, true)
  }


  getNearFood() {
    const x          = this.position.x
    const y          = this.position.y
    const angle      = this.angle
    const resultList = {}

    let pathArea = this._visionArcPath
    pathArea = pathArea.map((_point) => {
      return _rotatePoint(
        pathArea[0].x + x,
        pathArea[0].y + y,
        _point.x + x,
        _point.y + y,
        angle
      );
    });


    // draw path
    // const $body = this.world.$body.createDynamicBody({
    //   linearDamping: 1.5,
    //   angularDamping: 1
    // });
    // $body.createFixture(pl.Polygon(pathArea), {
    //   filterGroupIndex: -1
    // }, 1)
    // setTimeout(() => this.world.$body.destroyBody($body), 50)


    this.world.getCollectionSubjects('food')
      .filter((item) => {
        if (!item) return

        const item_x = item.position.x
        const item_y = item.position.y
        const isInArea = _isPointInPoly(pathArea, item.position);

        if (isInArea) {
          const dist = Math.sqrt(Math.pow((x - item_x), 2) + Math.pow((y - item_y), 2));
          resultList[dist] = item;
        }
      })

    const minKey = Math.min.apply(Math, Object.keys(resultList));
    return resultList[minKey] || null;
  }


  clone () {
    let params = Object.assign({}, this.startParams);
    params = Object.assign(params, {
      position: this.position,
      angle: this.angle
    });

		let newEntity = new Agent(params);
		newEntity.brain.dispose();
		newEntity.brain = this.brain.clone();

		return newEntity;
  }

  crossover(partner) {
    let parentA_in_dna = this.brain.input_weights.dataSync();
    let parentA_out_dna = this.brain.output_weights.dataSync();
    let parentB_in_dna = partner.brain.input_weights.dataSync();
    let parentB_out_dna = partner.brain.output_weights.dataSync();

    let mid = Math.floor(Math.random() * parentA_in_dna.length);
    let child_in_dna = [...parentA_in_dna.slice(0, mid), ...parentB_in_dna.slice(mid, parentB_in_dna.length)];
    let child_out_dna = [...parentA_out_dna.slice(0, mid), ...parentB_out_dna.slice(mid, parentB_out_dna.length)];

    let child = this.clone();
    let input_shape = this.brain.input_weights.shape;
    let output_shape = this.brain.output_weights.shape;

    child.brain.dispose();

    child.brain.input_weights = tf.tensor(child_in_dna, input_shape);
    child.brain.output_weights = tf.tensor(child_out_dna, output_shape);

    return child;
  }

  mutate() {
    function fn(x) {
      if (random(1) < 0.05) {
        let offset = randomGaussian() * 0.5;
        let newx = x + offset;
        return newx;
      }
      return x;
    }

    let ih = this.brain.input_weights.dataSync().map(fn);
    let ih_shape = this.brain.input_weights.shape;
    this.brain.input_weights.dispose();
    this.brain.input_weights = tf.tensor(ih, ih_shape);

    let ho = this.brain.output_weights.dataSync().map(fn);
    let ho_shape = this.brain.output_weights.shape;
    this.brain.output_weights.dispose();
    this.brain.output_weights = tf.tensor(ho, ho_shape);
  }

  add_to_world () {
    this.init()
  }

  // TODO: use food instead of score
  adjust_score() {
		// let score = this.upper_left_leg.position.x
		// this.score = score > 0 ? score : 0.001
	}

  // think(boundary) {
	// 	let ground = boundary.ground;
	// 	let distance_from_ground = ground.position.y - ((this.upper_left_leg.position.y + this.upper_right_leg.position.y + this.lower_right_leg.position.y + this.lower_left_leg.position.y) / 4)
	// 	let torque = this.upper_left_leg.angularVelocity + this.upper_right_leg.angularVelocity + this.lower_right_leg.angularVelocity + this.lower_left_leg.angularVelocity;
	// 	let vx = this.upper_left_leg.velocity.x + this.upper_right_leg.velocity.x + this.lower_right_leg.velocity.x + this.lower_left_leg.velocity.x;
	// 	let vy = this.upper_left_leg.velocity.y + this.upper_right_leg.velocity.y + this.lower_right_leg.velocity.y + this.lower_left_leg.velocity.y;

  //   let input = [distance_from_ground / width, vx / 4, vy / 4, torque / 4];

	// 	let result = this.brain.predict(input);

	// 	// this.move_m1(result[0]);
	// 	this.move_m2(result[0]);
	// 	this.move_m3(result[1]);
	// }


  update () {
    var x           = this.x();
    var y           = this.y();
    var angle       = this.angle();
    var nearFood    = this.getNearFood();
    var angleToFood = 0;

    if (this.hasCollision(nearFood)){
      this.eat(nearFood);
      nearFood = undefined;
    } else if (nearFood) {
      var pointSelf      = new SVG.math.Point(x, y);
      var pointFood      = new SVG.math.Point(nearFood.x(), nearFood.y());
      var pointDirection = new SVG.math.Point(
        x + 20 * Math.sin( _toRadians(angle) ),
        y - 20 * Math.cos( _toRadians(angle) )
      );

      var absAngleToFood = _toDegrees(SVG.math.angle(pointSelf, pointFood)) + 90;
      absAngleToFood = absAngleToFood >= 360 ? absAngleToFood - 360 : absAngleToFood;

      var absAngleDirection = _toDegrees(SVG.math.angle(pointSelf, pointDirection)) + 90;
      absAngleDirection = absAngleDirection >= 360 ? absAngleDirection - 360 : absAngleDirection;

      angleToFood = Math.abs(absAngleToFood - absAngleDirection);
      var sign = absAngleToFood > absAngleDirection ? 1 : -1;

      if (angleToFood > 180) {
        angleToFood = 180 - (angleToFood - 180);
        sign = sign === -1 ? 1 : -1;
      }

      angleToFood *= sign;
    }


    var rawData = {
      isSeeFood      : !!nearFood,
      angleToFood    : angleToFood,
      distanceToFood : this.distanceTo(nearFood),
    };


    // let input = [distance_from_ground / width, vx / 4, vy / 4, torque / 4];
		// let result = this.brain.predict(input);


    var normalisedData   = this.normalizeBrainData(rawData);
    var result = this.activateBrain(normalisedData);
    // var result = this.getBrainSignal();
    var denormalisedData = this.denormalizeBrainData(result);

    // log('\nrawData', rawData)
    // log('normalisedData', normalisedData)
    // log('result', result)
    // log('denormalisedData', denormalisedData)

    this.angle(angle + denormalisedData.angle);
    this.speed(denormalisedData.speed);
    this.move();
  }

  eat (food) {
    if (!food) return
    food.destroy()
    // this.$body.m_force = Vec2.zero()
    this.incrementScore()
  }

  incrementScore() {
    this.score++
    // this.$element.get(2).text(new String(this._score));

    // if (this.group) {
      // this.group.incrementScore();
    // }
  }


  kill () {
    this.world.$body.destroyBody(this.$body)

		// Dispose its brain
		this.brain.dispose();
  }

}





function _createVisionArcPath(x, y, r, startAngle, endAngle) {
  startAngle = _toRadians(startAngle);
  endAngle = _toRadians(endAngle);

  if(startAngle > endAngle){
    const s = startAngle;
    startAngle = endAngle;
    endAngle   = s;
  }
  if (endAngle - startAngle > Math.PI * 2 ) {
    endAngle = Math.PI * 1.99999;
  }

  const quarterAngle = _toDegrees(startAngle) / 2

  // var largeArc = endAngle - startAngle <= Math.PI ? 0 : 1;


  // if (!isPointsArray) {
  //   return [
  //     'M', x, y,
  //     'L', x+Math.cos(startAngle)*r, y-(Math.sin(startAngle)*r),
  //     'A', r, r, 0, 0, 1, x+Math.cos(endAngle)*r, y-(Math.sin(endAngle)*r),
  //     'L', x, y
  //     ].join(' ');
  // } else {
  return [
    Vec2(x, y),
    Vec2(x + Math.cos(startAngle) * r, y - (Math.sin(startAngle) * r)),
    Vec2(x + Math.cos(_toRadians(360 - quarterAngle)) * r, y - (Math.sin(_toRadians(360 - quarterAngle)) * r)),
    Vec2(x + Math.cos(0) * r, y - (Math.sin(0) * r)),
    Vec2(x + Math.cos(_toRadians(quarterAngle)) * r, y - (Math.sin(_toRadians(quarterAngle)) * r)),
    Vec2(x + Math.cos(endAngle) * r, y - (Math.sin(endAngle) * r)),
    Vec2(x, y)
  ];
  // }
}
