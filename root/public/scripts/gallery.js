console.log('linked')
var x = document.body.getElementsByClassName('galItem');
var light = document.getElementById('lightbox');
var close = light.childNodes[0];
var lightInner = document.createElement('div');
var arrows = document.getElementsByClassName('arrow');
var test = document.getElementById('test');


console.log(x);
var once = true;





for (var i = 0; i < x.length; i++) {
  x[i].setAttribute('data-index',i+1);
  x[i].onclick = function() {
    if ($('.main').children().hasClass('graphGall')) {
      console.log('Has class');
      function changer(xy) {
      var lightboxInnerHTML = '<div id="lightboxInner">'
      var y = xy.alt.split(',');
      var z = xy.dataset.lrg;
      var a = xy.dataset.index;

      let Prev = x[a-2];
      let Next = x[a];

      // console.log(Prev);
      // console.log(Next);


      lightboxInnerHTML += '<h2 id="lightTitle">' + y[0] + '</h2>';
      lightboxInnerHTML += '<h4 id="year">'+ y[1] +'</h4>';
      lightboxInnerHTML += '<img src="'+ z +'" /><p id="gallCounter"><span class="arrow"><</span> '+a+' / '+x.length+'<span class="arrow"> ></span></p></div>'
      lightInner.innerHTML = lightboxInnerHTML;
      light.appendChild(lightInner);
      document.body.style.overflow = 'hidden'
      light.style.display = 'block';

      arrows[0].onclick = function(){
        changer(Prev);
      }

      arrows[1].onclick = function(){
        changer(Next);
      }

      document.onkeydown = checkKey;

      function checkKey(e) {

          e = e || window.event;

          // if (e.keyCode == '38') {
          // up arrow
          // }
          // else if (e.keyCode == '40') {
          //      down arrow
          // }
          if (e.keyCode == '37') {
              changer(Prev);
          }
          else if (e.keyCode == '39') {
              changer(Next);
          }
          else if (e.keyCode == '27') {
            light.style.display = 'none';
            document.body.style.overflow = 'scroll'
          }

      }
      }

      changer(this);

    } else {
        function changer(xy) {
        var lightboxInnerHTML = '<div id="lightboxInner">'
        var a = xy.dataset.index;
        var z = xy.src;

        let Prev = x[a-2];
        let Next = x[a];

        lightboxInnerHTML += '<br><br><img src="'+ z +'" /><p id="gallCounter"><span class="arrow"><</span> '+a+' / '+x.length+'<span class="arrow"> ></span></p></div>'
        lightInner.innerHTML = lightboxInnerHTML;
        light.appendChild(lightInner);
        document.body.style.overflow = 'hidden'
        light.style.display = 'block';



        arrows[0].onclick = function(){
          changer(Prev);
        }

        arrows[1].onclick = function(){
          changer(Next);
        }



      document.onkeydown = checkKey;

      function checkKey(e) {

          e = e || window.event;

          // if (e.keyCode == '38') {
          // up arrow
          // }
          // else if (e.keyCode == '40') {
          //      down arrow
          // }
          if (e.keyCode == '37') {
              changer(Prev);
          }
          else if (e.keyCode == '39') {
              changer(Next);
          }
          else if (e.keyCode == '27') {
            light.style.display = 'none';
            document.body.style.overflow = 'scroll'
          }

      }
    }

    }

    changer(this);

  }


}

    // console.log(once);




close.onclick = function(){
  light.style.display = 'none';
  document.body.style.overflow = 'scroll'
}
