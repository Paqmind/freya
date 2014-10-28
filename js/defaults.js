"use strict";

var Freya = Freya || {};

$(function() {
  // Prevent default browser behavior for file dropping
  // (by default, pages have single uploading area)
  $(document).bind("drop dragover", function (e) {
    e.preventDefault();
  });
});

