Components.utils.import('resource://gre/modules/PlacesUtils.jsm');
Components.utils.import("resource://gre/modules/Services.jsm");

var FaviconControl_IconAtLoad = null;
var FaviconControl_IconToSet = null;

(function() {
  var pageUri = null;

  var _origOnDialogLoad = BookmarkPropertiesPanel.onDialogLoad;
  BookmarkPropertiesPanel.onDialogLoad = function(aFor,  aInfo) {
    _origOnDialogLoad.call(BookmarkPropertiesPanel,  aFor,  aInfo);

    pageUri = gEditItemOverlay.uri;
    // Also set icon display when loading the dialog.
    FaviconControl_SetDisplayByPage(pageUri);
  };

  var _origOnDialogAccept = BookmarkPropertiesPanel.onDialogAccept;
  BookmarkPropertiesPanel.onDialogAccept = function(aFor,  aInfo) {
    // Save the browsed icon, if any.
    if (FaviconControl_IconToSet) {
      FaviconControl_SetPageIcon(pageUri, FaviconControl_IconToSet);
    }

    _origOnDialogAccept.call(BookmarkPropertiesPanel,  aFor,  aInfo);
  };

  var _origOnDialogCancel = BookmarkPropertiesPanel.onDialogCancel;
  BookmarkPropertiesPanel.onDialogCancel = function(aFor,  aInfo) {
    // Restore the original icon.
    FaviconControl_SetPageIcon(pageUri, FaviconControl_IconAtLoad);

    _origOnDialogCancel.call(BookmarkPropertiesPanel,  aFor,  aInfo);
  };
})();

// Base implementation:

function FaviconControl_SetDisplayByIcon(aIconUri) {
  var displayEl = document.getElementById('favicon-control-img');
  if (!displayEl) return;
  displayEl.setAttribute('src',  aIconUri.spec);
}

function FaviconControl_SetDisplayByPage(aPageUri) {
  var displayEl = document.getElementById('favicon-control-img');
  if (!displayEl) return;

  PlacesUtils.favicons.getFaviconURLForPage(
      aPageUri,
      function(aIconUri) {
        // First time only, save the looked up icon URI.
        if (!FaviconControl_IconAtLoad) FaviconControl_IconAtLoad = aIconUri;

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
        FaviconControl_SetDisplayByPage(aPageUri);
      });
}

// XUL callbacks:

function FaviconControl_Clear() {
  FaviconControl_IconToSet = PlacesUtils.favicons.defaultFavicon;
  FaviconControl_SetDisplayByIcon(PlacesUtils.favicons.defaultFavicon);
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

  // Store value to save upon dialog accept.
  var iconUri = Services.io.newFileURI(fp.file);
  FaviconControl_IconToSet = iconUri;
  FaviconControl_SetDisplayByIcon(iconUri);
}
