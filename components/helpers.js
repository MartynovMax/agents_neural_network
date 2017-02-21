(function(_window){
  'use strict';

  _window._eachSeries    = _eachSeries;
  _window._flatten       = _flatten;
  _window._getArcHeight  = _getArcHeight;
  _window._isObject      = _isObject;
  _window._toDegrees     = _toDegrees;
  _window._toRadians     = _toRadians;
  _window._randomInteger = _randomInteger;
  _window.log            = _window.console.log.bind(_window.console);





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
    return (typeof item === "object" && !Array.isArray(item) && item !== null);
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


})(window);
