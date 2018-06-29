

$('.port-item').mouseover(function(){
  TweenMax.to($(this).children('img'),.25,{alpha:1});
});

$('.port-item').mouseout(function(){
  TweenMax.to($(this).children('img'),.25,{alpha:.8});
})
