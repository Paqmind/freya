"use strict";

var Freya = Freya || {};

Freya.get_popup = function (url) {

    // Ability to load popup via ajax url
    $.get(url).done(function (data, textStatus, jqXHR) {
        if (data) {
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
    });
};

$(function () {

    var $alerts = $alerts || $('#alerts');

    var done_handler = function (data, textStatus, jqXHR, $initiator) {

        if (data) {
            if (data.redirect_url) {
                if (data.redirect_url == document.URL) {
                    location.reload();
                } else {
                    window.location.href = data.redirect_url;
                }
            }

            // Ability to replace any block on the page with any block from returned html
            var $wrapper = $('body');
            if ($initiator) {
                if ($initiator.data('wrapper')) {
                    $wrapper = $initiator.data('wrapper');
                } else if ($initiator.is('form')) {
                    $wrapper = $initiator.closest('form');
                    $wrapper.context = document;
                } else if ($initiator.is('button')) {
                    $wrapper =  $initiator.closest('.model-item');
                }
            } else if (data.settings && data.settings['wrapper']) {
                $wrapper = $(data.settings['wrapper']);
            }

            if (data.data_html || data.data_html === '') {
                $wrapper.html(data.data_html);
            }

            window.rebind($wrapper, data.settings);

            if (data.flash_html) {
                $alerts.html(data.flash_html);
            }

        } else {
            console.log('Data from ajax request is empty')
        }
    };

    // API for BUTTON that updates content on page (using GET method)
    $(document.body).on('click', 'button[data-api="ajax.get"]', function (event) {
        event.preventDefault();
        var $button = $(this);
        var url = $button.attr('action');
        var confirm = $button.attr('data-confirm');

        function handle() {
            $.ajax({
                type: 'get',
                url: url,
                data: {'value': $button.val(), 'next': document.URL}
            })
            .done(function (data, textStatus, jqXHR) {
                done_handler(data, textStatus, jqXHR, $button);
            });
        }

        if (confirm) {
            bootbox.confirm(confirm, function (result) {
                if (result) {
                    handle();
                }
            });
        } else {
            handle();
        }
    });

    // API for BUTTON that updates model on page (card usual)
    $(document.body).on('click', 'button[data-api="ajax.update"]', function (event) {
        event.preventDefault();
        var $button = $(this);
        var url = $button.attr('action');
        var confirm = $button.attr('data-confirm');

        function handle() {
            if (csrftoken) {
                var setting = { beforeSend: function (xhr) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken)
                }}
            }
            $.ajax($.extend(setting, {
                type: 'post',
                url: url,
                data: {'value': $button.val(), 'next': document.URL}
            }))
            .done(function (data, textStatus, jqXHR) {
                done_handler(data, textStatus, jqXHR, $button);
            });
        }

        if (confirm) {
            bootbox.confirm(confirm, function (result) {
                if (result) {
                    handle();
                }
            });
        } else {
            handle();
        }
    });

    // API for FORM that works by ajax
    $(document.body).on('click', 'form[data-api="ajax.update"] input[type="submit"]', function (event) {
        event.preventDefault();
        var $form = $(this).closest('form[data-api="ajax.update"]');
        var formData = $form.serializeArray();

        formData.push({ name: this.name, value: this.value });
        formData.push({ name: 'next', value: document.URL });
        $.ajax({
            type: 'post',
            url: $form.attr('action'),
            data: formData
        })
        .done(function (data, textStatus, jqXHR) {
            done_handler(data, textStatus, jqXHR, $form);
        });
    });

    // POPUP - GET
    $(document.body).on('click', 'button[data-api="ajax.popup"]', function (event) {
        event.preventDefault();
        var $button = $(this);
        var url = $button.attr('action');
        Freya.get_popup(url);
    });

    // POPUP - FORM
    $(document.body).on('click', '.modal[data-api="ajax.popup"] form [type="submit"]', function (event) {
        event.preventDefault();

        var $button = $(this);
        var $form = $button.closest('form');
        var $popup = $form.closest('.modal[data-api="ajax.popup"]');
        var confirm = Boolean(Number($button.attr('confirm')));

        var url = $form.attr('action');
        var formData = $form.serializeArray();
        formData.push({ name: this.name, value: this.value });
        formData.push({ name: 'next', value: document.URL });
        $.post(url, formData).done(function (data, textStatus, jqXHR) {
            if (data) {
                if (data.redirect_url) {
                    if (data.redirect_url == document.URL) {
                        location.reload();
                    } else {
                        window.location.href = data.redirect_url;
                    }
                }
                if (data.settings && data.settings['closePopup']) {
                    $popup.modal('hide');
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
        });
    });
});
