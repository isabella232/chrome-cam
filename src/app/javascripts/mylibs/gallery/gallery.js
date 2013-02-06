// Generated by CoffeeScript 1.4.0
(function() {

  define(['Kendo', 'mylibs/utils/utils', 'mylibs/file/filewrapper', 'text!mylibs/gallery/views/thumb.html'], function(kendo, utils, filewrapper, template) {
    var active, add, animation, arrows, at, clear, columns, container, create, data, dataSource, deselect, destroy, details, ds, el, files, flipping, get, index, keyboard, keys, page, pageSize, pages, pub, render, rows, select, selected, total,
      _this = this;
    columns = 3;
    rows = 3;
    pageSize = columns * rows;
    files = [];
    ds = {};
    data = [];
    container = {};
    el = {};
    selected = {};
    total = 0;
    index = 0;
    flipping = false;
    pages = {
      previous: {},
      next: {}
    };
    active = {};
    details = false;
    keyboard = {};
    animation = {
      effects: "pageturn:horizontal",
      reverse: false,
      duration: 800
    };
    deselect = function() {
      container.find(".thumbnail").removeClass("selected");
      selected = null;
      return $.publish("/top/update", ["deselected"]);
    };
    select = function(name) {
      var item;
      item = container.find("[data-name='" + name + "']");
      selected = item.parent(":first");
      if (selected.hasClass("selected")) {
        keys.unbind();
        return $.publish("/details/show", [get("" + (item.data("name")))]);
      } else {
        container.find(".thumbnail").removeClass("selected");
        selected.addClass("selected");
        $.publish("/item/selected", [get(name)]);
        return $.publish("/top/update", ["selected"]);
      }
    };
    page = function(direction) {
      if (flipping) {
        return;
      }
      arrows.both.hide();
      if (direction > 0 && ds.page() > 1) {
        flipping = true;
        animation.reverse = true;
        ds.page(ds.page() - 1);
        render(true);
      }
      if (direction < 0 && ds.page() < ds.totalPages()) {
        flipping = true;
        animation.reverse = false;
        ds.page(ds.page() + 1);
        return render(true);
      }
    };
    clear = function() {
      pages.previous.empty();
      pages.next.empty();
      return $.publish("/postman/deliver", [{}, "/file/read"]);
    };
    destroy = function() {
      var name,
        _this = this;
      name = selected.children(":first").attr("data-name");
      return selected.kendoStop(true).kendoAnimate({
        effects: "zoomOut fadeOut",
        hide: true,
        complete: function() {
          return filewrapper.deleteFile(name).done(function() {
            $.publish("/top/update", ["deselected"]);
            selected.remove();
            ds.remove(ds.get(name));
            return render();
          });
        }
      });
    };
    get = function(name) {
      var match, position;
      match = ds.get(name);
      index = ds.view().indexOf(match);
      position = ds.page() > 1 ? pageSize * (ds.page() - 1) + index : index;
      return {
        length: ds.data().length,
        index: position,
        item: match
      };
    };
    at = function(newIndex, noPage) {
      var match, position, target;
      index = newIndex;
      target = Math.ceil((index + 1) / pageSize);
      if (target !== ds.page()) {
        if (!noPage) {
          ds.page(target);
          render();
        }
      }
      position = index - pageSize * (target - 1);
      match = {
        length: ds.data().length,
        index: index,
        item: ds.view()[position]
      };
      $.publish("/details/update", [match]);
      return select(match.item.name);
    };
    dataSource = {
      create: function(data) {
        return ds = new kendo.data.DataSource({
          data: data,
          pageSize: pageSize,
          change: function() {
            return deselect();
          },
          sort: {
            dir: "desc",
            field: "name"
          },
          schema: {
            model: {
              id: "name"
            }
          }
        });
      }
    };
    add = function(item) {
      item = {
        name: item.name,
        file: item.file,
        type: item.type
      };
      if (!ds) {
        return ds = dataSource.create([item]);
      } else {
        return ds.add(item);
      }
    };
    create = function(item) {
      var element, fadeIn;
      element = {};
      fadeIn = function(e) {
        return $(e).kendoAnimate({
          effects: "fadeIn",
          show: true
        });
      };
      element = new Image();
      element.onload = fadeIn(element);
      element.src = item.file;
      element.setAttribute("data-name", item.name);
      element.setAttribute("draggable", true);
      element.width = 240;
      element.height = 180;
      element.setAttribute("class", "hidden");
      $(element).kendoMobileClickable({
        click: pub.click
      });
      return element;
    };
    render = function(flip) {
      var complete, item, thumbnail, thumbs, _i, _len, _ref;
      thumbs = [];
      _ref = ds.view();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        thumbnail = new kendo.View(pages.next, template);
        thumbs.push({
          dom: thumbnail.render({}, true),
          data: item
        });
      }
      $("#gallery").css("pointer-events", "none");
      complete = function() {
        var justPaged;
        setTimeout(function() {
          var _j, _len1, _results;
          _results = [];
          for (_j = 0, _len1 = thumbs.length; _j < _len1; _j++) {
            item = thumbs[_j];
            _results.push((function() {
              var element;
              element = create(item.data);
              return item.dom.append(element);
            })());
          }
          return _results;
        }, 50);
        pages.next.show();
        justPaged = pages.previous;
        justPaged.hide();
        justPaged.empty();
        pages.previous = pages.next;
        pages.next = justPaged;
        flipping = false;
        arrows.left.toggle(ds.page() > 1);
        arrows.right.toggle(ds.page() < ds.totalPages());
        $("#gallery").css("pointer-events", "auto");
        if (flip) {
          return setTimeout(function() {
            return at((ds.page() - 1) * pageSize);
          }, 50);
        }
      };
      if (flip) {
        return container.kendoAnimate({
          effects: animation.effects,
          face: animation.reverse ? pages.next : pages.previous,
          back: animation.reverse ? pages.previous : pages.next,
          duration: animation.duration,
          reverse: animation.reverse,
          complete: complete
        });
      } else {
        return complete();
      }
    };
    keys = {
      tokens: [],
      bind: function() {
        this.tokens.push($.subscribe("/keyboard/arrow", function(key) {
          var position;
          position = index % pageSize;
          switch (key) {
            case "left":
              if (index % columns > 0) {
                return at(index - 1, true);
              }
              break;
            case "right":
              if (index % columns < columns - 1) {
                return at(index + 1, true);
              }
              break;
            case "up":
              if (position >= columns) {
                return at(index - columns, true);
              }
              break;
            case "down":
              if (position < (rows - 1) * columns) {
                return at(index + columns, true);
              }
          }
        }));
        this.tokens.push($.subscribe("/keyboard/page", function(dir) {
          if (dir === "down") {
            page(-1);
          }
          if (dir === "up") {
            return page(1);
          }
        }));
        return this.tokens.push($.subscribe("/keyboard/enter", function() {
          return at(index % pageSize);
        }));
      },
      unbind: function() {
        return this.tokens = $.map(this.tokens, function(item) {
          return $.unsubscribe(item);
        });
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
        return arrows.both = $([arrows.left[0], arrows.right[0]]);
      }
    };
    return pub = {
      before: function(e) {
        console.log("Binding to key events");
        $.publish("/postman/deliver", [
          {
            paused: true
          }, "/camera/pause"
        ]);
        return keys.bind();
      },
      hide: function(e) {
        keys.unbind();
        pages.next.empty();
        return pages.previous.empty();
      },
      show: function(e) {
        return setTimeout(render, 420);
      },
      previous: function(e) {
        return page(1);
      },
      next: function(e) {
        return page(-1);
      },
      swipe: function(e) {
        return page((e.direction === "right") - (e.direction === "left"));
      },
      click: function(e) {
        var thumb;
        thumb = this.element;
        $.publish("/top/update", ["selected"]);
        return select(thumb.data("name"));
      },
      init: function(selector) {
        var page1, page2;
        page1 = new kendo.View(selector, null);
        page2 = new kendo.View(selector, null);
        container = page1.container;
        arrows.init($(selector).parent());
        pages.previous = page1.render().addClass("page gallery");
        active = pages.next = page2.render().addClass("page gallery");
        $.subscribe("/pictures/bulk", function(message) {
          ds = dataSource.create(message.message);
          ds.read();
          if (ds.view().length > 0) {
            return $.publish("/bottom/thumbnail", [ds.view()[0]]);
          }
        });
        $.subscribe("/gallery/details", function(d) {
          return details = d;
        });
        $.subscribe("/gallery/delete", function() {
          return destroy();
        });
        $.subscribe("/gallery/add", function(item) {
          return add(item);
        });
        $.subscribe("/gallery/at", function(index) {
          return at(index);
        });
        $.subscribe("/gallery/clear", function() {
          $.publish("/bottom/thumbnail");
          return filewrapper.clear().done(function() {
            return clear();
          });
        });
        $.subscribe("/gallery/keyboard", function() {
          return keys.bind();
        });
        $.publish("/postman/deliver", [{}, "/file/read"]);
        return gallery;
      }
    };
  });

}).call(this);
