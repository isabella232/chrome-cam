(function() {

  define(['Kendo', 'mylibs/effects/effects', 'mylibs/utils/utils', 'mylibs/file/filewrapper', 'text!mylibs/full/views/full.html'], function(kendo, effects, utils, filewrapper, fullTemplate) {
    var $container, $flash, canvas, ctx, draw, flash, frame, frames, paused, preview, pub, recording, startTime, webgl;
    canvas = {};
    ctx = {};
    preview = {};
    webgl = {};
    preview = {};
    paused = true;
    frame = 0;
    frames = [];
    recording = false;
    $flash = {};
    startTime = 0;
    $container = {};
    draw = function() {
      return $.subscribe("/camera/stream", function(stream) {
        var time;
        if (!paused) {
          frame++;
          preview.filter(webgl, stream.canvas, frame, stream.track);
          if (recording) {
            time = Date.now();
            frames.push({
              imageData: webgl.getPixelArray(),
              time: Date.now()
            });
            return $.publish("/full/timer/update");
          }
        }
      });
    };
    flash = function() {
      $flash.show();
      return $flash.kendoStop(true).kendoAnimate({
        effects: "fadeOut",
        duration: 2000,
        hide: true
      });
    };
    return pub = {
      init: function(selector) {
        var $content;
        $.subscribe("/capture/photo", function() {
          var image, name;
          flash();
          image = webgl.toDataURL();
          name = new Date().getTime() + ".jpg";
          return filewrapper.save(name, image).done(function() {
            $.publish("/bar/preview/update", [
              {
                thumbnailURL: image
              }
            ]);
            return $.publish("/bar/update", ["full"]);
          });
        });
        $.subscribe("/capture/video", function() {
          console.log("Recording...");
          frames = [];
          recording = true;
          startTime = Date.now();
          $container.find(".timer").removeClass("hidden");
          return setTimeout((function() {
            utils.createVideo(frames);
            console.log("Recording Done!");
            recording = false;
            $container.find(".timer").addClass("hidden");
            return $.publish("/bar/update", ["full"]);
          }), 6000);
        });
        kendo.fx.grow = {
          setup: function(element, options) {
            return $.extend({
              top: options.top,
              left: options.left,
              width: options.width,
              height: options.height
            }, options.properties);
          }
        };
        $container = $(selector);
        canvas = document.createElement("canvas");
        ctx = canvas.getContext("2d");
        $content = $(fullTemplate).appendTo($container);
        $flash = $content.find(".flash");
        webgl = fx.canvas();
        $(webgl).dblclick(function() {
          $.publish("/bar/update", ["preview"]);
          $.publish("/camera/pause", [true]);
          return $container.kendoStop(true).kendoAnimate({
            effects: "zoomOut",
            hide: "true",
            complete: function() {
              paused = true;
              $.publish("/camera/pause", [false]);
              return $.publish("/previews/pause", [false]);
            }
          });
        });
        $content.prepend(webgl);
        $.subscribe("/full/show", function(e) {
          $.publish("/bar/update", ["full"]);
          $.extend(preview, e);
          $.publish("/camera/pause", [true]);
          $content.height($container.height() - 50);
          $content.width((3 / 2) * $content.height());
          $(webgl).width($content.width());
          $(webgl).height("height", $content.height());
          return $container.kendoStop(true).kendoAnimate({
            effects: "zoomIn",
            show: "true",
            complete: function() {
              $.publish("/camera/pause", [false]);
              return paused = false;
            }
          });
        });
        $.subscribe("/full/flash", function() {
          return flash();
        });
        $.subscribe("/full/timer/update", function() {
          return $container.find(".timer").first().html(kendo.toString((Date.now() - startTime) / 1000, "00.00"));
        });
        return draw();
      }
    };
  });

}).call(this);
