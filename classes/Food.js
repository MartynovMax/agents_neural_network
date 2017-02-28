define(function (require) {
  'use strict';

  var Entity = require('Entity');
  var Agent  = require('Agent');
    
  _extendClass(Food, Entity);


  function Food(_canvas, attrs, params) {
    var self = this;
    this.super();

    if (!attrs) attrs = {};
    if (!params) params = {};

    this._canvas  = _canvas;
    this._x       = attrs.x || 0;
    this._y       = attrs.y || 0;
    this._speed   = _isNum(attrs.speed) ? attrs.speed : this.DEFAULT.attrs.speed;
    this._angle   = _isNum(attrs.angle) ? attrs.angle : this.DEFAULT.attrs.angle;

    this._isAllowMove = _isBool(params.isAllowMove) ? params.isAllowMove : this.DEFAULT.params.isAllowMove;

    this.$element = undefined;


    this.render();
    this._canvas.addEl(this);
  }


  var _class = Food;

  _class.prototype.DEFAULT = {
    attrs: {
      speed        : 3,
      angle        : _randomInteger(0, 360),
      visionAngle  : 110,
      visionRadius : 220,
    },
    params: {
      isAllowMove: true,
    },
    body: {
      size: 10,
      fill: '#79aa41',
    },
    line: {
      width: 3,
      height: 13,
      fill: '#79aa41',
    }
  };

  _class.prototype.EVENTS = {
    DESTROY: 'destroy',
  }


  _class.prototype.move    = move;
  _class.prototype.render  = render;
  _class.prototype.update  = update;
  _class.prototype.destroy = destroy;

  _class.prototype.isOutFromCanvas = isOutFromCanvas;

  return _class;



  function update() {
    if (this._isAllowMove) {
      this.angle(
        this.angle() + (_randomInteger(-20, 20))
      );
      this.speed(
        _randomInteger(0.3, 1)
      );
      this.move();
    }
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
          x = this._canvas.width() - this.width();
        }
      }
      if (isOutFromCanvas === 'y') {
        if (this.y() < y) {
          y = this.height();
        } else {
          y = this._canvas.height() - this.height();
        }
      }
    } 

    this.x(x);
    this.y(y);
  }


  function isOutFromCanvas(x, y) {
    var width  = this._canvas.width();
    var height = this._canvas.height();

    if (x <= this.width()/2 || x >= width) {
      return 'x';
    }
    if (y <= this.height()/2 || y >= height) {
      return 'y';
    }
    return false;
  }



  function render() {
    var $draw    = this._canvas.$element;
    var $element = $draw.group();
    var $body    = undefined;
    var $line    = undefined;
    var $name    = undefined;

    $line = $element
      .rect()
      .x(-(this.DEFAULT.line.width / 2))
      .y(-this.DEFAULT.line.height)
      .width(this.DEFAULT.line.width)
      .height(this.DEFAULT.line.height)
      .fill(this.DEFAULT.line.fill);

    $body = $element
      .circle()
      .radius(this.DEFAULT.body.size)
      .center(0, 0)
      .fill(this.DEFAULT.body.fill);

    $name = $element
      .text('Hello world!');

    if ($name) {
      $name
        .x(5)
        .y(-this.DEFAULT.line.height - 5)
        .width(this.DEFAULT.line.width)
        .height(this.DEFAULT.line.height)
        .fill(this.DEFAULT.line.fill);
    }  

    $element.x(this._x);
    $element.y(this._y);
    $element.get(1).rotate(this._angle, 0, 0);


    var words = [
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      'A-a-a-a!',
      'No-no-no...',
      'Ha-ha!',
      'O! Dollar!',
      'Who is here?',
      'Bad day!',
    ];

    var interval = setInterval(function(){
      if (!$name) return clearInterval(interval);
      $name.text(words[ _randomInteger(0, words.length) ]);
    }, 2000)

    this.$element = $element;
  }


  function destroy() {
    this.$element.remove();
    this.$element.fire(this.EVENTS.DESTROY);
    this._canvas.removeEl(this);
    this._canvas.createFood();
  }



});
