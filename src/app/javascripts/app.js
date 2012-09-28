(function() {

  define(['Kendo', 'Glfx', 'mylibs/camera/camera', 'mylibs/bar/bottom', 'mylibs/bar/top', 'mylibs/popover/popover', 'mylibs/preview/preview', 'mylibs/full/full', 'mylibs/postman/postman', 'mylibs/utils/utils', 'mylibs/gallery/gallery', 'mylibs/gallery/details', 'mylibs/events/events', 'mylibs/file/filewrapper', 'mylibs/settings/settings', 'mylibs/about/about', 'mylibs/confirm/confirm', 'mylibs/assets/assets', 'libs/record/record'], function(kendo, glfx, camera, bottom, top, popover, preview, full, postman, utils, gallery, details, events, filewrapper, settings, about, confirm, assets, record) {
    var pub;
    return pub = {
      init: function() {
        var APP;
        APP = window.APP = {};
        APP.full = full;
        APP.filters = preview;
        APP.gallery = gallery;
        APP.settings = settings;
        APP.about = about;
        APP.confirm = confirm;
        events.init();
        postman.init(window.top);
        assets.init();
        $.subscribe('/camera/unsupported', function() {
          return $('#pictures').append(intro);
        });
        $.publish("/postman/deliver", [true, "/menu/enable"]);
        return camera.init("countdown", function() {
          APP.bottom = bottom.init(".bottom");
          APP.top = top.init(".top");
          APP.popover = popover.init("#gallery");
          preview.init("#filters");
          full.init("#capture");
          details.init("#details");
          gallery.init("#thumbnails");
          settings.init("#settings");
          about.init("#about");
          confirm.init("#confirm");
          preview.draw();
          $.publish("/postman/deliver", [
            {
              message: ""
            }, "/app/ready"
          ]);
          return window.APP.app = new kendo.mobile.Application(document.body, {
            platform: "android"
          });
        });
      }
    };
  });

}).call(this);
