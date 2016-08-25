"use strict";

window.Freya = window.Freya || {};
Freya.confs = {
    changeSubmitButtonHTML: true,
    submitButtonHTMLForAjaxInProcess: '<span class="icon-spinner animate-spin"></span>'
};


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
};

Freya.removeAttributes = function (value) {
    var content = $('<article/>').html(value);
    $(content).find('*').each(function(){
        $(this).removeAttributes();
    });
    return $(content)[0].outerHTML;
};

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
};

// Left only valid tags in the string
Freya.sanitize_html = function(value, allowedTags) {
    value = Freya.cleanWordHtml(value);
    value = Freya.removeAttributes(value);
    if (allowedTags.indexOf("br")) {
      allowedTags.push("br /");
      allowedTags.push("br/");
    }
    var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
    return value.replace(tags, function($0, $1) {
        return allowedTags.indexOf($1.toLowerCase()) > -1 ? $0 : '';
    });
};

Freya.disableSubmitBtn = function($btn) {
    $btn.prop("disabled", true);
    if(Freya.confs.changeSubmitButtonHTML) {
        var currentHTML = $btn.html();
        $btn.html(Freya.confs.submitButtonHTMLForAjaxInProcess);
        return currentHTML;
    }
};

Freya.enableSubmitBtn = function($btn, previousHTML) {
    $btn.prop("disabled", false);
    if(Freya.confs.changeSubmitButtonHTML) {
        $btn.html(previousHTML);
    }
};

Freya.getGETparams = function() {
  var params = window.location.search.substring(1).split("&");
  return params.map(function(item) {
    // to support similar keys, for example for multicheckbox elements
    return {"name": item.match(/[^=]*/i)[0], "value": item.match(/=(.*)/i)[1]}
  });
}

Freya.GETparamsArrayToURL = function(params) {
  return params.map(function(item) {
    return item.name + "=" + item.value;
  }).join("&");
}


// Tests for sanitize_html
//var str, newstr;
//var allowedTags = ['em', 'p', 'ul', 'ol', 'li', 'br', 'a', 'span', 'div', 'strong'];
//
//str = 'Valid tags: <em>em</em>, <p>p</p>, <ul><li></li></ul> <ol><li></li></ol> ' +
//      '<span>span</span> <div>div</div> <strong>strong</strong> ';
//newstr = Freya.sanitize_html(str, allowedTags);
//console.log('str:', str);
//console.log('new:', newstr);
//if (newstr == str) console.log('pass');
//else console.log('error');
//
//str = '<br> <br/> <br />';
//newstr = Freya.sanitize_html(str, allowedTags);
//console.log('str:', str);
//console.log('new:', newstr);
//if (newstr == '<br> <br> <br>') console.log('pass');
//else console.log('error');
//
//str = 'Test links: Here is <a href="http://google.com">the link</a>';
//newstr = Freya.sanitize_html(str, allowedTags);
//console.log('str:', str);
//console.log('new:', newstr);
//if (newstr == str) console.log('pass');
//else console.log('error');
//
//str = 'Test links with attr: Here is <a href="http://google.com" style="color:red">the link</a>';
//newstr = Freya.sanitize_html(str, allowedTags);
//console.log('str:', str);
//console.log('new:', newstr);
//if (newstr != str) console.log('pass');
//else console.log('error');
//
//str = 'Images are not valid: <img src="https://www.site.com/logo.png">';
//newstr = Freya.sanitize_html(str, allowedTags);
//console.log('str:', str);
//console.log('new:', newstr);
//if (newstr != str) console.log('pass');
//else console.log('error');
//
//str = 'As well as js scripts and frames: <script>alert(\'test\');</script> <iframe>iframe</iframe>';
//newstr = Freya.sanitize_html(str, allowedTags);
//console.log('str:', str);
//console.log('newstr:', newstr);
//newstr = Freya.sanitize_html(str, allowedTags);
//if (newstr != str) console.log('pass');
//else console.log('error');
