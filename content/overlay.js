Components.utils.import('resource://gre/modules/PlacesUtils.jsm');
Components.utils.import("resource://gre/modules/Services.jsm");

(function() {
  var _origInitPanel = gEditItemOverlay.initPanel;
  gEditItemOverlay.initPanel = function(aFor,  aInfo) {
    _origInitPanel.call(gEditItemOverlay,  aFor,  aInfo);
    // Also set icon display when init'ing the edit panel.
    FaviconControl_SetDisplay(gEditItemOverlay.uri);
  };
})();

// Base implementation:

function FaviconControl_SetDisplay(aPageUri) {
  var displayEl = document.getElementById('favicon-control-img');
  if (!displayEl) return;

  PlacesUtils.favicons.getFaviconURLForPage(
      aPageUri,
      function(aIconUri) {
        displayEl.setAttribute('src',  'moz-anno:favicon:' + aIconUri.spec);
      });
}

function FaviconControl_SetPageIcon(aPageUri, aIconUri) {
  // Set the back end data.
  PlacesUtils.favicons.setAndFetchFaviconForPage(
      aPageUri, aIconUri,
      true,  // aForceReload
      PlacesUtils.favicons.FAVICON_LOAD_NON_PRIVATE,
      function() {
        FaviconControl_SetDisplay(aPageUri);
      });
}

// XUL callbacks:

function FaviconControl_Clear() {
  FaviconControl_SetPageIcon(
      gEditItemOverlay.uri, PlacesUtils.favicons.defaultFavicon);
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

  FaviconControl_SetPageIcon(
      gEditItemOverlay.uri, Services.io.newFileURI(fp.file));
}
