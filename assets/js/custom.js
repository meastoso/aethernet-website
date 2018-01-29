// $("html, body").animate({ scrollTop: $('#title1').offset().top }, 1000);

$( document ).ready(function() {
    $("#viewTeam").on('click', function() {
    	console.log('clicked view team');
    	$("html, body").animate({ scrollTop: $('#teamContainer').offset().top }, 1000);
    });
});