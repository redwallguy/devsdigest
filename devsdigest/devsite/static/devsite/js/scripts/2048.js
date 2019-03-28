import /*static*/ '../lib/jquery.js' /*endstatic*/;
import * as base from /*static*/'./base.js'/*endstatic*/;
import * as helper from /*static*/'./2048helpers.js'/*endstatic*/;
import /*static*/'../lib/underscore_min.js'/*endstatic*/;
/*BEGIN INIT*/

 /* Creating table and inserting into DOM
  * Each td has class identifiers corresponding to position (x,y) in table.
  * (0,0) positioned at top left.
  */
let undo_state = [];
let score = 0;
let redo_score = 0;
let high_score = 0;
let table_element = $(".v2048-board");
let width_2048 = 4;
let height_2048 = 4;
let board_in_use = false;

$(".v2048-reset").on("click.v2048", new_game);
$(".v2048-undo").on("click.v2048", undo);
$(".v2048-resize").on("click.v2048", resize_board);

function resize_board() {
  let width = parseInt($(".v2048-resize-width").val());
  console.log(width);
  width_2048 = (width > 4 && width < 11) ? width : width_2048;
  console.log(width_2048);
  let height = parseInt($(".v2048-resize-height").val());
  console.log(height);
  height_2048 = (height > 4 && height < 11) ? height : height_2048;
  console.log(height_2048);

  if (width < 4 || width > 10 || height < 4 || height > 10) {
    console.log("Invalid dimensions.");
    return false;
  }

  table_element.empty();
  table_element.css({"width": parseInt(85*width_2048)+"px", "height": parseInt(85*height_2048)+"px"});

  $(".v2048-legend").css("top", ((85*width_2048)+185)+"px");

  for (let i=0; i < height_2048 ; i++) {
      for (let j=0; j < width_2048; j++) {
          let cell_pos = "y" + i + " x" + j;
          let cell_pos_selector = "td.y" + i + ".x" + j;
          let img = $("<div class='" + cell_pos + "' data-2048-num='0'><img/></div>");
          table_element.append(img);
      }
  }

  for (let i=0; i < height_2048; i++) {
    let spacing = 85;
    let offset_str = parseInt((i*spacing)) + "px";
    $(".y"+i).css("top", offset_str);
  }

  for (let i=0; i < width_2048; i++) {
    let spacing = 85;
    let offset_str = parseInt(i*spacing) + "px";
    $(".x"+i).css("left", offset_str);
   }

  /* Bind methods to HTML elements
   *
   */

   /* Make new game */
   new_game();
}
/*END INIT*/

/* Wrapper function for swiping. Called by keydown
*
*/
function swipe(direction) {
    switch (direction) {
        case "left": {
            return swipe_animated_helper("x", 1);
            break;
        }
        case "right": {
            return swipe_animated_helper("x", 0);
            break;
        }
        case "up": {
            return swipe_animated_helper("y", 1);
            break;
        }
        case "down": {
            return swipe_animated_helper("y", 0);
            break;
        }
        default: {
            console.log("Default swipe. Should never be reached.");
        }
    }
}

