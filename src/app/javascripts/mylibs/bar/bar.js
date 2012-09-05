(function() {

  define(['Kendo', 'text!mylibs/bar/views/bar.html'], function(kendo, template) {
    var countdown, el, mode, pub, startTime;
    mode = "image";
    el = {};
    startTime = 0;
    kendo.fx.circle = {
      setup: function(element, options) {
        return $.extend({
          borderRadius: 100
        }, options.properties);
      }
    };
    kendo.fx.square = {
      setup: function(element, options) {
        return $.extend({
          borderRadius: 0
        }, options.properties);
      }
    };
    countdown = function(position, callback) {
      el.$capture.hide();
      return $(el.$counters[position]).kendoStop(true).kendoAnimate({
        effects: "zoomIn fadeIn",
        duration: 200,
        show: true,
        complete: function() {
          ++position;
          if (position < 3) {
            return setTimeout(function() {
              return countdown(position, callback);
            }, 500);
          } else {
            callback();
            el.$capture.show();
            return el.$counters.hide();
          }
        }
      });
    };
    return pub = {
      init: function(selector) {
        var $container;
        $container = $(selector);
        el.$content = $(template);
        el.$capture = el.$content.find(".capture");
        el.$dot = el.$capture.find("> div > div");
        el.$counters = el.$content.find(".countdown > span");
        el.$timer = el.$content.find(".timer");
        el.$content.find(".mode").on("click", "a", function() {
          mode = $(this).data("mode");
          return el.$dot.kendoStop().kendoAnimate({
            effects: $(this).data("shape")
          });
        });
        el.$content.on("click", ".capture", function(e) {
          var capture;
          if (mode === "image") {
            capture = function() {
              return $.publish("/capture/" + mode);
            };
            if (e.ctrlKey) {
              return capture();
            } else {
              return countdown(0, capture);
            }
          } else {
            startTime = Date.now();
            el.$capture.hide();
            el.$timer.show();
            $.publish("/capture/" + mode);
            return el.$content.addClass("recording");
          }
        });
        el.$content.on("click", ".galleryLink", function() {
          return $.publish("/gallery/list");
        });
        el.$content.on("click", ".back", function() {
          return $.publish("/gallery/hide");
        });
        $container.append(el.$content);
        $.subscribe("/bar/preview/update", function(message) {
          var $image;
          $image = $("<img />", {
            src: message.thumbnailURL,
            width: 72,
            height: 48
          });
          return el.$content.find(".galleryLink").empty().append($image).removeClass("hidden");
        });
        $.subscribe("/bar/capture/show", function() {
          return el.$capture.kendoStop(true).kendoAnimate({
            effects: "slideIn:up",
            show: true,
            duration: 200
          });
        });
        $.subscribe("/bar/capture/hide", function() {
          return el.$capture.kendoStop(true).kendoAnimate({
            effects: "slide:down",
            show: true,
            duration: 200
          });
        });
        $.subscribe("/bar/time/hide", function() {
          el.$content.removeClass("recording");
          return el.$timer.kendoStop(true).kendoAnimate({
            effects: "slide:up",
            hide: true,
            duration: 200
          });
        });
        el.$content.addClass("previewMode");
        $.subscribe("/bar/gallerymode/show", function() {
          return el.$content.removeClass("previewMode").addClass("galleryMode");
        });
        $.subscribe("/bar/gallerymode/hide", function() {
          return el.$content.removeClass("galleryMode").addClass("previewMode");
        });
        $.subscribe("/bar/timer/update", function() {
          return el.$timer.html(kendo.toString((Date.now() - startTime) / 1000, "00.00"));
        });
        $(".photo", el.$container).on("click", function() {
          var recordMode;
          $(".mode a", el.$container).removeClass("active");
          $(this).addClass("active");
          return recordMode = "image";
        });
        return $(".video", el.$container).on("click", function() {
          var recordMode;
          $(".mode a", el.$container).removeClass("active");
          $(this).addClass("active");
          return recordMode = "video/record";
        });
      }
    };
  });

}).call(this);
