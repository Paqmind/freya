"use strict";

var Freya = Freya || {};

// Get real width and height even for hidden element
Freya.getRealDimensions = function ($el, outer) {
  if ($el.length == 0) {
    return false;
  }
  var $clone = $el.clone()
    .show()
    .css("visibility","hidden")
    .appendTo("body");
  var result = {
    width:      (outer) ? $clone.outerWidth() : $clone.innerWidth(),
    height:     (outer) ? $clone.outerHeight() : $clone.innerHeight(),
    offsetTop:  $clone.offset().top,
    offsetLeft: $clone.offset().left
  };
  $clone.remove();
  return result;
};

// Clean MSWord tags
Freya.cleanWordHtml = function(input) {
    // 1. remove line breaks / Mso classes
    var stringStripper = /(\n|\r| class=(")?Mso[a-zA-Z]+(")?)/g;
    var output = input.replace(stringStripper, ' ');

    // 2. strip Word generated HTML comments
    var commentSripper = new RegExp('<!--(.*?)-->', 'g');
    var output = output.replace(commentSripper, '');

    // 3. remove &nbsp;
    var output = output.replace(/&nbsp;/gi, '');
    return output;
}

Freya.removeAttributes = function (value) {
    var content = $('<article/>').html(value);
    $(content).find('*').each(function(){
        $(this).removeAttributes();
    });
    return $(content)[0].outerHTML;
}

jQuery.fn.removeAttributes = function() {
    return this.each(function() {
        var attributes = $.map(this.attributes, function(item) {
            return item.name;
        });
        var tag = $(this);
        $.each(attributes, function(i, item) {
            if (item !== 'href'){
                tag.removeAttr(item);
            }
        });
    });
}

// Left only valid tags in the string
Freya.sanitize_html = function(value, valid_tags) {
    value = Freya.cleanWordHtml(value);
    value =  Freya.removeAttributes(value);
    valid_tags.join('')
            .toLowerCase()
            .match(/<[a-z][a-z0-9]*>/g);
    var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
    return value.replace(tags, function($0, $1) {
        return valid_tags.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
    });
}
//// Tests for sanitize_html
//var str;
//valid_tags = ['<em>', '<p>', '<ul>', '<ol>', '<li>', '<br />', '<br/>', '<a>', '<span>', '<div>', '<strong>']
//str = '<p>This text should be valid. ' +
//              'Let\'s have <em>em</em>, <strong><strong></strong>,' +
//              'and br here ->> <br/> <<-</p>';
//console.log(Freya.sanitize_html(str, valid_tags));
//if (sanitize_html(str, valid_tags) == str) console.log('pass')
//else console.log('error');
//
//str = 'Lists test: <ul><li>aa</li><li>bb</li></ul> <ol><li>aa</li><li>bb</li></ol>';
//console.log(sanitize_html(str, valid_tags));
//if (sanitize_html(str, valid_tags) == str) console.log('pass')
//else console.log('error');
//
//str = 'Test links: Here is <a href="http://google.com">the link</a>';
//console.log(sanitize_html(str, valid_tags));
//if (sanitize_html(str, valid_tags) == str) console.log('pass')
//else console.log('error');
//
//str = 'Images are not valid: <img src="https://www.site.com/logo.png">';
//console.log(sanitize_html(str, valid_tags));
//if (sanitize_html(str, valid_tags) != str) console.log('pass')
//else console.log('error');
//
//str = 'As well as js scripts: <script>alert(\'test\');</script>';
//console.log(sanitize_html(str, valid_tags));
//if (sanitize_html(str, valid_tags) != str) console.log('pass')
//else console.log('error');
