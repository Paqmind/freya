/*
 Automatically AJAX JQUERY REQUESTS and RESPONSES

 HOW IT WORKS:
 Run FreyaAPI with options

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
          FreyaAPI.run($(this), $alerts, options);
        } catch (Error) {
          console.error(Error.message);
        }
      });
    }

    var $fields = $('form.ajax', target);
    $fields.on('submit', function() {
        event.preventDefault();
        try {
          FreyaAPI.run($(this), $alerts);
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
    To make ajax request sequence, run two+ FreyaAPI using promises.

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

var FreyaAPI = {
  run: function($initiator, $alerts, options) {
    FreyaAPI.init($initiator, $alerts, options);
    return FreyaAPI.sendRequest($initiator);
  },

  init: function($initiator, $alerts, options) {
    FreyaAPI.$alerts = $alerts;
    FreyaAPI.initOptions($initiator, options);
  },

  initOptions: function($initiator, options) {
    options = options || {};
    options.endpoint = options.endpoint || undefined;
    options.method = options.method || undefined;
    options.input = options.input || undefined;
    options.output = options.output || undefined;
    options.popup = options.popup || false;
    options.confirm = options.confirm || false;
    options.csrftoken = options.csrftoken || undefined;

    var closestForm = $initiator.closest('form');
    var closestPopup = $initiator.closest('.modal-body');

    if (closestForm.length) {
      options.closestForm = closestForm;
    }
    if (closestPopup.length) {
      options.closestPopup = closestPopup;
    }

    // Endpoint should be set or initializator should be in form (or the form) with setted `action` attr.
    if (!options.endpoint) {
      if (closestForm.length) {
        options.endpoint = closestForm.attr('action');
      }
    }

    if (!options.endpoint) {
      throw new Error("Set options.endpoint or put initiator of requests in form and set `action` attr");
    }

    // If output is empty, it can set automatical to parent form or popup
    if (!options.output) {
      if (closestForm.length) {
        options.output = closestForm;
      }
      else if (closestPopup.length) {
        options.output = closestPopup;
      }
    }

    // Update method option if initiator is a form
    if (!options.method) {
      if (closestForm.length) {
        options.method = closestForm.attr('method');
      }
    }
    if (!options.method) {
      options.method = "POST";
    }

    FreyaAPI.options = options;
  },

  sendRequest: function ($initiator) {
    var options = FreyaAPI.options;

    // Show confirm popup before send request if required
    if (options.confirm) {
      bootbox.confirm(confirm, function (result) {
        if (!result) {
          return;
        }
      });
    }

    var data = [{'next': window.document.URL}];

    // Create data for request
    if (options.input) {
      $.merge(data, {'value': options.input});
    } else if (options.closestForm) {
      $.merge(data, options.closestForm.serializeArray());
      $.merge(data, {'name': $initiator.attr('name'), 'value': $initiator.attr('value') }); // button data

      data = options.closestForm.serializeArray();
    }

    // Add headers
    var settings = { beforeSend: function (xhr) {
        //xhr.setRequestHeader("Content-Type",  "application/vnd.api+json");
    }};

    if (options.csrftoken) {

      settings = { beforeSend: function (xhr) {
        //xhr.setRequestHeader("Content-Type",  "application/vnd.api+json");
        xhr.setRequestHeader("X-CSRFToken", options.csrftoken);
      }}
    }

    // Send Request
    return $.ajax($.extend(settings, {
      type: options.method,
      url: options.endpoint,
      data: data
    }))
    .done(function (data, textStatus, jqXHR) {
      FreyaAPI.doneHandler(data);
    });
  },

  doneHandler: function(data) {
    var options = FreyaAPI.options;

    // Do redirect if needed
    if (data.links) {
      var redirectURL = data.links.next;
      if (redirectURL) {
        if (document.URL == redirectURL) {
          location.reload();
          return;
        } else {
          location.href = redirectURL;
          return;
        }
      }
    }

    var alerts = data.data.alerts;
    var html = data.data.html;

    // Update alers on page
    if (alerts) {
      FreyaAPI.$alerts.append(alerts);
    } else if (alerts === '') {
      FreyaAPI.$alerts.html('');
    }

    // Update html on the page
    FreyaAPI.updateHTML(html);

    // Rebind events
    window.rebind(options.output);
  },

  updateHTML: function(html) {
    var options = FreyaAPI.options;

    // Case with popups: add & close
    if (options.popup) {
      FreyaAPI.addPopup(html);
      return;
    }

    if (options.closestPopup && !html) {
      FreyaAPI.closePopup(options.closestPopup);
    }

    // Update html
    $(options.output).html(html);
  },

  addPopup: function(html) {
    var $popup = $(html);
    $('body').append($popup);
    $popup.modal('show');
    $popup.on('hidden.bs.modal', function (event) {
      $popup.remove();
    });
    return $popup;
  },

  closePopup: function($popup) {
    $popup.remove();
  },
};
