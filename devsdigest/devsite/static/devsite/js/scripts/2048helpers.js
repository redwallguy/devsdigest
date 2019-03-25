import /*static*/ '../lib/jquery.js' /*endstatic*/;
import * as base from /*static*/'./base.js'/*endstatic*/;
/* Helper functions
*
*/

/* Get jquery object of td element at position (x,y) in the table ((0,0) origin @ top left)
*
*/
function get_cell(x,y) {
    return $(".v2048-board div.x" + x + ".y" + y);
}

/* Set image for cell(x,y) as image from legend(n)
*
*/
function set_cell(x,y,n) {
    get_cell(x,y).attr("data-2048-num", n);
    get_cell(x,y).find("img").attr("src", nth_image(n));
}

/* Set image for cell given as jquery object
*
*/
function set_cell_object(obj, n) {
    obj.attr("data-2048-num", n);
    obj.find("img").attr("src", nth_image(n));
}

/* Add either l1 or l2 image into random empty cell; odds 90:10
*
*/
function add_rand_cell() {
    let empty = $("[data-2048-num='0']");
    if (empty.length === 0) {
        return false;
    }
    (Math.random() < 0.9) ? set_cell_object($(empty[rand_int(0,empty.length-1)]),1) :
     set_cell_object($(empty[rand_int(0,empty.length-1)]),2);
}

/* Get nth image from legend table
*
*/
function nth_image(n) {
    return (n === 0 || n === "0") ? "" : $("table.v2048-legend td.l" + n + " img").attr("src");
}

function update_score(score, high_score) {
  $(".v-2048-currentscore").text(score);
  if (score > high_score) {
    $(".v-2048-highscore").text(score);
  }
}
/* Rand int in range [a,b] (i.e, double inclusive)
*
*/
function rand_int(a,b) {
    return Math.floor(Math.random()*(b-a) + a);
}

function animate_promise(x0,y0,xf,yf) {
  let n = get_cell(x0,y0).attr("data-2048-num");
  console.log(n);

  let prom = new Promise((resolve,reject) => {
    setTimeout(function(){
      console.log("Moving...")
      set_cell(x0,y0,0);
      set_cell(xf,yf,n);
      resolve("Cell moved!");
    },500);
  });

  return prom;
}

function animate_cell(x0,y0,xf,yf) {

  if (!(x0 === xf || y0 === yf)) {
    console.log("Error. Cannot animate unless cells are in the same row or column.");
    return false;
  }
  let chain = Promise.resolve();
  if (x0 === xf && y0 < yf) {
    for (let i = y0; i < yf; i++) {
      chain = chain.then(() => animate_promise(x0,i,xf,i+1));
    }
  }
  else {
    if (x0 === xf && yf < y0) {
      for (let i = y0; i > yf; i--) {
        chain = chain.then(() => animate_promise(x0,i,xf,i-1));
      }
    }
    else {
      if (y0 === yf && x0 < xf) {
        for (let i = x0; i < xf; i++) {
          chain = chain.then(() => animate_promise(i,y0,i+1,yf));
        }
      }
      else {
        if (y0 === yf && x0 > xf) {
          for (let i = x0; i > xf; i--) {
            chain = chain.then(() => animate_promise(i,y0,i-1,yf));
          }
        }
      }
    }
  }
}

export {
    rand_int,
    nth_image,
    add_rand_cell,
    set_cell,
    set_cell_object,
    get_cell,
    update_score,
    animate_cell,
    animate_promise
};
