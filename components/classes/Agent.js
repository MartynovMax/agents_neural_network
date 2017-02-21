(function(_window){
  'use strict';
  _window.Agent = Agent;


  function Agent(canvas, x, y, speed) {
    var self = this;

    this.id            = _generateID();
    this._x            = x;
    this._y            = y;
    this._speed        = speed || 0;
    this._angle        = Math.round(Math.random() * 360);
    this._loopInterval = undefined;
    this.canvas        = canvas;
    this.$element      = undefined;
    this.NeuralNetwork = new NeuralNetwork();

    this.canvas.addEl(this);

    this.render();
    this.loop();
  }


  var _class = Agent;

  _class.prototype.DEFAULT = {
    LOOP_INTERVAL: 50,
    body: {
      size: 10,
      fill: '#999',
    },
    line: {
      width: 3,
      height: 15,
      fill: '#000',
    }
  };


  _class.prototype.x = x;
  _class.prototype.y = y;
  _class.prototype.rx = rx;
  _class.prototype.ry = ry;
  _class.prototype.speed = speed;
  _class.prototype.angle = angle;

  _class.prototype.loop     = loop;
  _class.prototype.loopStop = loopStop;

  _class.prototype.render  = render;
  _class.prototype.destroy = destroy;
  _class.prototype.move    = move;

  _class.prototype.distanceTo = distanceTo;



  function x(val) {
    if (val) {
      this._x = val;
      this.$element.x(this._x);
    } else {
      return this._x;
    }
  }

  function y(val) {
    if (val) {
      this._y = val;
      this.$element.y(this._y);
    } else {
      return this._y;
    }
  }

  function rx() {
    return -Math.sin(this._angle);
  }

  function ry() {
    return Math.cos(this._angle);
  }

  function speed(val) {
    if (val) {
      this._speed = val;
    } else {
      return this._speed;
    }
  }

  function angle(val) {
    if (val) {
      this._angle = val;
      this.$element.get(1).rotate(this._angle, 0, 0);
    } else {
      return this._angle;
    }
  }


  function loop() {
    var loopMax = 300;
    var loopCounter = 0;

    this._loopInterval = setInterval(function(){
      if (loopCounter >= loopMax) return this.loopStop();
      loopCounter++;

      var nearFood  = this.canvas.getNearFood(this.x(), this.y());
      var pointSelf = new SVG.math.Point(this.x(), this.y());
      var pointFood = new SVG.math.Point(nearFood.x(), nearFood.y());

      var pointDirection = new SVG.math.Point(
        this.x() + 20 * Math.sin( _toRadians(this.angle()) ),
        this.y() - 20 * Math.cos( _toRadians(this.angle()) )
      );


      var absAngleToFood = _toDegrees(SVG.math.angle(pointSelf, pointFood)) + 90;
      absAngleToFood = absAngleToFood >= 360 ? absAngleToFood - 360 : absAngleToFood;


      var absAngleDirection = _toDegrees(SVG.math.angle(pointSelf, pointDirection)) + 90;
      absAngleDirection = absAngleDirection >= 360 ? absAngleDirection - 360 : absAngleDirection;


      var diff = Math.abs(absAngleToFood - absAngleDirection);
      var sign = absAngleToFood > absAngleDirection ? 1 : -1;

      if (diff > 180) {
        diff = 180 - (diff - 180); 
        sign = sign === -1 ? 1 : -1;
      }  

      var angleToFood = diff * sign; 

      var _cos  = Math.cos(_toRadians(angleToFood));
      var _acos = _toDegrees(Math.acos(_cos));
      // log('angleToFood', angleToFood, _cos, _acos)
      // this.angle(this.angle() + (_acos * sign) );

      var distanceToFood = this.distanceTo(nearFood);

      // var result = this.NeuralNetwork.train({
      //   angleToFood: _cos
      // });


      var result = this.NeuralNetwork.activate({
        angleToFood: _cos, 
        distanceToFood: 0,
      });
      this.angle(this.angle() + (_toDegrees(Math.acos(result.angleToFood)) * sign) );
      // this.speed(result[1]);
      // this.move();

      // log('result:\n' 
        // , '\tangle:', result.angleToFood, _toDegrees(Math.acos(result.angleToFood)) * sign
        // , '\n\tspeed:', result.distanceToFood
      // )

    }.bind(this), this.DEFAULT.LOOP_INTERVAL);
  }




  function loopStop() {
    // log('loopStop', this.NeuralNetwork.toJSON())

    if (!this._loopInterval) return undefined;
    clearInterval(this._loopInterval);
  }


  function render() {
    var $draw    = this.canvas.$element;
    var $element = $draw.group();
    var $body    = undefined;
    var $line    = undefined;

    $body = $element
      .circle()
      .radius(this.DEFAULT.body.size)
      .center(0, 0)
      .fill(this.DEFAULT.body.fill);

    $line = $element
      .rect()
      .x(-(this.DEFAULT.line.width / 2))
      .y(-this.DEFAULT.line.height)
      .width(this.DEFAULT.line.width)
      .height(this.DEFAULT.line.height)
      .fill(this.DEFAULT.line.fill);

    $element.x(this._x);
    $element.y(this._y);
    $element.get(1).rotate(this._angle, 0, 0);

    this.$element = $element;
  }


  function destroy() {

  }


  function distanceTo(item) {
    var pointSelf = new SVG.math.Point(this.x(), this.y());
    var pointItem = new SVG.math.Point(item.x(), item.y());
    return Math.sqrt(
      new SVG.math.Line(pointSelf, pointItem).segmentLengthSquared()
    );
  }


  function move() {
    var speed = this.speed(); 
    var angle = this.angle(); 

    this.x(this._x + speed * Math.sin(_toRadians(angle)) );
    this.y(this._y - speed * Math.cos(_toRadians(angle)) );
  }



  function _generateID() {
    function r() {
      return Math.random().toString(36).substr(2, 4);
    }
    return r() + '-' + r() + '-' + r() + '-' + r();
  }


})(window);
