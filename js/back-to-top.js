/***************************************************
 * Back to top
/***************************************************/
$( window ).load(function() {

  $('body').append('<a href="#" id="back-to-top">&uarr;</a>');

  if ($('#back-to-top').length)
  {
      var scrollTrigger = 150;
      backToTop = function ()
      {
          var scrollTop = $(window).scrollTop();
          if (scrollTop > scrollTrigger)
          {
              $('#back-to-top').show();
          }
          else
          {
              $('#back-to-top').hide();
          }

      };
      backToTop();

      $(window).on('scroll', function () {
          backToTop();
      });

      $('#back-to-top').on('click', function (e)
      {
          e.preventDefault();
          $('html,body').animate({ scrollTop: 0 }, 700);
     });
  }
});
