(function(_window){
  'use strict';
  _window.Agent = Agent;


  function Agent(canvas, x, y, speed) {
    var self = this;

    this.id            = _generateID();
    this._x            = x || 0;
    this._y            = y || 0;
    this._speed        = speed || 0;
    this._score        = 0;

    // degrees
    this._angle        = _randomInteger(0, 360);

    // degrees
    this._visionAngle  = 110;
    this._visionRadius = 220;
    
    this.canvas        = canvas;
    this.$element      = undefined;
    this.$visionArea   = undefined;
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
    name: {
      width: 3,
      height: 15,
      fill: '#999',
    },
    vision: {
      line: {
        width: 3,
        height: 15,
        fill: '#353535',
      },
      area: {
        width: 3,
        height: 15,
        fill: {
          color: 'red',
          opacity: 0.05,
        },
      },
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

  _class.prototype.eat             = eat;
  _class.prototype.incrementPoints = incrementPoints;

  _class.prototype.normalizeData   = normalizeData;
  _class.prototype.denormalizeData = denormalizeData;

  _class.prototype.hasCollision    = hasCollision;
  _class.prototype.getNearFood     = getNearFood;
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
    return this.$element.get(1).bbox().w;
  }


  function height() {
    return this.$element.get(1).bbox().h;
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
      this.$element.get(0).rotate(this._angle, 0, 0);
    } else {
      return this._angle;
    }
  }


  function update() {
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




  function getNearFood() {
    var x          = this.x();
    var y          = this.y();
    var angle      = this.angle();
    var canvas     = this.canvas;
    var collection = canvas.findCollection('Food');
    var resultList = {};

    var arcStart       = new Point(this.$visionArea._array.value[1][1], this.$visionArea._array.value[1][2]);
    var arcEnd         = new Point(this.$visionArea._array.value[2][6], this.$visionArea._array.value[2][7]);
    var chordLength    = Math.sqrt(Math.pow(Math.abs(arcStart.x - arcEnd.x), 2) + Math.pow(Math.abs(arcStart.y - arcEnd.y), 2));
    var arcHeigth      = _getArcHeight(this._visionRadius * 2, chordLength)
    var bottomTriangle = 2 * (this._visionRadius-arcHeigth) + Math.cos(_toRadians(this._visionAngle))

    var areaPath = [];
    areaPath[0]  = new Point(x, y);  
    areaPath[1]  = new Point(x - bottomTriangle/2, y -this._visionRadius + arcHeigth);  
    areaPath[2]  = new Point(x, y -this._visionRadius);  
    areaPath[3]  = new Point(x + bottomTriangle/2, y -this._visionRadius + arcHeigth);  

    areaPath = areaPath.map(function(_point){
      return _rotatePoint(areaPath[0].x, areaPath[0].y, _point.x, _point.y, angle);
    });


    // var _drawArea = this.canvas.$element
    //   .path()
    //   .M(areaPath[0].x, areaPath[0].y)
    //   .L(areaPath[1].x, areaPath[1].y)
    //   .L(areaPath[2].x, areaPath[2].y)
    //   .L(areaPath[3].x, areaPath[3].y)
    //   .fill({
    //     color: '#ccc',
    //     opacity: 0.2
    //   });

    var objectsInArea = collection.filter(function(item) {
      if (!item) return undefined;
      var isInArea = _isPointInPoly(areaPath, new Point(item.x(), item.y()));

      if (isInArea) {
        var dist = Math.sqrt( Math.pow((x-item.x()), 2) + Math.pow((y-item.y()), 2) );
        resultList[dist] = item;
      }
    });  

    var minKey = Math.min.apply(Math, Object.keys(resultList));
    return resultList[minKey] || null;
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
    var $draw       = this.canvas.$element;
    var $element    = $draw.group();
    var $body       = undefined;
    var $vision     = undefined;
    var $visionLine = undefined;
    var $visionArea = undefined;
    var $name       = undefined;

    $vision = $element.group();

    $visionArea = $vision
      .path(_createVisionArcPath(
        0, 
        0, 
        this._visionRadius, 
        360 - this._visionAngle / 2, 
        this._visionAngle / 2 
      ))
      .fill(this.DEFAULT.vision.area.fill);

    $visionLine = $vision
      .rect()
      .x(-(this.DEFAULT.vision.line.width / 2))
      .y(-this.DEFAULT.vision.line.height)
      .width(this.DEFAULT.vision.line.width)
      .height(this.DEFAULT.vision.line.height)
      .fill(this.DEFAULT.vision.line.fill);

    $body = $element
      .circle()
      .radius(this.DEFAULT.body.size)
      .center(0, 0)
      .fill(this.DEFAULT.body.fill);

    $name = $element
      .text(new String(this._score))
      .x(this.DEFAULT.body.size*0.8)
      .y(-this.DEFAULT.body.size*1.5)
      .fill(this.DEFAULT.name.fill);

    $element.x(this._x);
    $element.y(this._y);
    $element.get(0).rotate(this._angle, 0, 0);

    this.$element    = $element;
    this.$visionArea = $visionArea;
  }




  function _createVisionArcPath(x, y, r, startAngle, endAngle, isPointsArray) {
    startAngle += 90;
    startAngle = _toRadians(startAngle);
    endAngle   += 90;
    endAngle   = _toRadians(endAngle);

    if(startAngle > endAngle){
      var s      = startAngle;
      startAngle = endAngle;
      endAngle   = s;
    }
    if (endAngle - startAngle > Math.PI*2 ) {
      endAngle = Math.PI*1.99999;
    }
    
    var largeArc = endAngle - startAngle <= Math.PI ? 0 : 1;


    if (!isPointsArray) {
      return ['M', x, y,
              'L', x+Math.cos(startAngle)*r, y-(Math.sin(startAngle)*r), 
              'A', r, r, 0, 0, 1, x+Math.cos(endAngle)*r, y-(Math.sin(endAngle)*r),
              'L', x, y
             ].join(' ');
    } else {
      return [
              new Point(x, y),
              new Point(x+Math.cos(startAngle)*r, y-(Math.sin(startAngle)*r)), 
              new Point(x+Math.cos(endAngle)*r, y-(Math.sin(endAngle)*r)),
              new Point(x, y)
             ];
    }
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
    this._score++;
    this.$element.get(2).text(new String(this._score));
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
