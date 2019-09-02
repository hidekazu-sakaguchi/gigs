// start Barba
Barba.Pjax.init();

// 画面遷移後処理
Barba.Dispatcher.on('transitionCompleted', function() {
  /**
   * When the current page transition to the current page, don't reload.
   */
  let links = document.querySelectorAll('a[href]');
  let cbk = function(e) {
    if(e.currentTarget.href === window.location.href) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  for(let i = 0; i < links.length; i++) {
    links[i].addEventListener('click', cbk);
  }

  // scroll to top
  window.scrollTo(0,0);
});
