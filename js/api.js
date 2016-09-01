"use strict";

window.Freya = window.Freya || {};

Freya.confs = Freya.confs || {};
Freya.confs.csrfToken = Freya.confs.csrfToken || window.CONFIG.csrfToken;

Freya.getFullURL = function(url) {
  return url.indexOf(window.location.hostname) > -1
         ? url
         : window.location.protocol + "//" + window.location.hostname +
           (window.location.port ? ":" : "") + window.location.port +
           (url[0] != "/" ? "/" : "") + url;
}

Freya.get_popup = function (url, $button, currentButtonHtml) {
  var $alerts = window.$alerts || $('#alerts');
  // Ability to load popup via ajax url
  $.get(url).done(function (data, textStatus, jqXHR) {
    if (data) {
      if (data.redirect_url) {
        var redirect_url = Freya.getFullURL(data.redirect_url);
        if (redirect_url == document.URL) {
          location.reload();
          return;
        } else {
          window.location.href = redirect_url;
          return;
        }
      }

      var $popup = $(data.data_html);
      $('body').append($popup);
      window.rebind($popup);
      $popup.modal('show');
      $popup.on('hidden.bs.modal', function (event) {
        $popup.remove();
      });
      if (data.flash_html) {
        $alerts.append(data.flash_html);
      } else if (data.flash_html === '') {
        $alerts.html('');
      }
    }
  })
    .always(function () {
      if ($button !== undefined) {
        Freya.enableSubmitBtn($button, currentButtonHtml);
      }
    });
};

var done_handler = function (data, textStatus, jqXHR, $initiator) {

    if (data) {
      if (data.redirect_url) {
        // The difference between `location.reload()` and `window.location.href`
        // is that if we do window.location.href on the current page, it will set the scroll top position to zero
        // as with `location.reload()` scroll position will stay as previous
        // That is why if redirect_url is the same as the current URL, we will use `location.reload()` function

        // Note: data.redirect_url can be in two differect formats:
        // as absolute URL, including domain, and as path only, without domain
        // That is why we convert it always to the FULL URL

        var redirect_url = Freya.getFullURL(data.redirect_url);
        if (redirect_url == document.URL) {
          location.reload();
          return;
        } else {
          window.location.href = redirect_url;
          return;
        }
      }

      // new wrapper can be the same as current, or be insede, or be outside
      if (data.data_html || data.data_html === '') {
        var wrapper, $wrapper;
        var $newData = $(data.data_html);
        if (data.settings && data.settings['openPopup']) {
          var $popup = $newData;
          $('body').append($popup);
          window.rebind($popup);
          $popup.modal('show');
          $popup.on('hidden.bs.modal', function (event) {
            $popup.remove();
          });
        } else {
          if ($initiator) {
            if ($initiator.data('wrapper')) {
              $wrapper = $initiator.closest($initiator.data('wrapper'));
              if ($wrapper.length) {
                if ($initiator.data('wrapper') == '.modal-content') {
                  $newData = $newData.find('.modal-content');
                }
              } else {
                $wrapper = $($initiator.data("wrapper"));
              }
            } else if ($initiator.is('form')) {
              $wrapper = $initiator.closest('form');
            } else if ($initiator.is('button')) {
              $wrapper = $initiator.closest('.model-item');
            }
          } else if (data.settings && data.settings['wrapper']) {
            $wrapper = $(data.settings['wrapper']);
          }
        }
        if ($wrapper && $wrapper.length) {
          $wrapper = $newData.replaceAll($wrapper);
          window.rebind($wrapper, data.settings);
        }
      } else if (data.settings) {
        window.rebind($('body'), data.settings);
      }

      if (data.flash_html) {
        $alerts.html(data.flash_html);
      }

    } else {
      console.log('Data from ajax request is empty')
    }
  };

Freya.API = {};
Freya.API.done_handler = done_handler;

