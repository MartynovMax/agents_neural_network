(function(_window){
  'use strict';
  _window.Food = Food;


  function Food(canvas, x, y, speed) {
    var self = this;

    this.id            = _generateID();
    this._x            = x;
    this._y            = y;
    this._speed        = speed || 5;
    this._angle        = Math.round(Math.random() * 360);
    this._loopInterval = undefined;
    this.canvas        = canvas;
    this.$element      = undefined;

    this.render();
    this.loop();
    this.canvas.addEl(this);
  }


  var _class = Food;

  _class.prototype.DEFAULT = {
    LOOP_INTERVAL: 50,
    body: {
      size: 10,
      fill: '#79aa41',
    },
    line: {
      width: 3,
      height: 15,
      fill: '#79aa41',
    }
  };


  _class.prototype.x = x;
  _class.prototype.y = y;
  _class.prototype.speed = speed;
  _class.prototype.angle = angle;

  _class.prototype.move  = move;

  _class.prototype.loop     = loop;
  _class.prototype.loopStop = loopStop;

  _class.prototype.render  = render;
  _class.prototype.destroy = destroy;



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
    var loopMax = Infinity;
    var loopCounter = 0;

    this._loopInterval = setInterval(function(){
      if (loopCounter >= loopMax) return this.loopStop();
      loopCounter++;

      this.angle(
        this.angle() + (_randomInteger(-90, 90))
      );

      this.move();
    }.bind(this), this.DEFAULT.LOOP_INTERVAL);
  }



  function loopStop() {
    if (!this._loopInterval) return undefined;
    clearInterval(this._loopInterval);
  }


  function move() {
    var speed = this.speed(); 
    var angle = this.angle(); 

    this.x(this._x + speed * Math.sin(_toRadians(angle)) );
    this.y(this._y - speed * Math.cos(_toRadians(angle)) );

    // this.x(this._x + this.speed() * -Math.sin(this.angle()));
    // this.y(this._y + this.speed() * Math.cos(this.angle()));
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


  function _generateID() {
    function r() {
      return Math.random().toString(36).substr(2, 4);
    }
    return r() + '-' + r() + '-' + r() + '-' + r();
  }


})(window);
