(function() {

  define(['libs/face/ccv', 'libs/face/face'], function() {
    var backCanvas, backContext, cache, enabled, h, pub, w;
    backCanvas = document.createElement("canvas");
    backContext = backCanvas.getContext("2d");
    w = 300 / 4 * 0.8;
    h = 270 / 4 * 0.8;
    cache = {};
    enabled = false;
    return pub = {
      init: function(x, y, width, height) {
        backCanvas.width = 120;
        backCanvas.height = 80;
        cache.comp = [
          {
            x: x,
            y: y,
            width: backCanvas.width,
            height: backCanvas.height
          }
        ];
        return $.subscribe("/tracking/enable", function(set) {
          console.log("Face tracking: " + set);
          return enabled = set;
        });
      },
      track: function(video) {
        var comp, i, track, _i, _len, _ref;
        track = {
          faces: [],
          trackWidth: backCanvas.width
        };
        if (!enabled) {
          return track;
        }
        backContext.drawImage(video, 0, 0, backCanvas.width, backCanvas.height);
        comp = ccv.detect_objects(cache.ccv = cache.ccv || {
          canvas: ccv.grayscale(backCanvas),
          cascade: cascade,
          interval: 5,
          min_neighbors: 1
        });
        if (comp.length) cache.comp = comp;
        _ref = cache.comp;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          i = _ref[_i];
          track.faces.push({
            x: i.x,
            y: i.y,
            width: i.width,
            height: i.height
          });
        }
        return track;
      }
    };
  });

}).call(this);
