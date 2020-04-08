// ==UserScript==
// @name        Copy Text and Link
// @namespace   http://jrf.cocolog-nifty.com/
// @include     *
// @version     0.4
// @require     https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// @grant       GM.setClipboard
// @grant       GM_setClipboard
// @grant	GM.xmlHttpRequest
// @grant	GM_xmlhttpRequest
// ==/UserScript==

// 以下のコードを参考にした。
// 《Source for "Context Menu Example" - Userscripts.org》
// http://userscripts-mirror.org/scripts/review/150793

// 短縮 URL サービス
var shortenUrlApi = "https://is.gd/create.php?format=simple&url=";

var contextMenu = document.body.getAttribute('contextmenu');
var cmenu = (contextMenu)? $('menu#' + contextMenu) : null;
if (! cmenu) {
  cmenu = document.createElement('menu');
  cmenu.setAttribute('id', 'gm-registered-menu');
  cmenu.setAttribute('type', 'context');
  document.body.appendChild(cmenu);
  document.body.setAttribute('contextmenu', 'gm-registered-menu');
}

var menu = document.createElement('menu');
menu.innerHTML = '<menuitem label="PlainText"></menuitem>\
                  <menuitem label="HTML"></menuitem>\
		  <menuitem label="URI-Table"></menuitem>\
                  <menuitem label="PlainText(S)"></menuitem>';
menu.setAttribute('id', "copy-text-and-link-menu");
menu.setAttribute('label', "");
menu.setAttribute('url', "");
cmenu.appendChild(menu);

var html = document.documentElement;
// If browser supports contextmenu
if ("contextMenu" in html && "HTMLMenuItemElement" in window) {
  // Executed on clicking a menuitem
  $("#copy-text-and-link-menu").addEventListener("click", copy, false);
  html.addEventListener("contextmenu", initMenu, false); // Executed on right clicking
}

function initMenu(e) {
  var node = e.target;
  var title = document.title;

  var menu = $("#copy-text-and-link-menu");
  menu.label = "Copy This Page\u2026"; // Set menu label

  var canonical = $("head link[rel='canonical']");
  // Use canonical where available
  var url = canonical ? canonical.href : location.href;

  // If right click on a link
  while (node && node.nodeName != "A") node = node.parentNode;
  if (node && node.hasAttribute("href")) {
    menu.label = "Copy This Link\u2026"; // Menu label when right click on a link
    url = node.href;
    title = e.target.getAttribute("alt") || node.textContent;
  }

  // Set menu title and url attributes
  menu.title = title;
  menu.setAttribute("url", url);
}

function copy(e) {
  var title = e.target.parentNode.title;
  var url = e.target.parentNode.getAttribute("url");
  switch (e.target.label) { // context menu label
    case "PlainText":
      GM.setClipboard('《' + title + '》  \n'
		      + url + "\n");
      break;
    case "HTML":
      GM.setClipboard('<a href="' + url +'">'
		      + title + '</a>');
      break;
    case "URI-Table":
      GM.setClipboard('(URI-Table: 《' + title + '》\n'
		      + '  HREF="' + url + '")\n');
      break;
    case "PlainText(S)":
      shorten(url).then((surl) => {
        GM.setClipboard('《' + title + '》 '
		        + surl);
      });
      break;
    default:
      alert(title + "\n" + url);
  }
}

async function shorten(url) {
  var xhr = new Promise((resolve, reject) => {
    GM.xmlHttpRequest({
      method: "GET",
      url: shortenUrlApi + encodeURIComponent(url),
      onload: (res) => { resolve(res.responseText); },
      onerror: (res) => { reject(res.statusText); }
    });
  });
  
  var merge = new Promise((resolve, reject) => {
    xhr.then((text) => { resolve(text); })
      .catch((text) => { resolve('<error>' + text + '</error>'); });
  });
  
  return merge;
}

function $(aSelector, aNode) {
  return (aNode || document).querySelector(aSelector);
}
