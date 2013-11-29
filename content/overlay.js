Components.utils.import('resource://gre/modules/PlacesUtils.jsm');
Components.utils.import("resource://gre/modules/Services.jsm");

(function() {
  var _origInitPanel = gEditItemOverlay.initPanel;
  gEditItemOverlay.initPanel = function(aFor,  aInfo) {
    _origInitPanel.call(gEditItemOverlay,  aFor,  aInfo);

    FaviconControl_SetDisplay();
  };
})();

function FaviconControl_SetDisplay() {
    PlacesUtils.favicons.getFaviconURLForPage(
        gEditItemOverlay.uri,
        function(aUri) {
          dump('current page has icon: ' + aUri.spec + '\n');
          document.getElementById('favicon-control-img')
              .setAttribute('src',  'moz-anno:favicon:' + aUri.spec);
        });
}

function FaviconControl_Set() {
  var nsIFilePicker = Components.interfaces.nsIFilePicker;
  var fp = Components
      .classes['@mozilla.org/filepicker;1']
      .createInstance(nsIFilePicker);
  fp.init(
      window,
      'Pick a new favicon image.',
      nsIFilePicker.modeOpen);

  var filter = '*.ico; *.bmp; *.dib; *.gif; *.jpg; *.jpe; *.jpeg; '
      + '*.jif; *.jfi; *.jfif; *.png; *.apng; *.svg';
  var filterTitle = 'Image Files' + ' (' + filter + ')';
  fp.appendFilter(filterTitle,  filter);
  fp.appendFilter('Icon File (*.ico)', '*.ico');
  fp.appendFilter('Bitmap Image File (*.bmp; *.dib)', '*.bmp; *.dib');
  fp.appendFilter('Graphics Interchange Format File (*.gif)', '*.gif');
  fp.appendFilter('Joint Photographic Experts Group File '
      + ' (*.jpg; *.jpe; *.jpeg; *.jif; *.jfi; *.jfif)', '*.jpg; *.jpe; '
      + ' *.jpeg; *.jif; *.jfi; *.jfif');
  fp.appendFilter('Portable Network Graphics File '
      + '(*.png; *.apng)', '*.png; *.apng');
  fp.appendFilter('Scalable Vector Graphics File (*.svg)', '*.svg');
  fp.appendFilters(nsIFilePicker.filterAll);

  if (fp.show() != nsIFilePicker.returnOK) return;

  PlacesUtils.favicons.setAndFetchFaviconForPage(
      gEditItemOverlay.uri,
      Services.io.newFileURI(fp.file),
      true,  // aForceReload
      PlacesUtils.favicons.FAVICON_LOAD_NON_PRIVATE,
      function() {
        FaviconControl_SetDisplay();
      });
}
