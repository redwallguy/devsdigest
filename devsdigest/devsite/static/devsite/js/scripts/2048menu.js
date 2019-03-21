import /*static*/ '../lib/jquery.js' /*endstatic*/;

import * as base from /*static*/'./base.js'/*endstatic*/;

$("a:has(> img)").each(function(index, element){
  let list_num = $(this).attr("data-list-num");
  let offset = 150;
  let top_px = offset + 165*parseInt(list_num);
  $(this).css({
    "top": top_px+"px",
    "width": "600px",
    "height": "150px",
    "position": "absolute",
    "transform": "translate(-50%)",
    "left": "50%"
  });
});
