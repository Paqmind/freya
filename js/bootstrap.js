"use strict";

// GLOBALS -----------------------------------------------------------------------------------------
var Freya = Freya || {};

window.pageHandlers = window.pageHandlers || [];

// DROPDOWNS ---------------------------------------------------------------------------------------
// Nested dropdowns (Bootstrap-3 shim)
$(function() {
  $('ul.dropdown-menu [data-toggle=dropdown]').on('click', function(event) {
    event.preventDefault();  // Avoid following the href location when clicking
    event.stopPropagation(); // Avoid having the menu to close when clicking

    $(this).parent().removeClass('open');
    $(this).parent().addClass('open');
  });
});

// TOOLTIPS ----------------------------------------------------------------------------------------
//window.pageHandlers.push(function(target) {
//  var $target = $(target);
//  var $tooltipToggle = $target.find('[data-toggle="tooltip"]');
//  if ($tooltipToggle.length) {
//    $tooltipToggle.tooltip({ 'trigger': 'manual', 'placement': 'right'});
//    $(document).on('click', '[data-toggle="tooltip"]', function(event) {
//      event.preventDefault();
//      var $this = $(this);
//      if ($this.parent().find('.tooltip').is(':visible')) {
//        $this.tooltip('hide');
//      } else {
//        $this.tooltip('show');
//      }
//    });
//    $(document).on('click', '.tooltip', function(event) {
//      event.preventDefault();
//      $(this).hide();
//    });
//  }
//});

// TABS  -------------------------------------------------------------------------------------------
// Activate current tab by hash
$(function () {
  window.activateTabByHash = function (hash) {
      if (hash.indexOf("#tab-") !== -1) {
          var a = $('.nav a[data-toggle=tab][href="' + hash + '"]');
          if (a.length) {
              a.tab('show');
          }
      }
  };
  window.activateTabByHash(window.location.hash);

  function changeActiveTabNav(control) {
    var $tabs = $(control).closest('.tabs');
    var $navTabs = $tabs.find('.nav-tabs');
    var id = $(control).attr("href");
    $navTabs.find('li').removeClass('active');
    $navTabs.find('a[href=' + id + ']').closest('li').addClass('active');
  }

  window.pageHandlers.push(function(target) {
    var $target = $(target);
    var $tabs = $target.find('.tabs');
    if ($tabs.length) {
      $tabs.find('.tab-next').on('click', function () {
        changeActiveTabNav(this);
      });
      $tabs.find('.tab-prev').on('click', function () {
        changeActiveTabNav(this);
      });
    }
  });
});
