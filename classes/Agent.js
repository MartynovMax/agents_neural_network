define(function (require) {
  'use strict';

  var NeuralNetwork = require('nn/NeuralNetwork');
  var Point         = require('Point');
  var Entity        = require('Entity');
  var Group         = require('Group');

  _extendClass(Agent, Entity);


  function Agent(_canvas, attrs, params, brain, group) {
    var self = this;
    this.super();

    if (!attrs) attrs = {};
    if (!params) params = {};

    this._canvas       = _canvas;
    this._x            = attrs.x || 0;
    this._y            = attrs.y || 0;
    this._speed        = _isNum(attrs.speed) ? attrs.speed : this.DEFAULT.params.speed;
    this._score        = 0;
    this._angle        = _isNum(attrs.angle) ? attrs.angle : _randomInteger(0, 360);
    this._visionAngle  = _isNum(attrs.visionAngle) ? attrs.visionAngle : this.DEFAULT.attrs.visionAngle;
    this._visionRadius = _isNum(attrs.visionRadius) ? attrs.visionRadius : this.DEFAULT.attrs.visionRadius;
    
    this.$element      = undefined;
    this.$visionArea   = undefined;
    this.brain         = undefined;
    this.group         = undefined;

    if (brain) {
      this.setBrain(brain);
    } else {
      this.setBrain(new NeuralNetwork());
    }

    if (group) {
      this.setGroup(group);
    }


    this.render();
    this._canvas.addEl(this);
  }


  var _class = Agent;

  _class.prototype.DEFAULT = {
    SPEED_MAX: 8,
    attrs: {
      speed        : 0,
      angle        : 0,
      visionAngle  : 110,
      visionRadius : 220,
    },
    params: {},
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


  _class.prototype.EVENTS = {
    DESTROY: 'destroy',
  }



  _class.prototype.render  = render;
  _class.prototype.update  = update;
  _class.prototype.destroy = destroy;

  _class.prototype.eat             = eat;
  _class.prototype.incrementScore  = incrementScore;

  _class.prototype.normalizeData   = normalizeData;
  _class.prototype.denormalizeData = denormalizeData;
  _class.prototype.activateBrain   = activateBrain;
  _class.prototype.getBrainSignal  = getBrainSignal;
  _class.prototype.setBrain        = setBrain;

  _class.prototype.setGroup        = setGroup;
  _class.prototype.getGroup        = getGroup;

  _class.prototype.hasCollision    = hasCollision;
  _class.prototype.getNearFood     = getNearFood;
  _class.prototype.distanceTo      = distanceTo;

  return _class;





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
    var result = this.activateBrain(normalisedData);
    // var result = this.getBrainSignal();
    var denormalisedData = this.denormalizeData(result);

    // log('\nrawData', rawData)
    // log('normalisedData', normalisedData)
    // log('result', result)
    // log('denormalisedData', denormalisedData)

    this.angle(angle + denormalisedData.angle);
    this.speed(denormalisedData.speed);
    this.move();
  }


  // TODO: validate me
  function activateBrain(dataObj) {
    // this.brain.putSignalToNeuron(0, dataObj.isSeeFood);
    // this.brain.putSignalToNeuron(1, dataObj.angleToFood);
    // this.brain.putSignalToNeuron(2, dataObj.distanceToFood);
    return this.brain.activate(dataObj);
  }



  function getBrainSignal() {
    return {
      angle: this.brain.getAfterActivationSignal(0), 
      speed: this.brain.getAfterActivationSignal(1),
    };
  }


  
  function setBrain(neuralNetwork){
    if ( !(neuralNetwork instanceof NeuralNetwork) ) {
      throw Error('Incorrect instance');
    }
    this.brain = neuralNetwork;
  }



  function setGroup(group){
    if ( !(group instanceof Group) ) {
      throw Error('Incorrect instance');
    }
    this.group = group;
    this.setBrain(group.brain);
    this.group.add(this);
  }



  function getGroup(){
    return this.group;
  }



  function getNearFood() {
    var x          = this.x();
    var y          = this.y();
    var angle      = this.angle();
    var canvas     = this._canvas;
    var collection = canvas.findCollection('Food');
    var resultList = {};

    var pointArcStart = new Point(x + this.$visionArea._array.value[1][1], y + this.$visionArea._array.value[1][2]);
    var pointMiddle   = new Point(x, y -this._visionRadius);
    var pointArcEnd   = new Point(x + this.$visionArea._array.value[2][6], y + this.$visionArea._array.value[2][7]);

    var areaPath = [];
    areaPath[0]  = new Point(x, y);  
    areaPath[1]  = pointArcStart;  
    areaPath[2]  = _rotatePoint(x, y, pointMiddle.x, pointMiddle.y, -(this._visionAngle/4));  
    areaPath[3]  = pointMiddle;  
    areaPath[4]  = _rotatePoint(x, y, pointMiddle.x, pointMiddle.y, (this._visionAngle/4));
    areaPath[5]  = pointArcEnd;  

    areaPath = areaPath.map(function(_point){
      return _rotatePoint(areaPath[0].x, areaPath[0].y, _point.x, _point.y, angle);
    });


    // var _drawArea = this._canvas.$element
    //   .path()
    //   .M(areaPath[0].x, areaPath[0].y)
    //   .L(areaPath[1].x, areaPath[1].y)
    //   .L(areaPath[2].x, areaPath[2].y)
    //   .L(areaPath[3].x, areaPath[3].y)
    //   .L(areaPath[4].x, areaPath[4].y)
    //   .L(areaPath[5].x, areaPath[5].y)
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
    var $draw       = this._canvas.$element;
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
    this._canvas.removeEl(this);
  }


  function eventFire(event) {
    if (!event) return undefined;
    return this.$element.fire(event);
  }


  function eventOn(event) {
    if (!event) return undefined;
    return this.$element.on(event);
  }


  function eventOff(event) {
    return this.$element.off(event);
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
    this.incrementScore();
  }


  function incrementScore() {
    this._score++;
    this.$element.get(2).text(new String(this._score));

    if (this.group) {
      this.group.incrementScore();
    }
  }


  function distanceTo(item) {
    if (!item) return 0;
    var pointSelf = new SVG.math.Point(this.x(), this.y());
    var pointItem = new SVG.math.Point(item.x(), item.y());
    return Math.sqrt(
      new SVG.math.Line(pointSelf, pointItem).segmentLengthSquared()
    );
  }



});
