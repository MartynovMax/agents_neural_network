define(function (require) {
  'use strict';

  // constructor
  function Entity() {
    var self = this;

    this.id      = _generateUID();
    this.map     = undefined;
    this._x      = 0;
    this._y      = 0;
    this._speed  = 0;
    
    // degrees
    this._angle  = 0;
  }


  var _class = Entity;

  _class.prototype.x      = x;
  _class.prototype.y      = y;
  _class.prototype.width  = width;
  _class.prototype.height = height;
  _class.prototype.speed  = speed;
  _class.prototype.angle  = angle;

  _class.prototype.move             = move;
  _class.prototype.hasCollisionWith = hasCollisionWith;
  _class.prototype.isOutFromCanvas  = isOutFromCanvas;
  _class.prototype.getDistanceTo    = getDistanceTo;

  return _class;




  function x(val) {
    if (_isNum(val)) {
      this._x = val;
      this.$element.x(this._x);
    } else {
      return this._x;
    }
  }


  function y(val) {
    if (_isNum(val)) {
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
    if (_isNum(val)) {
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
    if (_isNum(val)) {
      if (val < 0 ) val = Math.abs(val);
      if (val >= 360) {
        val = val%360;
      }
      this._angle = val;
      this.$element.get(0).rotate(this._angle, 0, 0);
    } else {
      return this._angle;
    }
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


  function hasCollisionWith(item) {
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



  function getDistanceTo(item) {
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
      x = this._x;
      y = this._y;
      var margin = 10;

      if (angle >= 0 && angle < 90) {
        this.angle(_randomInteger(90 + margin, 360 - margin));
      } else if (angle >= 90 && angle < 180) {
        this.angle(_randomInteger(180 + margin, 360+90 - margin));
      } else if (angle >= 180 && angle < 270) {
        this.angle(_randomInteger(270 + margin, 360+180 - margin));
      } else if (angle >= 270 && angle < 360) {
        this.angle(_randomInteger(0 + margin, 270 - margin));
      } 
    } 

    this.x(x);
    this.y(y);
  }



  function isOutFromCanvas(x, y) {
    var width  = this.map.width();
    var height = this.map.height();

    if (x <= this.width()/2 || x >= width) {
      return 'x';
    }
    if (y <= this.height()/2 || y >= height) {
      return 'y';
    }
    return false;
  }


});
