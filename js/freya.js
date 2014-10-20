'use strict';

window.pageHandlers = window.pageHandlers || [];

if (!window.console) {
    window.console = {
        log: function log(text) {}
    };
}

if (!window.getType) {
    // Get element type: String, Number etc.
    window.getType = function getType(value) {
        return Object.prototype.toString.call(value).slice(8, -1);
    }
}

$(document).ready(function () {
    'use strict';

    // BUG FIX WITH FONT-FACE IN WEBKIT
    // https://code.google.com/p/chromium/issues/detail?id=336476
    $('body').delay(50).queue(
        function(next){
            $(this).css('padding-right', '1px').dequeue();
        }
    );

    // PREVENT DEFAULT BROWSER BEHAVIOR FOR FILE DROPPING
    $(document).bind('drop dragover', function (e) {
        e.preventDefault();
    });
});

// HELPERS ---------------------------------------------------------------------
// Get real width and height even for hidden element
$.fn.getRealDimensions = function (outer) {
    var $this = $(this);
    if ($this.length == 0) {
        return false;
    }
    var $clone = $this.clone()
        .show()
        .css('visibility','hidden')
        .appendTo('body');
    var result = {
        width:      (outer) ? $clone.outerWidth() : $clone.innerWidth(),
        height:     (outer) ? $clone.outerHeight() : $clone.innerHeight(),
        offsetTop:  $clone.offset().top,
        offsetLeft: $clone.offset().left
    };
    $clone.remove();
    return result;
};

// TYPE: control text width: no more then 75 cpl
// http://www.pearsonified.com/2012/01/characters-per-line.php
$.fn.textHolder = function () {
    $.each(this, function () {
        var $this = $(this);
        if ($this.closest('.notext-holder').length) return;
        var fontSize = parseInt($this.css('font-size')); // result will always in pixels
        var maxwidth = 75 * (fontSize / 2.1);
        $this.css('max-width', maxwidth);
    });
    return this;
};

// FEATURES --------------------------------------------------------------------
// ACTIVATE CURRENT TAB BY HASH
(function () {
    window.activateTabByHash = function(hash) {
        if (hash.indexOf("#tab-") !== -1) {
            var a = $('.nav a[data-toggle=tab][href="' + hash + '"]');
            if (a.length) {
                a.tab('show');
            }
        }
    };
    window.activateTabByHash(window.location.hash);
})();

// UI --------------------------------------------------------------------------
// PASSWORD FIELDS # TODO move to paqforms?
window.pageHandlers.push(function(target) {
    var $target = $(target);
    var $inputPassword = $target.find('input[type=password]');
    if ($inputPassword.length) {
        $inputPassword.showPassword({'message': msgs[locale]['Toggle visibilty']});
    }
});

// BOOTBOXES
if (window.bootbox) {
    bootbox.setDefaults({locale: locale});
    window.failLoading = function(xhr, textStatus, errorThrown) {
    bootbox.alert('<p class="lead">' + errorThrown + '</p><p>' + this.type + ' ' + this.url + '</p>');
};
}

// TOOLTIPS
window.pageHandlers.push(function(target) {
    var $target = $(target);
    var $tooltipToggle = $target.find('[data-toggle="tooltip"]');
    if ($tooltipToggle.length) {
        $tooltipToggle.tooltip({ 'trigger': 'manual', 'placement': 'right'});
        $(document).on('click', '[data-toggle="tooltip"]', function(event) {
            event.preventDefault();
            var $this = $(this);
            if ($this.parent().find('.tooltip').is(':visible')) {
                $this.tooltip('hide');
            } else {
                $this.tooltip('show');
            }
        });
        $(document).on('click', '.tooltip', function(event) {
            event.preventDefault();
            $(this).hide();
        });
    }
});

// DROPDOWN-FIX (Bootstrap-3 no longer supports nested dropdowns)
(function () {
    $('ul.dropdown-menu [data-toggle=dropdown]').on('click', function(event) {
        event.preventDefault();  // Avoid following the href location when clicking
        event.stopPropagation(); // Avoid having the menu to close when clicking

        $(this).parent().removeClass('open');
        $(this).parent().addClass('open');
    });
})();

// MENU (ACTIVATE ITEMS)
/**
 * Commands:
 *     menu-skip
 *     menu-strict
 *     menu-href
 *
 * Rules:
 *     1. Relative links are not supported for now
 *     2. Links with empty hrefs are unactive
 *     3. Full absolute links are unactive. Example: http://ya.ru
 *     4. Links with hashmarks are unactive. Example: /some-page#see-this
 *
 * /docs/part-1 (window.location.href) activates URL /docs/part-1
 * /docs/part-1 (window.location.href) activates URL /docs if not strict
 */
function highlightActiveMenuItem(navSelector) {
    var navSelector = navSelector || 'nav';

    function isActive(path, strict) {
        path = path.replace('/private/', '/'); // TODO: unquote(url).replace(...)
        var currentPath = window.location.pathname.replace('/private/', '/');

        if (!path) return false;
        if (path.indexOf('#') !== -1) return false;

        if (strict) {
            if (currentPath == path) {
                return true;
            }
        }
        else {
            if (currentPath.indexOf(path) === 0) {
                return true;
            }
        }

        return false;
    }

    var as = document.querySelectorAll(navSelector + ' li > a');
    for (var i = 0, a; a = as[i]; i++) {
        var skip = a.hasAttribute('menu-skip') || false;
        a.removeAttribute('menu-skip');

        var strict = a.hasAttribute('menu-strict') || false;
        a.removeAttribute('menu-strict');

        var href = a.getAttribute('menu-href') || a.getAttribute('href');
        a.removeAttribute('menu-href');

        if (!skip) {
            if (isActive(href, strict)) {
                a.parentNode.classList.add('active');
            }
        }
    }
}

// API -------------------------------------------------------------------------
// UPDATE
(function () {
    $(document.body).on('click', 'button[data-api="ajax.update"]', function(event) {
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
})();

// SET
(function () {
    $(document.body).on('click', 'button[data-api="ajax.set"]', function(event) {
        var $button = $(this);
        var url = $button.attr('action');
        var confirm = Boolean(Number($button.attr('confirm')));

        $.post(url, {value: $button.val()}).done(function(data, textStatus, jqXHR) {
            if (data) {
                if (data.redirect) {
                    window.location.href = data.redirect;
                }
                if (data.flash_html) {
                    $alerts.append(data.flash_html);
                } else if (data.flash_html === '') {
                    $alerts.html('');
                }
            }
            if ($button.val() == '1') {
                $button.attr('title', 'Unfav');
                $button.val('0');
                $button.html('<span class="fa fa-star"></span>');
            } else {
                $button.attr('title', 'Favup');
                $button.val('1');
                $button.html('<span class="fa fa-star-o"></span>');
            }
        }).fail(window.failLoading);
    });
})();

// TABLE-FIXED-HEADER (should be before MODEL: MASTER TOGGLE)
/*(function () {
    var $fixedHeaderTable = $('.table-fixed-header');
    if ($fixedHeaderTable.length) {
        $fixedHeaderTable.fixedHeader({
            topOffset: window.topOffset
        });
    }
})();*/
