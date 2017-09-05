define(function (require) {
  'use strict';

  var Entity = require('Entity');
  var Agent  = require('Agent');
    
  _extendClass(Food, Entity);

  // constructor
  function Food(map, attrs, params) {
    var self = this;
    this.super();

    if (!attrs) attrs = {};
    if (!params) params = {};

    this.map      = map;
    this._x       = attrs.x || 0;
    this._y       = attrs.y || 0;
    this._speed   = _isNum(attrs.speed) ? attrs.speed : this.DEFAULT.attrs.speed;
    this._angle   = _isNum(attrs.angle) ? attrs.angle : this.DEFAULT.attrs.angle;

    this._isAllowMove = _isBool(params.isAllowMove) ? params.isAllowMove : this.DEFAULT.params.isAllowMove;

    this.$element = undefined;


    this.render();
    this.map.addEl(this);
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


  _class.prototype.render  = render;
  _class.prototype.update  = update;
  _class.prototype.destroy = destroy;

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



  function render() {
    var $draw    = this.map.$element;
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
    this.map.removeEl(this);
    this.map.createFood({
      isAllowMove: this._isAllowMove,
    });
  }



});
