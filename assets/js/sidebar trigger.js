const productz = document.getElementsByClassName("card");
var myOffcanvas = document.getElementById('sidebar')
    
var productClick = function (event) {
    //event.preventDefault()
    event.stopPropagation()
    var bsOffcanvas = new bootstrap.Offcanvas(myOffcanvas)
    bsOffcanvas.show()
}

Array.from(productz).forEach(function (element) {
    element.addEventListener("click", productClick);
})






$('.card').click(function(){   
 var pid = $(this).attr('bloader');
 var dmx = pid + '.' + 'html' + ' ' + '#book';
  $('#sidebarcontent').load( LOCA + dmx, function(){baginit(); } ); 
});




