(function() {

  define(['Kendo', 'text!mylibs/gallery/views/details.html'], function(kendo, template) {
    var hide, index, pub, show, update, viewModel,
      _this = this;
    index = 0;
    viewModel = kendo.observable({
      video: {
        src: function() {
          return "styles/images/photoPlaceholder.png";
        }
      },
      img: {
        src: function() {
          return "styles/images/photoPlaceholder.png";
        }
      },
      type: "jpeg",
      isVideo: function() {
        return this.get("type") === "webm";
      },
      next: {
        visible: false,
        click: function(e) {
          return $.publish("/gallery/at", [index + 1]);
        }
      },
      previous: {
        visible: false,
        click: function(e) {
          return $.publish("/gallery/at", [index - 1]);
        }
      }
    });
    hide = function() {
      $.publish("/top/update", ["gallery"]);
      return _this.details.container.kendoStop(true).kendoAnimate({
        effects: "zoomOut",
        hide: true,
        complete: function() {
          return $.unsubscribe("/gallery/delete");
        }
      });
    };
    show = function(message) {
      update(message);
      return _this.details.container.kendoStop(true).kendoAnimate({
        effects: "zoomIn",
        show: true,
        complete: function() {
          $.publish("/top/update", ["details"]);
          return $.subscribe("/gallery/delete", function() {
            return hide();
          });
        }
      });
    };
    update = function(message) {
      viewModel.set("type", message.item.type);
      if (viewModel.get("type") === "webm") {
        viewModel.set("video.src", message.item.file);
      } else {
        viewModel.set("img.src", message.item.file);
      }
      viewModel.set("next.visible", message.index < message.length - 1);
      viewModel.set("previous.visible", message.index > 0 && message.length > 1);
      index = message.index;
      return console.log(message.index);
    };
    return pub = {
      init: function(selector) {
        _this.details = new kendo.View(selector, template);
        _this.details.render(viewModel, true);
        $.subscribe("/details/hide", function() {
          return hide();
        });
        $.subscribe("/details/show", function(message) {
          return show(message);
        });
        $.subscribe("/details/update", function(message) {
          return update(message);
        });
        return $.subscribe("/keyboard/arrow", function(direction) {
          if (direction === "left" && viewModel.previous.visible) {
            viewModel.previous.click();
          }
          if (direction === "right" && viewModel.next.visible) {
            return viewModel.next.click();
          }
        });
      }
    };
  });

}).call(this);
