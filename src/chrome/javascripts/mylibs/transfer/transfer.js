// Generated by CoffeeScript 1.4.0
(function() {

  define([], function() {
    'use strict';

    var destination, pub, template, transferrer, wrapper;
    template = null;
    destination = null;
    transferrer = null;
    wrapper = null;
    return pub = {
      init: function() {
        template = $("#transfer-animation-template div");
        destination = $("#destination");
        return wrapper = $(".wrapper");
      },
      setup: function() {
        transferrer = template.clone();
        transferrer.offset(wrapper.offset());
        transferrer.width(wrapper.width());
        transferrer.height(wrapper.height());
        return transferrer.appendTo($("body"));
      },
      add: function(file) {
        if (transferrer === null) {
          return;
        }
        return $("<img />", {
          src: file.file
        }).appendTo(transferrer);
      },
      run: function(callback) {
        if (transferrer === null) {
          return;
        }
        return transferrer.kendoStop().kendoAnimate({
          effects: "transfer",
          target: destination,
          duration: 1000,
          ease: "ease-in",
          complete: function() {
            transferrer.remove();
            transferrer = null;
            return callback();
          }
        });
      }
    };
  });

}).call(this);