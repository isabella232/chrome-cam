(function() {

  define(['Kendo', 'mylibs/file/filewrapper', 'mylibs/config/config', 'text!mylibs/settings/views/settings.html'], function(kendo, filewrapper, config, template) {
    var CONFIRM_TEXT, SETTINGS_VIEW, previous, pub, view, viewModel;
    SETTINGS_VIEW = "#settings";
    view = null;
    previous = "#home";
    CONFIRM_TEXT = "You are about to delete all media from your gallery. You will not be able to get these items back. Are you sure you want to do this?";
    viewModel = kendo.observable({
      flash: {
        enabled: false,
        change: function(e) {
          return config.set("flash", viewModel.flash.enabled);
        }
      },
      show: function() {
        $.publish("/postman/deliver", [false, "/menu/enable"]);
        previous = window.APP.app.view().id;
        return window.APP.app.navigate(SETTINGS_VIEW);
      },
      hide: function() {
        $.publish("/postman/deliver", [true, "/menu/enable"]);
        return window.APP.app.navigate(previous);
      },
      gallery: {
        clear: function() {
          return $.publish("/confirm/show", [
            "Remove All", CONFIRM_TEXT, function() {
              return $.publish("/gallery/clear");
            }
          ]);
        }
      }
    });
    return pub = {
      before: function() {
        return $.publish("/postman/deliver", [
          {
            paused: true
          }, "/camera/pause"
        ]);
      },
      hide: function() {
        return $.publish("/postman/deliver", [
          {
            paused: false
          }, "/camera/pause"
        ]);
      },
      init: function(selector) {
        view = new kendo.View(selector, template);
        view.render(viewModel, true);
        config.get("flash", function(value) {
          return viewModel.flash.enabled = value;
        });
        return $.subscribe('/menu/click/chrome-cam-settings-menu', function() {
          return viewModel.show();
        });
      }
    };
  });

}).call(this);
