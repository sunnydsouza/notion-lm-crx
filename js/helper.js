
function backspace(e) {
    var ss = e.selectionStart;
    console.log("ss:" + ss);
    var se = e.selectionEnd;
    console.log("se:" + se);
    var ln = e.value.length;
    console.log("ln:" + ln);
  
    var textbefore = e.value.substring(0, ss); //text in front of selected text
    console.log("textbefore:" + textbefore);
    var textselected = e.value.substring(ss, se); //selected text
    console.log("textselected:" + textselected);
    var textafter = e.value.substring(se, ln); //text following selected text
    console.log("textafter:" + textafter);
  
    if (ss == se) {
      // if no text is selected
      e.value = e.value.substring(0, ss - 1) + e.value.substring(se, ln);
      e.focus();
      e.selectionStart = ss - 1;
      e.selectionEnd = ss - 1;
    } // if some text is selected
    else {
      e.value = textbefore + textafter;
      e.focus();
      e.selectionStart = ss;
      e.selectionEnd = ss;
    }
  }