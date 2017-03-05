define(function (require) {
  'use strict';

  var Food = require('Food');
  var Wall = require('Wall');

  // constructor
  function _Map(_canvas, attrs, params) {
    var self = this;

    if (!attrs) attrs = {};
    if (!params) params = {};

    this._canvas       = _canvas;
    this._entities     = params.entities || {};
    this.isRandomWalls = params.isRandomWalls || this.DEFAULT.isRandomWalls;

    /*
     * List of Classes on the canvas. 
     * Here should be stored all elements
     * 
     * key {string} - '{class name}:{id}', eq. 'Agent:akr5-sd89-12cv-s5f8'
     * value {class} - link on a class
     */
    this._elementsList = {};


    this.render(params);
  }


  var _class = _Map;

  _class.prototype.DEFAULT = {
    numberWalls: 20,
    attrs: {},
    params: {
      isRandomWalls: true,
    },
  };

  _class.prototype.EVENTS = {
    DESTROY: 'destroy',
  }


  _class.prototype.width  = width;
  _class.prototype.height = height;

  _class.prototype.render  = render;
  _class.prototype.update  = update;
  _class.prototype.destroy = destroy;
  _class.prototype.renderRandomWalls = renderRandomWalls;
  _class.prototype.renderBorderWalls = renderBorderWalls;

  _class.prototype.findEl         = findEl;
  _class.prototype.findCollection = findCollection;
  _class.prototype.addEl          = addEl;
  _class.prototype.removeEl       = removeEl;
  _class.prototype.generateInstanceIDByObject  = generateInstanceIDByObject;
  _class.prototype.generateInstanceIDByDetails = generateInstanceIDByDetails;

  _class.prototype.toJSON   = toJSON;
  _class.prototype.fromJSON = fromJSON;

  _class.prototype.createFood = createFood;

  return _class;



  function width() {
    return this._canvas.width();
  }



  function height() {
    return this._canvas.height();
  }



  function update() {}



  function render(params) {
    var self      = this;
    var padding   = 60;
    var $draw     = this._canvas.$element;
    var $element  = $draw.group();
    this.$element = $element;

    var classes = Object.keys(this._entities);

    classes.forEach(function(className){
      var entityConstructor = require(className);
      __populate(self._entities[className], entityConstructor);
    });

    this.renderBorderWalls();
    if (this.isRandomWalls) {
      this.renderRandomWalls({
        numberWalls: params.numberWalls,
      });
    }
    return undefined;


    function __populate(entities, entityConstructor) {
      if (!_isArray(entities) || entities.length === 0) return undefined;

      entities.forEach(function(entity){
        var className = entityConstructor.name;

        if (className === 'Agent' || className === 'Food') {
          return __createEntityWithCoordinates(entity, entityConstructor);
        } else if (className === 'Group') {
          if (!entity.params) entity.params = {};
          var innerEntities          = entity.params.entities || [];
          var innerEntityConstructor = require(entity.params.entityClass);
          entity.params.entities     = undefined;
          entity.params.entityClass  = undefined;

          var createdEntity = new entityConstructor(
            self, 
            entity.attrs, 
            entity.params 
          );

          innerEntities = innerEntities.map(function(obj){
            if (!obj) obj = {};
            if (!obj.params) obj.params = {};
            obj.params.group = createdEntity;
            return obj; 
          });

          return __populate(innerEntities, innerEntityConstructor);
        }
      });
    }


    /**
    * For Food or Agent
    * @param entity {object} 
    * @param entityConstructor {function}  
    */
    function __createEntityWithCoordinates(entity, entityConstructor){
      var entityClass = undefined;

      if (!entity.attrs || !entity.attrs.x && !entity.attrs.y) {
        if (!entity.attrs) entity.attrs = {};
        entity.attrs.x = _randomInteger(padding, self.width() - padding);
        entity.attrs.y = _randomInteger(padding, self.height() - padding);
      }

      return new entityConstructor(
        self, 
        entity.attrs, 
        entity.params 
      );
    }
  }



  function generateInstanceIDByObject(object) {
    if (!object || !object.id) return undefined;
    var instanceName = object.constructor.name;
    if (!instanceName) return undefined;
    return this.generateInstanceIDByDetails(object.id, instanceName);
  }



  function generateInstanceIDByDetails(objectID, instanceName) {
    if (!objectID) return undefined;
    if (!instanceName) return undefined;
    return instanceName + ':' + objectID;
  }



  function findEl(objectID, instanceName) {
    if (!objectID) throw new Error('Object ID is undefined');
    var key = this.generateInstanceIDByDetails(objectID, instanceName);
    if (!key) throw new Error('Could not generate instance ID');
    return this._elementsList[key];
  }



  function findCollection(instanceName) {
    var self = this;
    if (!instanceName) throw new Error('Collection name is undefined');
    var keys = Object.keys(this._elementsList);

    keys = keys.filter(function(key) {
      if (new RegExp('^' + instanceName).test(key)) return key;
    })
    .map(function (key) {
      return self._elementsList[key];
    });

    return keys;
  }



  function addEl(object, isAddToBody) {
    if (!object) throw new Error('Object is undefined');
    var key = this.generateInstanceIDByObject(object);
    if (!key) throw new Error('Could not generate instance ID');

    if (isAddToBody) {
      this.$body.add(object.$element)
    }

    return this._elementsList[key] = object;
  }



  function removeEl(object) {
    if (!object) throw new Error('Object is undefined');
    var key = this.generateInstanceIDByObject(object);
    if (!key) throw new Error('Could not generate instance ID');
    delete this._elementsList[key];
    return undefined;
  }



  function createFood() {
    var padding = 50;

    return new Food(
      this, 
      {
        x     : _randomInteger(padding, this.width() - padding),
        y     : _randomInteger(padding, this.height() - padding),
        speed : 1
      }
    );
  } 


  
  function renderRandomWalls(options) {
    if (!options) options = {};

    var widthMap    = this.width();
    var heightMap   = this.height();
    var widthWall   = 5;
    var heightWall  = 5;
    var numberWalls = options.numberWalls || this.DEFAULT.numberWalls;
    var padding     = 20;

    var walls = [];

    while (numberWalls > 0) {
      walls.push({
        x: _randomInteger(padding, widthMap - padding),
        y: _randomInteger(padding, heightMap - padding),
      });

      numberWalls -= 1;
    }

    walls.forEach(function(attrs) {
      new Wall(this, attrs);
    }.bind(this));
  }



  function renderBorderWalls() {
    var widthMap   = this.width();
    var heightMap  = this.height();
    var widthWall  = 5;
    var heightWall = 5;

    var walls = [];

    // top
    walls.push({
      x: 0,
      y: 0,
      width: widthMap,
      height: heightWall,
    });

    // right
    walls.push({
      x: widthMap - widthWall,
      y: heightWall,
      width: widthWall,
      height: heightMap - (heightWall * 2),
    });

    // bottom
    walls.push({
      x: 0,
      y: heightMap - heightWall,
      width: widthMap,
      height: heightWall,
    });

    // left
    walls.push({
      x: 0,
      y: heightWall,
      width: widthWall,
      height: heightMap - (heightWall * 2),
    });

    walls.forEach(function(attrs) {
      new Wall(this, attrs);
    }.bind(this));
  }



  function toJSON() {}



  function fromJSON(json) {}



  function destroy() {
    this.$element.remove();
    this.$element.fire(this.EVENTS.DESTROY);
  }



});
