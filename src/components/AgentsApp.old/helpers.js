/* eslint-disable */

export default () => {}

(function(_window){
  'use strict';

  _window._extendClass = _extendClass;
  _window._eachSeries = _eachSeries;
  _window._flatten = _flatten;
  _window._getArcHeight = _getArcHeight;
  _window._isObject = _isObject;
  _window._isBool = _isBool;
  _window._isNum = _isNum;
  _window._isArray = _isArray;
  _window._toDegrees = _toDegrees;
  _window._toRadians = _toRadians;
  _window._randomInteger = _randomInteger;
  _window.log = _window.console.log.bind(_window.console);
  _window._rotatePoint = _rotatePoint;
  _window._isPointInPoly = _isPointInPoly;
  _window._isPointInCircle = _isPointInCircle;
  _window._isPointInRect = _isPointInRect;
  _window._isPointInsideCircleSector = _isPointInsideCircleSector;
  _window._generateUID = _generateUID;





  function _extendClass(Child, Parent) {
    Child.prototype = _extendObject(Child.prototype, Parent.prototype);
    Child.prototype.constructor = Child;
    Child.prototype.super = Parent;

    // it is a right way, but it is not useful for me
    // var F           = function() {};
    // F.prototype     = Parent.prototype;
    // Child.prototype = new F();
    // Child.prototype.constructor = Child;
    // Child.super     = Parent.prototype;
  }



  function _extendObject(a, b) {
    if (a == null || b == null) {
      return a;
    }

    Object.keys(b).forEach(function (key) {
      if (Object.prototype.toString.call(b[key]) == '[object Object]') {
        if (Object.prototype.toString.call(a[key]) != '[object Object]') {
          a[key] = b[key];
        } else {
          a[key] = extend(a[key], b[key]);
        }
      } else {
        a[key] = b[key];
      }
    });
    return a;
  }



  function _eachSeries(arr, iterator, callback) {
    if (!Array.isArray(arr)) return callback('First param should be Array');
    var length = arr.length;
    var index  = -1;

    function iterate(){
      index++;

      iterator(arr[index], index, function(err){
        if (err) {
          return callback(err);
        }
        else {
          if (index >= length -1){
            return callback();
          }
          else {
            return iterate();
          }
        }
      });
    }
    return iterate();
  };


  // Flatten out an array, either recursively (by default), or just one level.
  function _flatten(array, shallow) {
    // Internal implementation of a recursive `flatten` function.
    return (function flatten(input, shallow, strict, output) {
      output = output || [];
      var idx = output.length;
      if (!input) return output;

      for (var i = 0, length = input.length; i < length; i++) {
        var value = input[i];
        if (Array.isArray(value)) {
          // Flatten current level of array or arguments object.
          if (shallow) {
            var j = 0, len = value.length;
            while (j < len) output[idx++] = value[j++];
          } else {
            flatten(value, shallow, strict, output);
            idx = output.length;
          }
        } else if (!strict) {
          output[idx++] = value;
        }
      }
      return output;
    })(array, shallow, false);
  };


  function _getArcHeight(diameter, chordLength) {
    var angleArc = Math.asin(chordLength / diameter);
    return diameter * ((1 - Math.cos(angleArc)) / 2);
  }


  function _isObject(item) {
    return (typeof item === 'object' && !Array.isArray(item) && item !== null);
  }


  function _isNum(item) {
    return typeof item === 'number';
  }


  function _isBool(item) {
    return typeof item === 'boolean';
  }


  function _isArray(item) {
    return Array.isArray(item);
  }


  function _toDegrees(angle) {
    return angle * (180 / Math.PI);
  }


  function _toRadians(angle) {
    return angle * (Math.PI / 180);
  }


  function _randomInteger(min, max) {
    var rand = min + Math.random() * (max - min);
    rand = Math.round(rand);
    return rand;
  }

  /*
  * The first two parameters are the coordinates
  * of the point that we'll be rotating.
  *
  * The next two parameters are the X and Y coordinates
  * of the central point (the origin around which the second point
  * will be rotated).
  *
  * The last parameter is the angle, in radians.
  */
  function _rotatePoint(x, y, cx, cy, angle) {
    const radians = -angle

    return {
      x: (Math.cos(radians) * (x - cx)) + (Math.sin(radians) * (y - cy)) + cx,
      y: (Math.cos(radians) * (y - cy)) - (Math.sin(radians) * (x - cx)) + cy
    };
  }


  function _isPointInPoly(poly, pt){
    for(var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
      ((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y))
      && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)
      && (c = !c);
    return c;
  }

  // x,y is the point to test
  // cx, cy is circle center, and radius is circle radius
  function _isPointInCircle (x, y, cx, cy, radius) {
    var distancesquared = Math.pow(x - cx, 2) + Math.pow(y - cy, 2);
    return distancesquared <= radius * radius;
  }

  /**
   * @param {object} point
   * @param {number} point.x
   * @param {number} point.y
   * @param {object} rect
   * @param {number} rect.x1
   * @param {number} rect.y1
   * @param {number} rect.x2
   * @param {number} rect.y2
   */
  function _isPointInRect (point, rect) {
    return point.x > rect.x1 &&
      point.x < rect.x2 &&
      point.y > rect.y1 &&
      point.y < rect.y2;
  }


  function areClockwise(center, radius, angle, point2) {
    const point1 = {
      x : (center.x + radius) * Math.cos(angle),
      y : (center.y + radius) * Math.sin(angle)
    }
    return -point1.x * point2.y + point1.y * point2.x > 0
  }

  // angles gere in radians
  function _isPointInsideCircleSector(point, center, radius, angle1, angle2) {
    const relPoint = {
      x: point.x - center.x,
      y: point.y - center.y
    };

    return !areClockwise(center, radius, angle1, relPoint) &&
      areClockwise(center, radius, angle2, relPoint) &&
      (relPoint.x * relPoint.x + relPoint.y * relPoint.y <= radius * radius);
  }

  // function areClockwise(v1, v2) {
  //   return -v1.x*v2.y + v1.y*v2.x > 0
  // }
  // function isWithinRadius(v, radiusSquared) {
  //   return v.x*v.x + v.y*v.y <= radiusSquared
  // }

  // // https://stackoverflow.com/a/13675772/9258694
  // function _isInsideSector(point, center, sectorStart, sectorEnd, radiusSquared) {
  //   var relPoint = {
  //     x: point.x - center.x,
  //     y: point.y - center.y
  //   }

  //   return !areClockwise(sectorStart, relPoint) &&
  //     areClockwise(sectorEnd, relPoint) &&
  //     isWithinRadius(relPoint, radiusSquared)
  // }

  function _generateUID() {
    function r() {
      return Math.random().toString(36).substr(2, 4);
    }
    return r() + '-' + r() + '-' + r() + '-' + r();
  }


})(window)
