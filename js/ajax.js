"use strict";

window.Freya = window.Freya || {};

$(function () {
  // Tests: https://github.com/scabbiaza/ajax-errors-handler
  $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
    jqXHR.fail(function (jqXHR, textStatus, errorThrown) {
      var message = options.url + ": ";
      if (textStatus == 'parsererror')    message += "Parsing request was failed – " + errorThrown;
      else if (errorThrown == 'timeout')  message += "Request time out.";
      else if (errorThrown == 'abort')    message += "Request was aborted.";
      else if (jqXHR.status === 0)        message += "No connection.";
      else if (jqXHR.status)              message += "HTTP Error " + jqXHR.status + " – " + jqXHR.statusText + ".";
      else                                message += "Unknown error.";
      alert(message);
    });
  });
});
