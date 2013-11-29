(function() {
  var _origInitPanel = gEditItemOverlay.initPanel;
  gEditItemOverlay.initPanel = function(aFor, aInfo) {
    _origInitPanel.call(gEditItemOverlay, aFor, aInfo);

  document.getElementById('favicon-control-img')
      .setAttribute('src', 'moz-anno:favicon:' + gEditItemOverlay.uri.spec);
  };
})();
