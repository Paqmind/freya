"use strict";

var Freya = Freya || {};

// TYPE: control text width: no more then 75 cpl
// http://www.pearsonified.com/2012/01/characters-per-line.php
Freya.textHolder = function () {
    $.each(this, function () {
        var $this = $(this);
        if ($this.closest('.notext-holder').length) return;
        var fontSize = parseInt($this.css('font-size')); // result will always in pixels
        var maxwidth = 75 * (fontSize / 2.1);
        $this.css('max-width', maxwidth);
    });
    return this;
};
