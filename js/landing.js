jQuery(function($){
    $('.nav.navbar-nav a').on('click', function(e){
        e.preventDefault();
        var target = $(this).attr('href');
        $('html, body').animate({
            scrollTop: $(target).offset().top - 80
        }, 1000, 'swing');
    });

    $('.back-to-top').on('click', function(e){
        $('html, body').animate({
            scrollTop: 0
        }, 1000, 'swing');
    });
});