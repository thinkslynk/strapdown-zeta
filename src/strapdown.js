// here we init the view page
(function(window, document) {
  var store = new Persist.Store('strapdown', { swf_path: '/persist.swf' });
  document.head = document.getElementsByTagName('head')[0];
  //////////////////////////////////////////////////////////////////////
  //
  // Shims for IE < 9
  //
  if (!('getElementsByClassName' in document)) {
    document.getElementsByClassName = function(name) {
      function getElementsByClassName(node, classname) {
        var a = [];
        var re = new RegExp('(^| )'+classname+'( |$)');
        var els = node.getElementsByTagName("*");
        for(var i=0,j=els.length; i<j; i++)
            if(re.test(els[i].className))a.push(els[i]);
        return a;
      }
      return getElementsByClassName(document.body, name);
    }
  }


  //////////////////////////////////////////////////////////////////////
  //
  // Get user elements we need
  //
  var markdownEl = document.getElementsByTagName('xmp')[0] || document.getElementsByTagName('textarea')[0],
      titleEl = document.getElementsByTagName('title')[0],
      navbarEl = document.getElementsByClassName('navbar')[0];

  if (!markdownEl) {
    console.warn('No embedded Markdown found in this document for Strapdown.js to work on! Visit http://strapdown.ztx.io/ to learn more.');
    return;
  }

  // Hide body until we're done fiddling with the DOM
  document.body.style.display = 'none';

  //////////////////////////////////////////////////////////////////////
  //
  // <head> stuff
  //

  // Use <meta> viewport so that Bootstrap is actually responsive on mobile
  var metaEl = document.createElement('meta');
  metaEl.name = 'viewport';
  metaEl.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0';
  if (document.head.firstChild)
    document.head.insertBefore(metaEl, document.head.firstChild);
  else
    document.head.appendChild(metaEl);

  // Get theme
  var theme = store.get('theme') || markdownEl.getAttribute('theme') || 'chaitin';
  theme = theme.toLowerCase();

  var base = getScriptBase("strapdown");

  upsertTheme(base, theme);

  var linkEl = document.createElement('link');
  linkEl.href = base + '/strapdown.min.css';
  linkEl.rel = 'stylesheet';
  document.head.appendChild(linkEl);

  var scrollTo = function(element, to, duration) {
    var start = element.scrollTop,
        change = to - start,
        currentTime = 0,
        increment = 20;

    var easeInOut = function(t, b, c, d) {
      t /= d / 2;
      if (t < 1) return c / 2 * t * t + b;
      t--;
      return -c / 2 * (t * (t - 2) - 1) + b;
    };

    var animateScroll = function() {
      currentTime += increment;
      element.scrollTop = easeInOut(currentTime, start, change, duration);
      if(currentTime < duration) {
        setTimeout(animateScroll, increment);
      }
    };

    animateScroll();
  };

  var backtopNode = document.createElement('div');
  backtopNode.className = 'backtop';
  backtopNode.innerHTML = '<i class="backtop-icon"></i>';
  backtopNode.onclick = function() {
     scrollTo(document.body, 0, 800);
  };
  document.body.appendChild(backtopNode);

  document.onscroll = function() {
    if (document.body.scrollTop > document.body.offsetHeight / 4) {
      backtopNode.style.display = 'inline-block';
    } else {
      backtopNode.style.display = 'none';
    }
  };

  //////////////////////////////////////////////////////////////////////
  //
  // <body> stuff
  //
  var newNode = document.createElement('div');
  newNode.className = 'container';
  newNode.id = 'content';
  document.body.replaceChild(newNode, markdownEl);

  // Insert navbar if there's none
  var newNode = document.createElement('div');
  newNode.className = 'navbar navbar-default navbar-fixed-top';
  if (!navbarEl && titleEl) {
    newNode.innerHTML = '<div class="container">'+
                          '<div class="navbar-header">'+
                            '<div class="navbar-brand" id="headline">Wiki</div>'+
                          '</div>'+
                        '</div>';
    document.body.insertBefore(newNode, document.body.firstChild);
    var title = titleEl.innerHTML;
    var headlineEl = document.getElementById('headline');
    if (headlineEl) {
      headlineEl.innerHTML = title;
    }
  }
  var markdown = markdownEl.textContent || markdownEl.innerText,
      heading_number = markdownEl.getAttribute("heading_number"),
      show_toc = markdownEl.getAttribute("toc");
  render(newNode, markdown, theme, heading_number, show_toc);

  // All done - show body
  document.body.style.display = '';
})(window, document);

// vim: ai:ts=2:sts=2:sw=2:
