// Generated by CoffeeScript 1.4.0
(function() {

  define(['Kendo', 'mylibs/bar/bottom', 'mylibs/bar/top', 'mylibs/popover/popover', 'mylibs/full/full', 'mylibs/postman/postman', 'mylibs/utils/utils', 'mylibs/gallery/gallery', 'mylibs/gallery/details', 'mylibs/events/events', 'mylibs/file/filewrapper', 'mylibs/about/about', 'mylibs/confirm/confirm', 'mylibs/assets/assets', 'mylibs/navigation/navigation', 'mylibs/tabbing/tabbing', "text!mylibs/nocamera/views/nocamera.html"], function(kendo, bottom, top, popover, full, postman, utils, gallery, details, events, filewrapper, about, confirm, assets, navigation, tabbing, nocamera) {
    var pub;
    return pub = {
      init: function() {
        var APP, promises;
        APP = window.APP = {};
        APP.full = full;
        APP.gallery = gallery;
        APP.about = about;
        APP.confirm = confirm;
        APP.bottom = bottom;
        APP.top = top;
        APP.details = details;
        events.init();
        postman.init(window.top);
        assets.init();
        $.subscribe('/camera/unsupported', function() {
          new kendo.View("#no-camera", nocamera).render(kendo.observable({}), true);
          return navigation.navigate("#no-camera");
        });
        $.publish("/postman/deliver", [true, "/menu/enable"]);
        promises = {
          effects: $.Deferred(),
          localization: $.Deferred()
        };
        $.subscribe("/effects/response", function(filters) {
          APP.filters = filters;
          return promises.effects.resolve();
        });
        $.subscribe("/localization/response", function(dict) {
          APP.localization = dict;
          return promises.localization.resolve();
        });
        $.when(promises.effects.promise(), promises.localization.promise()).then(function() {
          var hideSplash;
          bottom.init(".bottom");
          top.init(".top");
          APP.popover = popover.init("#gallery");
          full.init("#capture");
          details.init("#details");
          gallery.init("#list");
          about.init("#about");
          confirm.init("#confirm");
          full.show(APP.filters[0]);
          tabbing.init();
          tabbing.setLevel(0);
          $.publish("/postman/deliver", [
            {
              message: ""
            }, "/app/ready"
          ]);
          window.APP.app = new kendo.mobile.Application(document.body, {
            platform: "android"
          });
          hideSplash = function() {
            return $("#splash").kendoAnimate({
              effects: "fade:out",
              duration: 1000,
              hide: true
            });
          };
          setTimeout(hideSplash, 100);
          return $.subscribe("/keyboard/close", function() {
            return $.publish("/postman/deliver", [null, "/window/close"]);
          });
        });
        $.publish("/postman/deliver", [null, "/localization/request"]);
        return $.publish("/postman/deliver", [null, "/effects/request"]);
      }
    };
  });

}).call(this);