function swipe_animated_helper(axis, ortho_start) {
  let l1 = (axis == "x") ? height_2048 : width_2048;
  let l2 = (axis == "x") ? width_2048 : height_2048;
  let promise_queue = [];
  let promise_queue_2 = [];
  let promise_queue_3 = [];
  for (let i=0; i < l1; i++) {
    let compress_counter = 0;

    for (let j=0; j < l2; j++) {
      let cell = (axis === "x" && ortho_start===1) ? helper.get_cell(j,i) :
       (axis === "x" && ortho_start===0) ? helper.get_cell(width_2048-j-1,i) :
       (axis === "y" && ortho_start===1) ? helper.get_cell(i,j) :
       (axis === "y" && ortho_start===0) ? helper.get_cell(i,height_2048-j-1) :
       console.log("ERROR IN GATHER");
       let n = cell.attr("data-2048-num");
       if (n !== "0") {
          let p = (axis === "x" && ortho_start===1) ? helper.animate_cell_obj(cell,compress_counter,i,n) :
          (axis === "x" && ortho_start===0) ? helper.animate_cell_obj(cell,width_2048-compress_counter-1,i,n) :
          (axis === "y" && ortho_start===1) ? helper.animate_cell_obj(cell,i,compress_counter,n) :
          (axis === "y" && ortho_start===0) ? helper.animate_cell_obj(cell,i,height_2048-compress_counter-1,n) :
          console.log("ERROR IN COMPRESS");
          compress_counter++;
          promise_queue.push(p);
       }
    }
  }
  let prom = Promise.all(promise_queue).then(() => {
    for (let i=0; i < l1; i++) {
      for (let j=0; j < l2; j++) {
        if (j > l2-1) {
          break;
        }
        let cell = (axis === "x" && ortho_start===1) ? helper.get_cell(j,i) :
         (axis === "x" && ortho_start===0) ? helper.get_cell(width_2048-j-1,i) :
         (axis === "y" && ortho_start===1) ? helper.get_cell(i,j) :
         (axis === "y" && ortho_start===0) ? helper.get_cell(i,height_2048-j-1) :
         console.log("ERROR IN COMBINE");

         let cell_neighbor = (axis === "x" && ortho_start===1) ? helper.get_cell(j+1,i) :
          (axis === "x" && ortho_start===0) ? helper.get_cell(width_2048-j,i) :
          (axis === "y" && ortho_start===1) ? helper.get_cell(i,j+1) :
          (axis === "y" && ortho_start===0) ? helper.get_cell(i,height_2048-j) :
          console.log("ERROR IN COMBINE");

          if (cell.attr("data-2048-num") === cell_neighbor.attr("data-2048-num")
           && cell.attr("data-2048-num") !== "0") {
             let n = parseInt(cell.attr("data-2048-num"))+1;
             score += Math.floor(Math.pow(2,n));
             helper.update_score(score,high_score);
             let cell_pos = helper.get_cell_pos(cell);
             let cell_neighbor_pos = helper.get_cell_pos(cell_neighbor);
             let p = helper.animate_cell_obj(cell_neighbor,cell_pos.x,cell_pos.y,n);
             promise_queue_2.push(p);
             j++;
           }
      }
    }
    return Promise.all(promise_queue_2);
  }).then( () => {
        for (let i=0; i < l1; i++) {
          let compress_counter = 0;

          for (let j=0; j < l2; j++) {
            let cell = (axis === "x" && ortho_start===1) ? helper.get_cell(j,i) :
             (axis === "x" && ortho_start===0) ? helper.get_cell(width_2048-j-1,i) :
             (axis === "y" && ortho_start===1) ? helper.get_cell(i,j) :
             (axis === "y" && ortho_start===0) ? helper.get_cell(i,height_2048-j-1) :
             console.log("ERROR IN GATHER");
             let n = cell.attr("data-2048-num");
             if (n !== "0") {
                let p = (axis === "x" && ortho_start===1) ? helper.animate_cell_obj(cell,compress_counter,i,n) :
                (axis === "x" && ortho_start===0) ? helper.animate_cell_obj(cell,width_2048-compress_counter-1,i,n) :
                (axis === "y" && ortho_start===1) ? helper.animate_cell_obj(cell,i,compress_counter,n) :
                (axis === "y" && ortho_start===0) ? helper.animate_cell_obj(cell,i,height_2048-compress_counter-1,n) :
                console.log("ERROR IN COMPRESS");
                compress_counter++;
                promise_queue_3.push(p);
             }
          }
        }
        return Promise.all(promise_queue_3);
      });
  return prom;
}

