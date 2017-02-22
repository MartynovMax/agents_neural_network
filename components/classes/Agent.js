(function(_window){
  'use strict';
  _window.Agent = Agent;


  function Agent(canvas, x, y, speed) {
    var self = this;

    this.id            = _generateID();
    this._x            = x;
    this._y            = y;
    this._speed        = speed || 0;
    this._angle        = _randomInteger(0, 360);
    this.canvas        = canvas;
    this.points        = 0;
    this.$element      = undefined;
    this.NeuralNetwork = new NeuralNetwork();

    this.render();
    this.canvas.addEl(this);
  }


  var _class = Agent;

  _class.prototype.DEFAULT = {
    SPEED_MAX: 10,
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


  _class.prototype.x      = x;
  _class.prototype.y      = y;
  _class.prototype.width  = width;
  _class.prototype.height = height;
  _class.prototype.speed  = speed;
  _class.prototype.angle  = angle;

  _class.prototype.render  = render;
  _class.prototype.update  = update;
  _class.prototype.destroy = destroy;
  _class.prototype.move    = move;

  _class.prototype.eat    = eat;
  _class.prototype.incrementPoints = incrementPoints;

  _class.prototype.normalizeData   = normalizeData;
  _class.prototype.denormalizeData = denormalizeData;

  _class.prototype.hasCollision    = hasCollision;
  _class.prototype.isOutFromCanvas = isOutFromCanvas;
  _class.prototype.distanceTo      = distanceTo;



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


  function width() {
    return this.$element.get(0).bbox().w;
  }


  function height() {
    return this.$element.get(0).bbox().h;
  }


  function speed(val) {
    if (val) {
      if (val > this.DEFAULT.SPEED_MAX) {
        this._speed = this.DEFAULT.SPEED_MAX;
      } else if (val < 0) {
        this._speed = 0;
      } else {
        this._speed = val;
      }
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


  function update() {
    var x           = this.x();
    var y           = this.y();
    var angle       = this.angle();
    var nearFood    = this.canvas.getNearFood(x, y);
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

    var normalisedData   = this.normalizeData(rawData);
    var result           = this.NeuralNetwork.activate(normalisedData);
    var denormalisedData = this.denormalizeData(result);

    // log('\nrawData', rawData)
    // log('normalisedData', normalisedData)
    // log('result', result)
    // log('denormalisedData', denormalisedData)

    this.angle(angle + denormalisedData.angle);
    this.speed(denormalisedData.speed);
    this.move();
  }



  function normalizeData(data){
    if (data.distanceToFood === Infinity) data.distanceToFood = 0;

    return {
      isSeeFood      : !!data.isSeeFood ? 1 : 0, 
      angleToFood    : 1/360 * data.angleToFood, 
      distanceToFood : data.distanceToFood === 0 ? 0 : 1 / data.distanceToFood, 
    };
  }


  function denormalizeData(data){
    return {
      angle: data.angle / (1/360), 
      speed: data.speed * this.DEFAULT.SPEED_MAX, 
    };
  }


  function render() {
    var $draw    = this.canvas.$element;
    var $element = $draw.group();
    var $body    = undefined;
    var $line    = undefined;
    var $name    = undefined;

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


    $name = $element
      .text(new String(this.points))
      .x(5)
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
    this.$element.remove();
    this.$element.fire(this.EVENTS.DESTROY);
    this.canvas.removeEl(this);
  }


  function hasCollision(item) {
    if (!item) return false;

    var r1 = {
      x : item.x(),
      y : item.y(),
      x2: item.x() + item.width(),
      y2: item.y() + item.height(),
    };

    var r2 = {
      x : this.x(),
      y : this.y(),
      x2: this.x() + this.width(),
      y2: this.y() + this.height(),
    };

    return !(r2.x > r1.x2 || 
             r2.x2 < r1.x || 
             r2.y > r1.y2 ||
             r2.y2 < r1.y);
  }


  function eat(item) {
    if (!item) return undefined;
    item.destroy();
    this.speed(0);
    this.incrementPoints();
  }


  function incrementPoints() {
    this.points++;
    this.$element.get(2).text(new String(this.points));
  }


  function distanceTo(item) {
    if (!item) return 0;
    var pointSelf = new SVG.math.Point(this.x(), this.y());
    var pointItem = new SVG.math.Point(item.x(), item.y());
    return Math.sqrt(
      new SVG.math.Line(pointSelf, pointItem).segmentLengthSquared()
    );
  }


  function move() {
    var speed = this.speed(); 
    var angle = this.angle(); 
    var x     = this._x + speed * Math.sin(_toRadians(angle));
    var y     = this._y - speed * Math.cos(_toRadians(angle));

    var isOutFromCanvas = this.isOutFromCanvas(x, y);

    if (isOutFromCanvas) {
      if (isOutFromCanvas === 'x') {
        if (this.x() < x) {
          x = this.width();
        } else {
          x = this.canvas.width() - this.width();
        }
      }
      if (isOutFromCanvas === 'y') {
        if (this.y() < y) {
          y = this.height();
        } else {
          y = this.canvas.height() - this.height();
        }
      }
    } 

    this.x(x);
    this.y(y);
  }


  function isOutFromCanvas(x, y) {
    var width  = this.canvas.width();
    var height = this.canvas.height();

    if (x <= this.width()/2 || x >= width) {
      return 'x';
    }
    if (y <= this.height()/2 || y >= height) {
      return 'y';
    }
    return false;
  }



  function _generateID() {
    function r() {
      return Math.random().toString(36).substr(2, 4);
    }
    return r() + '-' + r() + '-' + r() + '-' + r();
  }


})(window);
