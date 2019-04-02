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
  width_2048 = (width > 4 && width < 9) ? width : width_2048;
  let height = parseInt($(".v2048-resize-height").val());
  height_2048 = (height > 4 && height < 9) ? height : height_2048;

  if (width < 4 || width > 8 || height < 4 || height > 8) {
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

/* Swipe helper with animations.
*/
function swipe_animated_helper(axis, ortho_start) {
  let l1 = (axis == "x") ? height_2048 : width_2048;
  let l2 = (axis == "x") ? width_2048 : height_2048;
  let promise_queue = [];
  let promise_queue_2 = [];
  let promise_queue_3 = [];

  /* First phase: Move nonzero tiles to the end. Animations are put into a promise queue
  * and waited upon.
  */
  for (let i=0; i < l1; i++) {
    let compress_counter = 0;
    let chain = Promise.resolve();

    for (let j=0; j < l2; j++) {
      let cell = (axis === "x" && ortho_start===1) ? helper.get_cell(j,i) :
       (axis === "x" && ortho_start===0) ? helper.get_cell(width_2048-j-1,i) :
       (axis === "y" && ortho_start===1) ? helper.get_cell(i,j) :
       (axis === "y" && ortho_start===0) ? helper.get_cell(i,height_2048-j-1) :
       console.log("ERROR IN GATHER");
       let n = cell.attr("data-2048-num");
       if (n !== "0") {
         chain = chain.then(() => {
          let p = (axis === "x" && ortho_start===1) ? helper.animate_cell_obj(cell,compress_counter,i,n) :
          (axis === "x" && ortho_start===0) ? helper.animate_cell_obj(cell,width_2048-compress_counter-1,i,n) :
          (axis === "y" && ortho_start===1) ? helper.animate_cell_obj(cell,i,compress_counter,n) :
          (axis === "y" && ortho_start===0) ? helper.animate_cell_obj(cell,i,height_2048-compress_counter-1,n) :
          console.log("ERROR IN COMPRESS");
          compress_counter++;
          return p;
        });
       }
    }
    promise_queue.push(chain); // chain paradigm taken from https://stackoverflow.com/questions/44955463/creating-a-promise-chain-in-a-for-loop
  }
  /* After first animations are done, animate combining cells
  *
  */
  let prom = Promise.all(promise_queue).then(() => {
    for (let i=0; i < l1; i++) {
      let chain = Promise.resolve();
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
          (axis === "x" && ortho_start===0) ? helper.get_cell(width_2048-j-2,i) :
          (axis === "y" && ortho_start===1) ? helper.get_cell(i,j+1) :
          (axis === "y" && ortho_start===0) ? helper.get_cell(i,height_2048-j-2) :
          console.log("ERROR IN COMBINE");

          if (cell.attr("data-2048-num") === cell_neighbor.attr("data-2048-num")
           && cell.attr("data-2048-num") !== "0") {
             j++;
             chain = chain.then( () => {
             let n = parseInt(cell.attr("data-2048-num"))+1;
             score += Math.floor(Math.pow(2,n));
             helper.update_score(score,high_score);
             let cell_pos = helper.get_cell_pos(cell);
             let cell_neighbor_pos = helper.get_cell_pos(cell_neighbor);
             return helper.animate_cell_obj(cell_neighbor,cell_pos.x,cell_pos.y,n);
           });
          }
      }
      promise_queue_2.push(chain);
    }
    return Promise.all(promise_queue_2);
    /* After combining cells, regather them at the end of the row/column
    *
    */
  }).then( () => {
        for (let i=0; i < l1; i++) {
          let compress_counter = 0;
          let chain = Promise.resolve();

          for (let j=0; j < l2; j++) {
            let cell = (axis === "x" && ortho_start===1) ? helper.get_cell(j,i) :
             (axis === "x" && ortho_start===0) ? helper.get_cell(width_2048-j-1,i) :
             (axis === "y" && ortho_start===1) ? helper.get_cell(i,j) :
             (axis === "y" && ortho_start===0) ? helper.get_cell(i,height_2048-j-1) :
             console.log("ERROR IN GATHER");
             let n = cell.attr("data-2048-num");
             if (n !== "0") {
               chain = chain.then( () => {

                let p = (axis === "x" && ortho_start===1) ? helper.animate_cell_obj(cell,compress_counter,i,n) :
                (axis === "x" && ortho_start===0) ? helper.animate_cell_obj(cell,width_2048-compress_counter-1,i,n) :
                (axis === "y" && ortho_start===1) ? helper.animate_cell_obj(cell,i,compress_counter,n) :
                (axis === "y" && ortho_start===0) ? helper.animate_cell_obj(cell,i,height_2048-compress_counter-1,n) :
                console.log("ERROR IN COMPRESS");
                compress_counter++;
                return p;
              });
             }
          }
          promise_queue_3.push(chain);
        }
        return Promise.all(promise_queue_3);
      });
      /* return promise queue to be waited upon
      *
      */
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

        swipe(dir).then(() => {
          check();
          if (!_.isEqual(undo_state, read_table())) {
            helper.add_rand_cell();
          }
          board_in_use = false;
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

resize_board();

export {
    swipe,
    read_table,
    write_table,
    reset,
    undo,
    new_game,
    resize_board,
    swipe_animated_helper
};
// TODO make reset key 'r' that must be held for x seconds (1?)
