(function() {

  define(['mylibs/file/filewrapper'], function(filewrapper) {
    /*     Utils
    
    This file contains utility functions and normalizations. this used to contain more functions, but
    most have been moved into the extension
    */
    var bufferCanvas, bufferContext, pub;
    bufferCanvas = document.createElement("canvas");
    bufferCanvas.width = 720 / 2;
    bufferCanvas.height = 480 / 2;
    bufferContext = bufferCanvas.getContext("2d");
    return pub = {
      getAnimationFrame: function() {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame;
      },
      createVideo: function(frames) {
        var blob, deferred, i, name, pair, reader, video, _i, _len, _ref;
        deferred = $.Deferred();
        video = new Whammy.Video();
        _ref = (function() {
          var _ref, _results;
          _results = [];
          for (i = 0, _ref = frames.length - 2; 0 <= _ref ? i <= _ref : i >= _ref; 0 <= _ref ? i++ : i--) {
            _results.push(frames.slice(i, (i + 1) + 1 || 9e9));
          }
          return _results;
        })();
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          pair = _ref[_i];
          bufferContext.putImageData(pair[0].imageData, 0, 0);
          video.add(bufferCanvas.toDataURL('image/webp', 0.8), pair[1].time - pair[0].time);
        }
        blob = video.compile();
        name = new Date().getTime() + ".webm";
        filewrapper.save(name, blob);
        reader = new FileReader();
        reader.onload = function(e) {
          return deferred.resolve({
            url: e.target.result,
            name: name
          });
        };
        reader.readAsDataURL(blob);
        return deferred.promise();
      },
      oppositeDirectionOf: function(dir) {
        switch (dir) {
          case "left":
            return "right";
          case "right":
            return "left";
          case "up":
            return "down";
          case "down":
            return "up";
        }
      }
    };
  });

}).call(this);
