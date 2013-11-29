(function() {
  Components.utils.import("resource://gre/modules/PlacesUtils.jsm");

  var _origInitPanel = gEditItemOverlay.initPanel;
  gEditItemOverlay.initPanel = function(aFor, aInfo) {
    _origInitPanel.call(gEditItemOverlay, aFor, aInfo);

  PlacesUtils.favicons.getFaviconURLForPage(
      gEditItemOverlay.uri,
      function(aUri) {
      document.getElementById('favicon-control-img')
          .setAttribute('src', 'moz-anno:favicon:' + aUri.spec);
      });
  };
})();
