/***************************************************
 * Back to top
/***************************************************/

var BackToTop = (function() {
  var self = {};

  self.onScroll = function()
  {
    var scrollTrigger = 150;
    var scrollTop = $(window).scrollTop();
    if (scrollTop > scrollTrigger)
    {
        $('#back-to-top').show();
    }
    else
    {
        $('#back-to-top').hide();
    }
  }

  self.onClick = function()
  {
    $('html,body').animate({ scrollTop: 0 }, 700);
  }

  self.init = function()
  {
    $('body').append('<a href="#" id="back-to-top">&uarr;</a>');
    $('#back-to-top').on('click', function (e) { self.onClick(); });
    $(window).on('scroll', function (e) { e.preventDefault(); self.onScroll(); });
  }

  return self;
}());
