(function() {

  define([], function(file) {
    var asyncFileRequest, pub;
    asyncFileRequest = function(requestMessage, responseMessage, data) {
      var deferred, token;
      deferred = $.Deferred();
      token = $.subscribe(responseMessage, function(result) {
        $.unsubscribe(token);
        return deferred.resolve((result || {}).message);
      });
      $.publish("/postman/deliver", [data, requestMessage, []]);
      return deferred.promise();
    };
    return pub = window.filewrapper = {
      list: function() {
        return asyncFileRequest("/file/list", "/file/listResult", {});
      },
      readAll: function() {
        return asyncFileRequest("/file/read", "/pictures/bulk", {});
      },
      deleteFile: function(filename) {
        return asyncFileRequest("/file/delete", "/file/deleted/" + filename, {
          name: filename
        });
      },
      save: function(filename, blob) {
        return asyncFileRequest("/file/save", "/file/saved/" + filename, {
          name: filename,
          file: blob
        });
      },
      readFile: function(filename) {
        return asyncFileRequest("/file/readFile", "/pictures/" + filename, {
          name: filename
        });
      }
    };
  });

}).call(this);
