(function() {

  define(['mylibs/effects/effects', 'mylibs/utils/utils', 'text!mylibs/preview/views/preview.html'], function(effects, utils, previewTemplate) {
    /*     Select Preview
    
    Select preview shows pages of 6 live previews using webgl effects
    */
    var animation, arrows, canvas, columns, ctx, draw, ds, flipping, frame, isFirstChange, keyboard, page, paused, previews, pub;
    paused = false;
    canvas = {};
    ctx = {};
    previews = [];
    frame = 0;
    ds = {};
    flipping = false;
    columns = 2;
    animation = {
      effects: "pageturn:horizontal",
      reverse: false,
      duration: 800
    };
    isFirstChange = true;
    draw = function() {
      return $.subscribe("/camera/stream", function(stream) {
        var el, preview, request, _i, _len;
        if (!paused) {
          for (_i = 0, _len = previews.length; _i < _len; _i++) {
            preview = previews[_i];
            el = $(".preview[data-filter-name='" + preview.name + "']");
            if (!el.is(".hover")) continue;
            frame++;
            ctx.drawImage(stream.canvas, 0, 0, canvas.width, canvas.height);
            effects.advance(canvas);
            preview.filter(preview.canvas, canvas, frame, stream.track);
          }
          request = function() {
            return $.publish("/postman/deliver", [null, "/camera/request"]);
          };
          return setTimeout(request, 1);
        }
      });
    };
    keyboard = function(enabled) {
      if (enabled) {
        return keyboard.token = $.subscribe("/keyboard/arrow", function(e) {
          if (!flipping) return page(utils.oppositeDirectionOf(e));
        });
      } else {
        return $.unsubscribe(keyboard.token);
      }
    };
    page = function(direction) {
      if (direction === "left") {
        animation.reverse = false;
        if (ds.page() < ds.totalPages()) {
          arrows.both.hide();
          return ds.page(ds.page() + 1);
        }
      } else {
        animation.reverse = true;
        if (ds.page() > 1) {
          arrows.both.hide();
          return ds.page(ds.page() - 1);
        }
      }
    };
    arrows = {
      left: null,
      right: null,
      both: null,
      init: function(parent) {
        arrows.left = parent.find(".previous");
        arrows.left.hide();
        arrows.right = parent.find(".next");
        arrows.both = $([arrows.left[0], arrows.right[0]]);
        arrows.left.on("click", function() {
          return page("right");
        });
        return arrows.right.on("click", function() {
          return page("left");
        });
      }
    };
    return pub = {
      draw: function() {
        return draw();
      },
      before: function() {
        return $.publish("/camera/pause", [false]);
      },
      swipe: function(e) {
        if (!flipping) return page(e.direction);
      },
      init: function(selector) {
        var nextPage, page1, page2, previousPage;
        $.publish("/postman/deliver", [null, "/camera/request"]);
        effects.init();
        keyboard(true);
        canvas = document.createElement("canvas");
        ctx = canvas.getContext("2d");
        canvas.width = 360;
        canvas.height = 240;
        page1 = new kendo.View(selector, null);
        page2 = new kendo.View(selector, null);
        previousPage = page1.render().addClass("page");
        nextPage = page2.render().addClass("page");
        arrows.init($(selector).parent());
        $(selector).on("mouseenter mouseleave", ".preview", function() {
          return $(this).toggleClass('hover');
        });
        ds = new kendo.data.DataSource({
          data: effects.data,
          pageSize: 4,
          change: function() {
            var flipCompleted, flippy, index, item, tracks, _fn, _i, _len, _ref;
            flipping = true;
            previews = [];
            index = 0;
            tracks = false;
            _ref = this.view();
            _fn = function(item) {
              var data, filter, filters, html;
              filter = document.createElement("canvas");
              filter.width = canvas.width;
              filter.height = canvas.height;
              data = {
                effect: item.id,
                name: item.name,
                col: index % columns,
                row: Math.floor(index / columns)
              };
              index++;
              filters = new kendo.View(nextPage, previewTemplate, data);
              html = filters.render();
              html.find(".canvas").append(filter);
              html.click(function() {
                $.publish("/preview/pause", [true]);
                return $.publish("/full/show", [item]);
              });
              previews.push({
                canvas: filter,
                filter: item.filter,
                name: item.name
              });
              return tracks = tracks || item.tracks;
            };
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              item = _ref[_i];
              _fn(item);
            }
            $.publish("/postman/deliver", [tracks, "/tracking/enable"]);
            flipCompleted = function() {
              var justPaged;
              justPaged = previousPage;
              previousPage = nextPage;
              nextPage = justPaged;
              justPaged.empty();
              flipping = false;
              if (ds.page() > 1) arrows.left.show();
              if (ds.page() < ds.totalPages()) arrows.right.show();
              return $.publish("/postman/deliver", [false, "/camera/pause"]);
            };
            flippy = function() {
              return page1.container.kendoAnimate({
                effects: animation.effects,
                face: animation.reverse ? nextPage : previousPage,
                back: animation.reverse ? previousPage : nextPage,
                duration: animation.duration,
                reverse: animation.reverse,
                complete: flipCompleted
              });
            };
            if (isFirstChange) {
              setTimeout(flipCompleted, 1);
              return isFirstChange = false;
            } else {
              $.publish("/postman/deliver", [true, "/camera/pause"]);
              return setTimeout(flippy, 20);
            }
          }
        });
        ds.read();
        return $.subscribe("/preview/pause", function(pause) {
          paused = pause;
          return keyboard(!pause);
        });
      }
    };
  });

}).call(this);