$(function () {

  var $alerts = window.$alerts || $('#alerts');

  // API for BUTTON that updates content on page (using GET method)
  $(document.body).on('click', 'button[data-api="ajax.get"]', function (event) {
    event.preventDefault();
    var $button = $(this);
    var url = $button.attr('action');
    var confirm = $button.attr('data-confirm');

    //To prevent multisending
    var currentButtonHtml = Freya.disableSubmitBtn($button);

    function handle() {
      $.ajax({
        type: 'get',
        url: url,
                data: {'value': $button.val(), 'next': document.URL}
      })
        .done(function (data, textStatus, jqXHR) {
          done_handler(data, textStatus, jqXHR, $button);
        })
        .always(function () {
          Freya.enableSubmitBtn($button, currentButtonHtml);
        });
    }

    if (confirm) {
      window.bootbox.confirm(confirm, function (result) {
        if (result) {
          handle();
        }
      });
    } else {
      handle();
    }
  });

  // API for FORM that updates content on page by changing any field
  $(document.body).on('change', 'form[data-api="ajax.autoreload"] :input', function (event) {
    event.preventDefault();
    var $form = $(this).closest('form');
    var $submit = $form.find('button[type="submit"]');
    var $method = $form.data('api-method');

    // To prevent multisending
    var currentButtonHtml = Freya.disableSubmitBtn($submit);

    // Update URL if form.method == GET
    if ($form.attr('method') == 'GET') {
      var url = $form.data('api-action');
      var path = url.indexOf("?") >= 0 ? url + '&' + $form.serialize() : url + '?' + $form.serialize();
      path += "&" + $submit.attr("name") + "=" + $submit.val();
      window.history.pushState({}, $(document).find("title").text(), path);
    }

    var formData = $form.serializeArray();
    formData.push({name: $submit.attr("name"), value: $submit.val()});

    function handle() {
      $.ajax({
        type: $form.data('api-action') ? $method : $form.attr('method'),
        url: $form.data('api-action') || $form.attr('action'),
        data: formData,
      })
      .done(function (data, textStatus, jqXHR) {
        done_handler(data, textStatus, jqXHR, $form);
      })
      .always(function () {
        Freya.enableSubmitBtn($submit, currentButtonHtml);
      });
    }

    handle();
  });

  // API for BUTTON that updates model on page (card usual)
  $(document.body).on('click', 'button[data-api="ajax.update"]', function (event) {
    event.preventDefault();
    var $button = $(this);
    var url = $button.attr('action');
    var confirm = $button.attr('data-confirm');

    //To prevent multisending
    if (!confirm) {
      var currentButtonHtml = Freya.disableSubmitBtn($button);
    }

    function handle() {

      if (Freya.confs.csrfToken) {
        var setting = {
          beforeSend: function (xhr) {
            xhr.setRequestHeader("X-CSRFToken", Freya.confs.csrfToken)
          }
        }
      }
      $.ajax($.extend(setting, {
        type: 'post',
        url: url,
                data: {'value': $button.val(), 'next': document.URL}
      }))
        .done(function (data, textStatus, jqXHR) {
          done_handler(data, textStatus, jqXHR, $button);
        })
        .always(function () {
          if (!confirm) {
            Freya.enableSubmitBtn($button, currentButtonHtml);
          }
        });
    }

    if (confirm) {
      window.bootbox.confirm(confirm, function (result) {
        if (result) {
          handle();
        }
      });
    } else {
      handle();
    }
  });

  // API for FORM that works by ajax
  $(document.body).on('click', 'form[data-api="ajax.update"] button[type="submit"]', function (event) {

    event.preventDefault();
    var $form = $(this).closest('form[data-api="ajax.update"]');
    var formData = $form.serializeArray();
    var $button = $(this);

    // To prevent multisending
    var currentButtonHtml = Freya.disableSubmitBtn($button);

    formData.push({name: $button.attr('name'), value: $button.val()});
    formData.push({name: 'next', value: document.URL});
    $.ajax({
      type: $form.attr('method'),
      url: $form.attr('action'),
      data: formData,
    })
      .done(function (data, textStatus, jqXHR) {
        done_handler(data, textStatus, jqXHR, $form);
      })
      .always(function () {
        Freya.enableSubmitBtn($button, currentButtonHtml);
      });
  });

  // POPUP - GET
  $(document.body).on('click', 'button[data-api="ajax.popup"]', function (event) {
    event.preventDefault();
    var $button = $(this);
    var url = $button.attr('action');

    // To prevent multisending
    var currentButtonHtml = Freya.disableSubmitBtn($button);
    Freya.get_popup(url, $button, currentButtonHtml);
  });

  // POPUP - FORM
  $(document.body).on('click', '.modal[data-api="ajax.popup"] form [type="submit"]', function (event) {
    event.preventDefault();

    //To prevent multisending
    var $button = $(this);
    var currentButtonHtml = Freya.disableSubmitBtn($button);

    var $form = $button.closest('form');
    var $popup = $form.closest('.modal[data-api="ajax.popup"]');
    var confirm = $button.attr('data-confirm');
    var url = $form.attr('action');

    function handle() {
      if (Freya.confs.csrfToken) {
        var setting = {
          beforeSend: function (xhr) {
            xhr.setRequestHeader("X-CSRFToken", Freya.confs.csrfToken)
          }
        }
      }

      var formData = $form.serializeArray();
      formData.push({name: $button.attr('name'), value: $button.val()});
      formData.push({name: 'next', value: document.URL});

      $.post(url, formData).done(function (data, textStatus, jqXHR) {
        if (data) {
          if (data.redirect_url) {
            var redirect_url = Freya.getFullURL(data.redirect_url);
            if (redirect_url == document.URL) {
              location.reload();
              return;
            } else {
              window.location.href = data.redirect_url;
              return;
            }
          }
          if (data.settings && data.settings['closePopup']) {
            if (!confirm) $popup.modal('hide'); // else it was already closed before
            done_handler(data, textStatus, jqXHR, null);
          } else {
            if (data.data_html) {
              // To make update quicker and to not reinit popup
              $popup.find('.modal-body').replaceWith($(data.data_html).find('.modal-body'));
              window.rebind($popup);
            }
            if (data.flash_html) {
              $alerts.append(data.flash_html);
            } else if (data.flash_html === '') {
              $alerts.html('');
            }
          }
        }
      })
        .always(function () {
          Freya.enableSubmitBtn($button, currentButtonHtml);
        });
    }

    if (confirm) {
      $popup.modal('hide');
      window.bootbox.confirm(confirm, function (result) {
        if (result) {
          handle();
        } else {
          Freya.enableSubmitBtn($button, currentButtonHtml);
        }
      });
    } else {
      handle();
    }
  });
});