function check() {
    let winner_cell = $("[data-2048-num='11']");
    if (winner_cell.length !== 0) {
        $(".v2048-game-over").css("visibility", "visible");
        $(".v2048-game-over p").text("You are victorious!");
        unbind();
    }

    let empty = $("[data-2048-num='0']");
    if (empty.length !== 0) {
        return false;
    }

    for (let i=0; i < 4; i++) {
      for (let j=0; j < 3; j++) {
        if (helper.get_cell(i,j).attr("data-2048-num") ===
        helper.get_cell(i,j+1).attr("data-2048-num")) {
          return false;
        }
        if (helper.get_cell(j,i).attr("data-2048-num") ===
        helper.get_cell(j+1,i).attr("data-2048-num")) {
          return false;
        }
      }
    }

    $(".v2048-game-over").css("visibility", "visible");
    $(".v2048-game-over p").text("You lost...care to try again?");
    unbind();
}

/* Reads board state and returns representative array
*
*/
function read_table() {
    let table = [];

    for (let i=0; i < height_2048; i++) {
    let temp = [];

        for (let j=0; j < width_2048; j++) {
            temp.push(helper.get_cell(j,i).attr("data-2048-num"));
        }
        table.push(temp);
    }
    return table;
}

/* Loads board state from an array that is in format of read_table's return value
* i.e, write_table(read_table()) should not change the board state.
*/
function write_table(saved_table) {
    for (let i=0; i < height_2048; i++) {
        for (let j=0; j < width_2048; j++) {
            helper.set_cell(j,i,saved_table[i][j]);
        }
    }
}

function reset() {
    let reset_table = [];
    for (let i=0; i < height_2048; i++) {
      let temp = [];
      for (let j=0; j < width_2048; j++) {
        temp.push(0);
      }
      reset_table.push(temp);
    }
    write_table(reset_table);
    score = 0;
    helper.update_score(score, high_score);
    $(".v2048-game-over").css("visibility", "hidden");
}

function undo() {
    write_table(undo_state);
    score = redo_score;
    helper.update_score(score, high_score);
}

function new_game() {
    reset();
    helper.add_rand_cell();
    helper.add_rand_cell();
    unbind();
    bind();
}

/* Sets up event handler for swiping using arrow keys.
*
*/
function bind() {
    $(document).on("keydown.v2048", function(e){
      let dir= "";

      switch (e.which) {
        case 37: {
          dir = "left";
          break;
        }
        case 38: {
          dir = "up";
          break;
        }
        case 39: {
          dir = "right";
          break;
        }
        case 40: {
          dir = "down";
          break;
        }
        default: {
          return;
        }
      }
      e.preventDefault();
      if (!board_in_use) {
        board_in_use = true;
        undo_state = read_table();
        redo_score = score;

        let pq = swipe(dir);
        pq.then(() => {
          board_in_use = false;
          check();
          if (!_.isEqual(undo_state, read_table())) {
            helper.add_rand_cell();
          }
        });
      }
  });
}

/* Unbinds swiping from page (for game over screen)
*
*/
function unbind() {
    $(document).off("keydown.v2048");
}

let template_table = [[0,0,0,0,0,1],[0,0,0,0,0,1],[0,0,0,0,0,1],[0,0,0,0,0,1],[0,0,0,0,0,1],[0,0,0,0,0,1]];
let template_table_2 = [[1,1,1,1,1,1],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0]];
let template_table_3 = [[1,1,0,1,0,1],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0]];
let template_table_4 = [[1,1,0,1,0,1],[0,1,0,1,0,0],[0,0,0,1,0,0],[1,0,0,0,1,0],[0,0,1,1,0,0],[1,1,0,0,0,0]];
resize_board();

export { // TODO streamline/remove this object and bind to elements here instead
    swipe,
    read_table,
    write_table,
    reset,
    template_table,
    template_table_2,
    template_table_3,
    undo,
    new_game,
    resize_board,
    swipe_animated_helper
};

//$("table.v2048-table img").attr("src", $(".l1 img").attr("src")); // temp image in cells to check dimensions
// TODO make animation for slide: fade out/in (Previous slides in dir/fades out, current fades in stationary)
// TODO make reset key 'r' that must be held for x seconds (1?)
