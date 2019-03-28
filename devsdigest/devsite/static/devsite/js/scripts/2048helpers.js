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

/* Get cell position from object
*
*/
function get_cell_pos(cell) {
  let re_x = /\s*x(\d)\s*/;
  let re_y = /\s*y(\d)\s*/;
  let pos = {};
  pos.x = cell.attr("class").match(re_x)[1];
  pos.y = cell.attr("class").match(re_y)[1];
  return pos;
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

function animate_cell(x0,y0,xf,yf,n) {

  return get_cell(x0,y0).find("img").fadeOut(50,function(){
    set_cell(x0,y0,0);
    get_cell(x0,y0).find("img").show();

    get_cell(xf,yf).find("img").hide();
    set_cell(xf,yf,n);
  }).promise().then(function(){
    get_cell(xf,yf).find("img").fadeIn(50);
  });
}

function animate_cell_obj(cell,xf,yf,n) {
  if (parseInt(get_cell_pos(cell).x) === xf && parseInt(get_cell_pos(cell).y) === yf) {
    return Promise.resolve();
  }

  return cell.find("img").fadeOut(20,function(){
    set_cell_object(cell,0);
    cell.find("img").show();

    get_cell(xf,yf).find("img").hide();
    set_cell(xf,yf,n);
  }).promise().then(function(){
    get_cell(xf,yf).find("img").fadeIn(20);
  });
}

export {
    rand_int,
    nth_image,
    add_rand_cell,
    set_cell,
    set_cell_object,
    get_cell,
    get_cell_pos,
    update_score,
    animate_cell,
    animate_cell_obj
};
