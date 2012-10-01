(function() {

  define(['mylibs/preview/preview', 'mylibs/utils/utils', 'libs/face/track'], function(preview, utils, face) {
    /*     Camera
    
    The camera module takes care of getting the users media and drawing it to a canvas.
    It also handles the coutdown that is intitiated
    */
    var $counter, canvas, ctx, paused, pub, turnOn;
    $counter = {};
    canvas = {};
    ctx = {};
    paused = false;
    turnOn = function(callback, testing) {
      var track;
      track = {};
      $.subscribe("/camera/update", function(message) {
        var imgData, skip, videoData;
        if (!paused) {
          skip = false;
          if (window.testing) message.track = face.track(canvas);
          imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          videoData = new Uint8ClampedArray(message.image);
          imgData.data.set(videoData);
          ctx.putImageData(imgData, 0, 0);
          $.publish("/camera/stream", [
            {
              canvas: canvas,
              track: message.track
            }
          ]);
          return skip = !skip;
        }
      });
      return callback();
    };
    return pub = {
      init: function(counter, callback) {
        canvas = document.createElement("canvas");
        canvas.width = 360;
        canvas.height = 240;
        ctx = canvas.getContext("2d");
        $.subscribe("/camera/pause", function(isPaused) {
          return paused = isPaused;
        });
        return turnOn(callback);
      }
    };
  });

}).call(this);
