/* Code due to archive.today */

function findXY(obj) {
  var cur = {x:0, y:0};
  while (obj && obj.offsetParent) {
    cur.x += obj.offsetLeft; // todo: + webkit-transform
    cur.y += obj.offsetTop; // todo: + webkit-transform
    obj = obj.offsetParent;
  }
  return cur;
}
function findXY2(obj, textpos) { // it could reset selection
  if (obj.nodeType==3) {
    var parent = obj.parentNode;
    var text = document.createTextNode(obj.data.substr(0, textpos));
    var artificial = document.createElement("SPAN");
    artificial.appendChild(document.createTextNode(obj.data.substr(textpos)));
    parent.insertBefore(text, obj);
    parent.replaceChild(artificial, obj);
    var y = findXY(artificial);
    parent.removeChild(text);
    parent.replaceChild(obj, artificial);
    return y;
  } else {
    return findXY(obj);
  }
}
var prevhash = "";
function scrollToHash() {
  if (document.location.hash.replace(/^#/, "")==prevhash.replace(/^#/, ""))
    return;
  prevhash = document.location.hash;
  if (document.location.hash.match(/#[0-9.]+%/)) {
    var p = parseFloat(document.location.hash.substring(1));
    if (0 < p && p < 100 /*&& p%5 != 0*/) {
      var content = document.getElementById("CONTENT")
      var y = findXY(content).y + (content.offsetHeight)*p/100;
      window.scrollTo(0, y-16);
    }
  }

  var adr = document.location.hash.match(/selection-(\d+)\.(\d+)-(\d+)\.(\d+)/);
  if (adr) {
    var pos=0,begin=null,end=null;
    function recur(e) {
      if (e.nodeType==1) pos = (pos&~1)+2;
      if (e.nodeType==3) pos = pos|1;
      if (pos==adr[1]) begin=[e, adr[2]];
      if (pos==adr[3]) end  =[e, adr[4]];
      for (var i=0; i<e.childNodes.length; i++)
        recur(e.childNodes[i]);
      if (e.childNodes.length>0 && e.lastChild.nodeType==3)
        pos = (pos&~1)+2;
    }
    var content = document.getElementById("CONTENT");
    recur(content);
    if (begin!=null && end!=null) {
      window.scrollTo(0, findXY2(begin[0], begin[1]).y-8);

      if (window.getSelection) {
        var sel = window.getSelection();
        sel.removeAllRanges();
        var range = document.createRange();
        range.setStart(begin[0], begin[1]);
        range.setEnd  (  end[0],   end[1]);
        sel.addRange(range);
      } else if (document.selection) { // IE
      }
    }
  }
}
window.onhashchange = scrollToHash;
var initScrollToHashDone = false;
function initScrollToHash() {
  if (!initScrollToHashDone) {
    initScrollToHashDone = true;
    scrollToHash();
  }
}
window.onload = initScrollToHash;
setTimeout(initScrollToHash, 500); /* onload can be delayed by counter code */

//document.onselectionchange = /* only webkit has working document.onselectionchange */
document.onmousedown = document.onmouseup = function(e) {
  var newhash = "";
  if (window.getSelection) {
    var sel=window.getSelection();
    if (!sel.isCollapsed) {
      var pos=0,begin=[0,0],end=[0,0];
      var range=sel.getRangeAt(0);
      function recur(e) {
        if (e.nodeType==1) pos = (pos&~1)+2;
        if (e.nodeType==3) pos = pos|1;
        if (range.startContainer===e) begin=[pos, range.startOffset];
        if (range.endContainer  ===e) end  =[pos, range.endOffset  ];
        for (var i=0; i<e.childNodes.length; i++)
          recur(e.childNodes[i]);
        if (e.childNodes.length>0 && e.lastChild.nodeType==3)
          pos = (pos&~1)+2;
      }

   
      var content = document.getElementById("CONTENT");
      recur(content);
      if (begin[0]>0 && end[0]>0) {
        newhash = "selection-"+begin[0]+"."+begin[1]+"-"+end[0]+"."+end[1];
      }
    }
  } else if (document.selection) { // IE
  }


  try {
    var oldhash = location.hash.replace(/^#/, "");
    if (oldhash != newhash) {
      prevhash = newhash; /* avoid firing window.onhashchange and scrolling */
      if (history.replaceState) {
        history.replaceState('', document.title, newhash.length>0 ? '#'+newhash : window.location.pathname);
      } else {
        if (newhash.length>0) location.hash = newhash;
      }
    }
  } catch(e) {
  }
};
