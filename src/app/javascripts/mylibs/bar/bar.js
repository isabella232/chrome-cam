(function() {

  define(['Kendo', 'text!mylibs/bar/views/top.html', 'text!mylibs/bar/views/bottom.html'], function(kendo, topTemplate, bottomTemplate) {
    var View;
    return View = (function() {
      var bottomModel;

      bottomModel = kendo.observable({
        mode: {
          display: "none",
          click: function() {
            var a, mode;
            a = $(e.target);
            mode = a.data("mode");
            a.siblings().removeClass("active");
            return a.addClass("active");
          }
        },
        capture: {
          click: function() {}
        },
        thumbnail: {
          display: null
        }
      });

      function View(top, bottom) {
        var bottomBar, topBar;
        this.top = top;
        this.bottom = bottom;
        topBar = new kendo.View(this.top, topTemplate);
        bottomBar = new kendo.View(this.bottom, bottomTemplate);
        topBar.render(bottomModel);
        bottomBar.render();
        $.subscribe("/top/update", function(state) {
          return state.set(topBar, state);
        });
      }

      return View;

    })();
  });

}).call(this);
