"use strict";

$(function () {
  // UPDATE
  $(document.body).on("click", 'button[data-api="ajax.update"]', function(event) {
    var $button = $(this);
    var url = $button.attr('action');
    var confirm = Boolean(Number($button.attr('confirm')));

    function handle() {
      $.post(url, {value: $button.val()}).done(function(data, textStatus, jqXHR) {
        if (data) {
          if (data.redirect) {
            window.location.href = data.redirect;
          }
          if (data.data_html || data.data_html === '') {
            // Custom content-replacement action (edit here!)
            var $row = $button.closest('.model-item');
            $row.replaceWith(data.data_html);
          }
          if (data.flash_html) {
            $alerts.append(data.flash_html);
          } else if (data.flash_html === '') {
            $alerts.html('');
          }
        }
      }).fail(window.failLoading);
    }

    if (confirm) {
      bootbox.confirm(msgs[locale]['Confirm action'], function(result) {
        if (result) {
          handle();
        }
      });
    } else {
      handle();
    }
  });

  // ERROR HANDLERS
  $(document).ajaxError(function (event, jqXHR, ajaxSettings, thrownError) {
    // Possible values for thrownError argument are "timeout", "error", "abort", and "parsererror".
    // When an HTTP error occurs, errorThrown receives the textual portion of the HTTP status
    var message = ajaxSettings.url + ": ";
    if (thrownError == 'parsererror')   message += "Parsing request was failed.";
    else if (thrownError == 'timeout')  message += "Request time out.";
    else if (thrownError == 'abort')    message += "Request was aborted.";
    else if (jqXHR.status === 0)        message += "No connection.";
    else if (jqXHR.status)              message += "HTTP Error " + jqXHR.status + " – " + jqXHR.statusText + ".";
    else                                message += "Unknown error.";
    alert(message);
  });

});
