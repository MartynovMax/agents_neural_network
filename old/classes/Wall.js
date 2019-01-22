define(function (require) {
  'use strict';

  var Entity = require('Entity');
    
  _extendClass(Wall, Entity);

  // constructor
  function Wall(map, attrs, params) {
    var self = this;
    this.super();

    if (!attrs) attrs = {};
    if (!params) params = {};

    this.map     = map;
    this._x      = attrs.x || 0;
    this._y      = attrs.y || 0;
    this._width  = attrs.width || this.DEFAULT.attrs.width;
    this._height = attrs.height || this.DEFAULT.attrs.height;

    this.$element = undefined;

    this.render();
    this.map.addEl(this);
  }


  var _class = Wall;

  _class.prototype.DEFAULT = {
    attrs: {
      width: 15,
      height: 15,
    },
    params: {},
    body: {
      fill: '#4494AA',
    },
  };

  _class.prototype.EVENTS = {
    DESTROY: 'destroy',
  }


  _class.prototype.render  = render;
  _class.prototype.update  = update;
  _class.prototype.destroy = destroy;

  return _class;



  function update() {
    return undefined;
  }



  function render() {
    var $draw    = this.map.$element;
    var $element = $draw.group();
    var $body    = undefined;
    var $name    = undefined;

    $body = $element
      .rect(this._width, this._height)
      .fill(this.DEFAULT.body.fill);

    $element.x(this._x);
    $element.y(this._y);

    this.$element = $element;
  }


  function destroy() {
    this.$element.remove();
    this.$element.fire(this.EVENTS.DESTROY);
    this.map.removeEl(this);
  }



});
