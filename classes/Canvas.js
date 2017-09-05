define(function (require) {
  'use strict';

  var Agent = require('Agent');
  var Food  = require('Food');
  var Group = require('Group');
  var _Map  = require('Map');

  // constructor
  function Canvas($parentEl, inputData) {
    var self = this;

    if (!inputData) inputData = {};

    // Public properties, assigned to the instance ('this')
    this.HTML_ID       = this.DEFAULT.HTML_ID;
    this.$parentEl     = $parentEl;
    this.$element      = undefined;
    this.$body         = undefined;
    this.$bodyRect     = undefined;
    this.$background   = undefined;
    this.styles        = this.DEFAULT.styles;
    this.map           = undefined;
    this._loopInterval = undefined;
    this._loopCounter  = 0;
    this._populationCounter = 0;
    this._populationLastBestScore = 0;
    this._lastBestBrain = 0;
    this._isEnableMutations = true;

    // coordinates of the cursor
    this._cx = 0;
    this._cy = 0;

    setTimeout(function(){
      this.render();
      this.renderMap(inputData.map);
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

    LOOP_INTERVAL: 10,
    // LOOP_INTERVAL          : 40,
    NEW_POPULATION_COUNTER : 1000,
    LOG_POPULATION_NUM     : 1,
    MUTATION_RATE          : 0.3,

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
  _class.prototype.getGroups  = getGroups;

  _class.prototype.destroy      = destroy;
  _class.prototype.setListeners = setListeners;
  _class.prototype.renderMap    = renderMap;
  _class.prototype.fire         = fire;

  _class.prototype.isInsideBody = isInsideBody;

  _class.prototype.setMap      = setMap;
  _class.prototype.getMap      = getMap;

  _class.prototype.export      = _export;
  _class.prototype.export_json = export_json;

  _class.prototype.generateNextPopulation = generateNextPopulation;
  _class.prototype.crossOver              = crossOver;
  _class.prototype.crossOverDataKey       = crossOverDataKey;
  _class.prototype.mutateDataKeys         = mutateDataKeys;
  _class.prototype.mutate                 = mutate;

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
    const LOOP_MAX = Infinity;
    // const LOOP_MAX = 1;

    this._loopInterval = setInterval(() => {
      if (this._loopCounter >= LOOP_MAX) return this.loopStop();
      this._loopCounter++;

      __updateAllInArray.call(this, 'Agent');
      __updateAllInArray.call(this, 'Food');

      if (this._loopCounter % this.DEFAULT.NEW_POPULATION_COUNTER === 0) {
        this.generateNextPopulation();
      }
    }, this.DEFAULT.LOOP_INTERVAL);
  }



  function __updateAllInArray(collectionName){
    this.map
      .findCollection(collectionName)
      .forEach(function(item) {
        if (item) item.update();
      });
  }


  function loopStop() {
    if (!this._loopInterval) return undefined;
    clearInterval(this._loopInterval);
  }



  function renderMap(map) {
    if (!map) return undefined;

    this.setMap(
      new _Map(
        this, 
        map.attrs, 
        map.params
      )
    );
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

    $parentEl.style['position'] = 'relative';
    $parentEl.style['display']  = 'block';
    $parentEl.style['padding']  = 0;
    $parentEl.style['overflow'] = 'visible';

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
    bodyEl.style['border']   = 'solid 1px #ccc';
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



  function getGroups() {
    return this.map.findCollection('Group');
  }



  function _export(type, options) {
    if (type === 'json') return this.export_json(options); 
  }



  function setMap(map) {
    this.map = map;
  }



  function getMap() {
    return this.map;
  }



  function export_json(options) {
    var groups = this.getGroups();
    groups = groups.map(function(group) {
      return group.brain.toJSON();
    });
    return groups;
  }



  function destroy() {
    log('Canvas.destroy')
  }



  function generateNextPopulation() {
    if (!this._isEnableMutations) return undefined;

    var groups = this.getGroups();
    groups.sort((a, b) => {
      return b.score - a.score;
    });

    // best
    let brainA = groups[0].getBrainJSON();
    let brainB = groups[1].getBrainJSON();

    if (groups[0].score < this._populationLastBestScore && !!this._lastBestBrain) {
      log('New Population was dumber than the previous on', this._populationLastBestScore - groups[0].score);
    } 
    this._populationCounter++;

    if (this._populationCounter % this.DEFAULT.LOG_POPULATION_NUM === 0) {
      log('Population', this._populationCounter, groups[0].score);
    }


    let oneBrain     = this.crossOver(brainA, brainB); 
    let mutatedBrain = this.mutate(oneBrain);

    this._lastBestBrain = mutatedBrain;
    this._populationLastBestScore = groups[0].score;

    groups.forEach((group) => {
      let newBrain = this.mutate(this._lastBestBrain); 
      group.resetScore();
      group.setBrainFromJSON(newBrain);
    });
  }



  function crossOver(netA, netB) {
    // Swap (50% prob.)
    if (Math.random() > 0.5) {
      var tmp = netA;
      netA = netB;
      netB = tmp;
    }

    // Clone network
    netA = _.cloneDeep(netA);
    netB = _.cloneDeep(netB);

    // Cross over data keys
    this.crossOverDataKey(netA.neurons, netB.neurons, 'bias');

    return netA;
  }



  function crossOverDataKey(a, b, key) {
    var cutLocation = Math.round(a.length * Math.random());

    var tmp;
    for (var k = cutLocation; k < a.length; k++) {
      // Swap
      tmp = a[k][key];
      a[k][key] = b[k][key];
      b[k][key] = tmp;
    }
  }



  function mutate(net){
    let mutationProb = 0.2;

    // Mutate
    this.mutateDataKeys(net.neurons, 'bias', mutationProb);
    this.mutateDataKeys(net.connections, 'weight', mutationProb);
    return net;
  }


  function mutateDataKeys(a, key, mutationRate){
    for (var k = 0; k < a.length; k++) {
      // Should mutate?
      if (Math.random() > mutationRate) {
        continue;
      }

      // let newVal = a[k][key] * (Math.random() - 0.5) * 3 + (Math.random() - 0.5);
      let newVal = _randomFloat(-this.DEFAULT.MUTATION_RATE, this.DEFAULT.MUTATION_RATE);

      // log('?', a[k][key], newVal)

      a[k][key] += newVal;
    }
  }


});
