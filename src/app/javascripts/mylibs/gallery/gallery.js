(function() {

  define(['Kendo', 'mylibs/utils/utils', 'mylibs/file/filewrapper', 'text!mylibs/gallery/views/gallery.html', 'text!mylibs/gallery/views/details.html'], function(kendo, utils, filewrapper, templateSource, detailsTemplateSource) {
    var createDetailsViewModel, createPage, detailsTemplate, loadImages, numberOfRows, pub, rowLength, setupSubscriptionEvents, template;
    template = kendo.template(templateSource);
    detailsTemplate = kendo.template(detailsTemplateSource);
    rowLength = 4;
    numberOfRows = 4;
    loadImages = function() {
      var deferred;
      deferred = $.Deferred();
      $.publish("/bar/preview/update", [
        {
          thumbnailURL: "derpderpin"
        }
      ]);
      filewrapper.list().done(function(files) {
        var dataSource;
        dataSource = new kendo.data.DataSource({
          data: files,
          pageSize: rowLength * numberOfRows,
          change: function() {
            return $.publish("/gallery/page", [dataSource]);
          },
          sort: {
            dir: "desc",
            field: "name"
          }
        });
        dataSource.read();
        return deferred.resolve(dataSource);
      });
      $.publish("/postman/deliver", [{}, "/file/read"]);
      return deferred.promise();
    };
    createPage = function(dataSource, $container) {
      var file, i, rows, _i, _len, _ref;
      rows = (function() {
        var _results;
        _results = [];
        for (i = 0; 0 <= numberOfRows ? i < numberOfRows : i > numberOfRows; 0 <= numberOfRows ? i++ : i--) {
          _results.push(dataSource.view().slice(i * rowLength, ((i + 1) * rowLength)));
        }
        return _results;
      })();
      _ref = dataSource.view();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        file = _ref[_i];
        filewrapper.readFile(file.name).done(function(file) {
          return $container.find("[data-file-name='" + file.name + "']").attr("src", file.file);
        });
      }
      return $container.html(template({
        rows: rows
      }));
    };
    createDetailsViewModel = function(message) {
      return $.extend({}, message, {
        deleteItem: function() {
          var _this = this;
          return filewrapper.deleteFile(message.name).done(function() {
            return _this.close();
          });
        },
        close: function() {
          return $.publish("/gallery/details/hide");
        },
        canGoToNext: function() {
          return true;
        },
        canGoToPrevious: function() {
          return true;
        },
        goToNext: function() {
          return console.log("Next");
        },
        goToPrevious: function() {
          return console.log("Previous");
        }
      });
    };
    setupSubscriptionEvents = function($container) {
      kendo.fx.hide = {
        setup: function(element, options) {
          return $.extend({
            height: 25
          }, options.properties);
        }
      };
      $.subscribe("/gallery/details/hide", function() {
        return $container.find(".details").kendoStop(true).kendoAnimate({
          effects: "zoomOut",
          hide: true
        });
      });
      $.subscribe("/gallery/details/show", function(message) {
        var $details, model;
        model = createDetailsViewModel(message);
        $container.find(".details").remove();
        $details = $(detailsTemplate(model));
        kendo.bind($details, model);
        $container.append($details);
        return $details.kendoStop(true).kendoAnimate({
          effects: "zoomIn",
          show: true
        });
      });
      $.subscribe("/gallery/hide", function() {
        $("#wrap").show();
        console.log("hide gallery");
        $("#footer").animate({
          "margin-top": "-60px"
        });
        $("#wrap").kendoAnimate({
          effects: "slideIn:down",
          duration: 500
        });
        $("#wrap")[0].style.height = "100%";
        $.publish("/camera/pause", [false]);
        $.publish("/bar/gallerymode/hide");
        return $container.hide();
      });
      $.subscribe("/gallery/list", function() {
        console.log("show gallery");
        $.publish("/camera/pause", [true]);
        $container.show();
        $("#footer").animate({
          "margin-top": 0
        });
        $("#wrap").addClass("animate");
        $("#wrap").kendoAnimate({
          effects: "slide:up",
          duration: 500
        });
        $("#wrap").css("height", 0);
        setTimeout((function() {
          return wrap.hide();
        }), 1000);
        return $.publish("/bar/gallerymode/show");
      });
      return $.subscribe("/gallery/page", function(dataSource) {
        return createPage(dataSource, $container);
      });
    };
    return pub = {
      init: function(selector) {
        var $container;
        $container = $(selector);
        return loadImages().done(function(dataSource) {
          var changePage;
          console.log("done loading images");
          $container.on("dblclick", ".thumbnail", function() {
            var $media;
            $media = $(this).children().first();
            return $.publish("/gallery/details/show", [
              {
                src: $media.attr("src"),
                type: $media.data("media-type"),
                name: $media.data("file-name")
              }
            ]);
          });
          $container.on("click", ".thumbnail", function() {
            $(selector).find(".thumbnail").each(function() {
              return $(this).removeClass("selected");
            });
            return $(this).addClass("selected");
          });
          changePage = function(direction) {
            if (direction > 0 && dataSource.page() > 1) {
              dataSource.page(dataSource.page() - 1);
            }
            if (direction < 0 && dataSource.page() < dataSource.totalPages()) {
              return dataSource.page(dataSource.page() + 1);
            }
          };
          $container.kendoMobileSwipe(function(e) {
            return changePage((e.direction === "right") - (e.direction === "left"));
          });
          $.subscribe("/events/key/arrow", function(e) {
            return changePage((e === "down") - (e === "up"));
          });
          setupSubscriptionEvents($container);
          $.subscribe("/gallery/add", function(file) {
            return dataSource.add(file);
          });
          return $.publish("/gallery/page", [dataSource]);
        });
      }
    };
  });

}).call(this);
