/*
 Automatically AJAX JQUERY REQUESTS and RESPONSES

 HOW IT WORKS:
 Run FreyaAjax with options

 Example:
 ```
  window.pageHandlers.push(function (target) {
    var $alerts = $('#alerts');

    var $fields = $('button.ajax', target);
    if ($fields.length) {
      var options = {"endpoint": "http://url"}
      $fields.on('click', function() {
        event.preventDefault();
        try {
          FreyaAJAX.run($(this), $alerts, options);
        } catch (Error) {
          console.error(Error.message);
        }
      });
    }

    var $fields = $('form.ajax', target);
    $fields.on('submit', function() {
        event.preventDefault();
        try {
          FreyaAJAX.run($(this), $alerts);
        } catch (Error) {
          console.error(Error.message);
        }
    });
  });

 Options:
 endpoint="<URL>"      - URL for ajax request. It should be set or initializator should be
                              in form (or the form) with setted `action` attr.

 method="POST"         - POST is by default.

 output="<SELECTOR>"   - block to update. If it's empty and initiator is in form or popup,
                              output will be form or popup. It can be empty and initiator can be not form and not popup,
                              for redirect case.

 input="<DATA>"        - data to send by ajax. If it will be empty or not set,
                              Freya will try to find closest form and will send form's data,
                              including csrf (if it's exist) and button data, that called submit.

 popup="<BOOLEAN>"     - set "true" to initialize popup and add result from server to it.

 confirm="BOOLEAN"     - set "true" to show confirm dialog before send an ajax request.

 Answer from server:
 User jsonapi.org format

 {
  "links": {
    "next": "", << URL to redirect
  },
  "data": {
    "alerts": ""
    "html": ""
  },
  "error": {
  }
}

 Cases:
 0. Do redirect after ajax:
    if the answer from server has `links[next]` -> Freya will do redirect

 1. Update html by selector:
    Specify selector in `options.output`
    First Freya will try to find this selector as initiator's parent and update it.
    If it will not find it there, it will try to find it in body and update it.
    If options.output is not spezified, if will try to find nearest form, and then nearest popup.
    After that Freya will call reinit with target options.output

 2. Update form:
    Form will be updated by yourself: all, what is inside <form> tag.
    After that Freya will call reinit with target this particular <form>

 3. Update two+ blocks after ajax request:
    this case should be doing by having two+ ajax requests: every ajax request will update ONE block
    To make ajax request sequence, run two+ FreyaAjax using promises.

 4. Add requested html in popup:
    Add to options.popup="true" to do this

 5. Update popup:
    The same as usual html update, don't set `output`, and Freya will update '.modal-body'

 6. Update form in popup
    The same as usual html update, don't set `output`, and Freya will update current form in popup

 7. Close popup:
    Popup will be closed if response from server will be empty

 8. Close popup and update the code by some selector:
    Use two request: first should return empty content to close popup,
    Then second request will be called and update any other code on the page.
*/


"use strict";

var Freya = Freya || {};

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
