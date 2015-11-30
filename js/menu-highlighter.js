//"use strict";

window.Freya = window.Freya || {};

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
Freya.highlightActiveMenuItem = function(navSelector) {
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
};
