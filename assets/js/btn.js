    $('.navbar').find('.btn').on('click', function(e) {
      $(this).toggleClass("active");  
  
    });

 $('#allbutton').on('click', function(e) {
      $('.btn').removeClass("active");  
 
  
    });

$('#boosty').on('click', function(e) {
    e.preventDefault(); // Prevent default link behavior
    var url = "https://boosty.to/smartbook/donate";
    window.open(url, '_blank'); // Open the link in a new tab
});

