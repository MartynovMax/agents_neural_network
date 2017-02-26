define(function (require) {
  'use strict';


  var ThresholdFunction = {};


  ThresholdFunction.SIGN = {
    calculate: function(value, params) {
      var threshold = params[0];
      if (value > threshold) {
        return 1;
      } else {
        return 0;
      }
    },

    getDefaultParams: function() {
      var threshold = 0;
      var ret = [];
      ret.push(threshold);
      return ret;
    }
  }



  return ThresholdFunction;
});
