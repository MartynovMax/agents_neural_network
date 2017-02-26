define(function (require) {
  'use strict';

  var Agent = require('Agent');
  var Food  = require('Food');

  // constructor
  function Canvas($parentEl, inputData) {
    var self = this;

    // Public properties, assigned to the instance ('this')
    this.HTML_ID       = this.DEFAULT.HTML_ID;
    this.$parentEl     = $parentEl;
    this.$element      = undefined;
    this.$body         = undefined;
    this.$bodyRect     = undefined;
    this.$grid         = undefined;
    this.$background   = undefined;
    this.styles        = this.DEFAULT.styles;
    this._loopInterval = undefined;


    /*
     * List of Classes on the canvas. 
     * Here should be stored all elements
     * 
     * key {string} - '{class name}:{id}', eq. 'Agent:akr5-sd89-12cv-s5f8'
     * value {class} - link on a class
     */
    this._elementsList = {};

    // coordinates of the cursor
    this._cx = 0;
    this._cy = 0;

    setTimeout(function(){
      this.render();
      this.renderData(inputData);
      this.setListeners();
      this.loopStart();
    }.bind(this));
  }


  var _class = Canvas;

  _class.prototype.DEFAULT = {
    HTML_ID: 'canvas-wrapper',
    HTML_CLASS: 'canvas-wrapper',
    BODY_HTML_ID: 'canvas-body',
    BODY_RECT_CLASS: 'bodyRect',
    BACKGROUND_HTML_ID: 'canvas-background',
    CACHE_TABLE_NAME: 'Canvas',
    width: 900,
    height: 500,
    LOOP_INTERVAL: 50,
    styles: {
      background: '#fff',
      fill: {
        color: 'white',
      },
      stroke: {
        color: '#56aaff',
        opacity: 1,
        width: 1
      },
    },
  };

  _class.prototype.EVENTS = {
    CHANGE : '_onchange',
    DESTROY: 'destroy',
  };


  // public methods
  _class.prototype.cx     = cx;
  _class.prototype.cy     = cy;
  _class.prototype.width  = width;
  _class.prototype.height = height;

  _class.prototype.render    = render;
  _class.prototype.redraw    = redraw;
  _class.prototype.loopStart = loopStart;
  _class.prototype.loopStop  = loopStop;

  _class.prototype.createFood = createFood;

  _class.prototype.destroy      = destroy;
  _class.prototype.setListeners = setListeners;
  _class.prototype.renderData   = renderData;
  _class.prototype.fire         = fire;

  _class.prototype.findEl           = findEl;
  _class.prototype.findCollection   = findCollection;
  _class.prototype.addEl            = addEl;
  _class.prototype.removeEl         = removeEl;
  _class.prototype.getNearFood      = getNearFood;

  _class.prototype.generateInstanceIDByObject  = generateInstanceIDByObject;
  _class.prototype.generateInstanceIDByDetails = generateInstanceIDByDetails;

  _class.prototype.isInsideBody = isInsideBody;

  return _class;




  // coordinate of the cursor
  function cx() {
    return this._cx;
  }

  // coordinate of the cursor
  function cy() {
    return this._cy;
  }



  function width(value) {
    if (value) {
      this.$element.width(value);
      return value;
    } else {
      return this.$element.width();
    }
  }


  function height(value) {
    if (value) {
      this.$element.height(value);
      return value;
    } else {
      return this.$element.height();
    }
  }



  function loopStart() {
    var LOOP_MAX = Infinity;
    // var LOOP_MAX = 1;
    var loopCounter = 0;

    this._loopInterval = setInterval(function(){
      if (loopCounter >= LOOP_MAX) return this.loopStop();
      if (LOOP_MAX !== Infinity) loopCounter++;

      __updateAllInArray.call(this, 'Agent');
      __updateAllInArray.call(this, 'Food');
    }.bind(this), this.DEFAULT.LOOP_INTERVAL);
  }



  function __updateAllInArray(collectionName){
    this.findCollection(collectionName)
      .forEach(function(item) {
        if (item) item.update();
      });
  }


  function loopStop() {
    if (!this._loopInterval) return undefined;
    clearInterval(this._loopInterval);
  }



  function renderData(data) {
    var _agents = data.agents
    var _foods  = data.foods

    if (!Array.isArray(_agents) || !_agents.length) return undefined;
    var self  = this;
    var agents = angular.copy(_agents);
    var foods  = angular.copy(_foods);

    agents.map(function(agent) {
      return new Agent(self, agent.attrs, agent.params, agent.brain);
    });

    foods.map(function(food) {
      return new Food(self, food.attrs, food.params);
    });
  }


  function createFood() {
    return new Food(
      this, 
      _randomInteger(0, this.width()),
      _randomInteger(0, this.height())
    );
  } 




  function render() {
    var self = this;
    var $parentEl = this.$parentEl;
    var width     = 0;
    var height    = 0;

    $parentEl.setAttribute('id', self.HTML_ID);
    $parentEl.classList = self.DEFAULT.HTML_CLASS;

    // disable text selection
    $parentEl.style['-webkit-touch-callout'] = 'none';
    $parentEl.style['-webkit-user-select']   = 'none';
    $parentEl.style['-khtml-user-select']    = 'none';
    $parentEl.style['-moz-user-select']      = 'none';
    $parentEl.style['-ms-user-select']       = 'none';
    $parentEl.style['user-select']           = 'none';

    $parentEl.style['position'] = 'absolute';

    var margin_top     = parseFloat($parentEl.style['margin-top'], 10) || 0;
    var margin_right   = parseFloat($parentEl.style['margin-right'], 10) || 0;
    var margin_bottom  = parseFloat($parentEl.style['margin-bottom'], 10) || 0;
    var margin_left    = parseFloat($parentEl.style['margin-left'], 10) || 0;

    var padding_top    = parseFloat($parentEl.style['padding-top'], 10) || 0;
    var padding_right  = parseFloat($parentEl.style['padding-right'], 10) || 0;
    var padding_bottom = parseFloat($parentEl.style['padding-bottom'], 10) || 0;
    var padding_left   = parseFloat($parentEl.style['padding-left'], 10) || 0;


    width  = $parentEl.offsetWidth - margin_right - margin_left - padding_right - padding_left;
    height = $parentEl.offsetHeight - margin_top - margin_bottom - padding_top - padding_bottom;

    if (!height || !width) {
      console.error('One side of the SVG canvas equal 0. Width:', width, 'Height:', height);
    }

    var backgroundEl = document.createElement('div');
    backgroundEl.setAttribute('id', self.DEFAULT.BACKGROUND_HTML_ID);
    backgroundEl.style['position']   = 'absolute';
    backgroundEl.style['height']     = height + 'px';
    backgroundEl.style['width']      = width + 'px';
    backgroundEl.style['background'] = this.DEFAULT.styles.background;
    $parentEl.appendChild(backgroundEl);
    var $background = SVG(self.DEFAULT.BACKGROUND_HTML_ID)
      .size(width, height);


    var bodyEl = document.createElement('div');
    bodyEl.setAttribute('id', self.DEFAULT.BODY_HTML_ID);
    bodyEl.style['position'] = 'absolute';
    bodyEl.style['height']   = height + 'px';
    bodyEl.style['width']    = width + 'px';
    $parentEl.appendChild(bodyEl);
    var $bodyElement = SVG(self.DEFAULT.BODY_HTML_ID)
      .size(width, height);

    var $bodyRect = $bodyElement
      .rect(width, height)
      .fill('transparent')

    var $bodyNested = $bodyElement
      .nested() 
      .width(width)
      .height(height);

    this.$element    = $bodyElement;
    this.$body       = $bodyNested;
    this.$bodyRect   = $bodyRect;
    this.$background = $background;
  }



  function redraw() {
    var self = this;
    var $parentEl = this.$parentEl;
    var width     = $parentEl.offsetWidth;
    var height    = $parentEl.offsetHeight;

    var bodyEl = document.getElementById(self.DEFAULT.BODY_HTML_ID);   
    bodyEl.style['width']  = self.$parentEl.offsetWidth + 'px';
    bodyEl.style['height'] = self.$parentEl.offsetHeight + 'px';
    this.$bodyRect.width(self.$parentEl.offsetWidth);
    this.$bodyRect.height(self.$parentEl.offsetHeight);
    this.$element.width(self.$parentEl.offsetWidth);
    this.$element.height(self.$parentEl.offsetHeight);
  }


  // pass here coordinates related to the page, like: e.pageX and e.pageY
  function isInsideBody(x, y) {
    if (typeof(x) !== 'number' || typeof(y) !== 'number') return false;
    var self = this;
    var bodyRect = document.body.getBoundingClientRect(),
      elemRect   = self.$parentEl.getBoundingClientRect(),
      offsetTop  = elemRect.top - bodyRect.top,
      offsetLeft = elemRect.left - bodyRect.left;

    var x1 = offsetLeft;
    var y1 = offsetTop;
    var x2 = x1 + self.$bodyRect.bbox().width;
    var y2 = y1 + self.$bodyRect.bbox().height;
    return x > x1 && x < x2 && y > y1 && y < y2;
  }





  function setListeners() {
    var self = this;

    window.addEventListener('resize', _window_resize);
    self.$bodyRect.on('mousedown', _mousedown);
    self.$bodyRect.on('mouseup', _mouseup);
    self.$element.on(self.EVENTS.CHANGE, _change);
    self.$element.on('mousemove', _mousemove);
    self.$element.on(self.EVENTS.DESTROY, _destroy);


    function _window_resize() {
      self.redraw();
    }


    function _mousedown(e) {
    }


    function _mouseup() {
    }


    function _mousemove(e) {
      if (!e.target || !e.target.id) return undefined;
      var cx = e.pageX;
      var cy = e.pageY;

      var bodyRect   = document.body.getBoundingClientRect(),
          elemRect   = self.$parentEl.getBoundingClientRect(),
          offsetTop  = elemRect.top - bodyRect.top,
          offsetLeft = elemRect.left - bodyRect.left;

      var zoom = self.$panZoom ? self.$panZoom.getZoom() : 1;    
      var panx = self.$panZoom ? self.$panZoom.getPan().x : 0;
      var pany = self.$panZoom ? self.$panZoom.getPan().y : 0;

      // updation of the cursor coordinates
      var __cx = cx - panx - offsetLeft;
      __cx *= 1 / zoom;

      var __cy = cy - pany - offsetTop;
      __cy *= 1 / zoom;

      self._cx = __cx;
      self._cy = __cy;

      // updation of the hovered element
      self.$hoveredElement = e.target;
    }


    function _change(data) {
      // log('on canvas changed')
    }


    function _destroy() {
      window.removeEventListener('resize', _window_resize);
      self.$bodyRect.off();
      self.$element.off(self.EVENTS.CHANGE, _change);
      self.$element.off('mousemove', _mousemove);
      self.$element.off(self.EVENTS.DESTROY, _destroy);
    }
  }



  function fire(eventName, data) {
    return this.$element.fire(eventName, data);
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


  // TODO: not in use
  function getNearFood(x, y) {
    var collection = this.findCollection('Food');
    var resultList = {};

    collection.forEach(function(item) {
      if (!item) return undefined;

      var x1 = x; 
      var y1 = y; 

      var x2 = item.x(); 
      var y2 = item.y(); 

      var dist = Math.sqrt( Math.pow((x1-x2), 2) + Math.pow((y1-y2), 2) );
      resultList[dist] = item;
    });  

    var keys   = Object.keys(resultList);
    var minKey = Math.min.apply(Math, keys);
    return resultList[minKey] || null;
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




  function destroy() {
    log('Canvas.destroy')
  }

});
