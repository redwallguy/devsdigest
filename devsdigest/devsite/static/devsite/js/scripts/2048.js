define(['jquery','./base', './2048helpers'], function($, base, helper) {
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

    for (let i=0; i < 4 ; i++) {
        let div = $("<div class='v2048-board-tr"+ i + "'></div>");
        for (let j=0; j < 4; j++) {
            let cell_pos = "y" + i + " x" + j;
            let cell_pos_selector = "td.y" + i + ".x" + j;
            let img = $("<div class='" + cell_pos + "' data-2048-num='0'><img/></div>");
            div.append(img);
        }

        table_element.append(div);
    }

    /* Bind methods to HTML elements
     *
     */
     $(".v2048-reset").on("click.v2048", new_game);
     $(".v2048-undo").on("click.v2048", undo);

     /* Make new game */
     new_game();

/*END INIT*/
   /* Wrapper function for swiping. Called by keydown
    *
    */
    function swipe(direction) {
        undo_state = read_table();
        redo_score = score;
        switch (direction) {
            case "left": {
                swipe_helper("x", 1);
                break;
            }
            case "right": {
                swipe_helper("x", 0);
                break;
            }
            case "up": {
                swipe_helper("y", 1);
                break;
            }
            case "down": {
                swipe_helper("y", 0);
                break;
            }
            default: {
                console.log("Default swipe. Should never be reached.");
            }
        }

        function swipe_helper(axis, ortho_start) {
           /* Iterate over table by chosen axis. Process each row/column into final state
            *
            */
            for (let i=0; i < 4; i++) {
                let gather = [];

                for (let j=0; j < 4; j++) {
                    let cell = (axis === "x" && ortho_start===0) ? helper.get_cell(j,i) :
                     (axis === "x" && ortho_start===1) ? helper.get_cell(3-j,i) :
                     (axis === "y" && ortho_start===0) ? helper.get_cell(i,j) :
                     (axis === "y" && ortho_start===1) ? helper.get_cell(i,3-j) :
                     "ERROR IN GATHER";
                    if (cell.attr("data-2048-num") !== "0") {
                        gather.push(cell.attr("data-2048-num"));
                    }
                }

                //console.log("Gather " + i + ": " + gather);
                let buffer = 4-gather.length;

                for (let j=0; j < buffer; j++) {
                    gather.unshift("0");
                }

                //console.log("Shifted " + i + ": " + gather);

                let end_state = [];

                for (let j=0; j < 4; j++) {
                   /* If we get to end of gather, it's not paired, so push and break. */
                    if (j === 3) {
                        end_state.push(gather[j]);
                        break;
                    }
                    /* If we overshoot, end was paired, so break. */
                    if (j === 4) {
                        break;
                    }
                   /* If consecutive entries match, push their sum and skip
                    * matched entry. Add 2^sum to score, and if greater than
                    * high score, set high score to score.
                    */
                    if (gather[j] === gather[j+1] && parseInt(gather[j]) !== 0) {
                        end_state.push("0", (parseInt(gather[j])+1).toString());
                        console.log(parseInt(gather[j])+1);
                        score += Math.floor(Math.pow(2,parseInt(gather[j])+1));
                        console.log(score);
                        helper.update_score(score,high_score);
                        if (score > high_score) {
                          high_score = score;
                        }
                        j++;
                    }
                    /* If no match, push entry. */
                    else {
                        end_state.push(gather[j]);
                    }
                }

                //console.log("End state: " + i + ": " + end_state);

                for (let j=0; j < 4; j++) {
                    (axis === "x" && ortho_start==0) ? helper.set_cell(j,i,end_state[j]) : // right
                    (axis === "x" && ortho_start==1) ? helper.set_cell(3-j,i,end_state[j]) : // left
                    (axis === "y" && ortho_start==0) ? helper.set_cell(i,j,end_state[j]) : // down
                    (axis === "y" && ortho_start==1) ? helper.set_cell(i,3-j,end_state[j]) : // up
                    console.log("End of axis/ortho chain: should never be reached.");
                }
            }


        }
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

        for (let i=0; i < 4; i++) {
        let temp = [];

            for (let j=0; j < 4; j++) {
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
        for (let i=0; i < 4; i++) {
            for (let j=0; j < 4; j++) {
                helper.set_cell(j,i,saved_table[i][j]);
            }
        }
    }

    function reset() {
        write_table([[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]);
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
            e.preventDefault();

            switch (e.which) {
                case 38: {
                    swipe("up");
                    break;
                }
                case 40: {
                    swipe("down");
                    break;
                }
                case 37: {
                    swipe("left");
                    break;
                }
                case 39: {
                    swipe("right");
                    break;
                }
                default: {
                  return false;
                }
            }

            check();
            helper.add_rand_cell();
        });
    }

   /* Unbinds swiping from page (for game over screen)
    *
    */
    function unbind() {
        $(document).off("keydown.v2048");
    }

    let template_table = [[0,0,0,0],[1,1,1,1],[2,2,2,2],[3,3,3,3]];

    return { // TODO streamline/remove this object and bind to elements here instead
        swipe: swipe,
        read_table: read_table,
        write_table: write_table,
        reset: reset,
        template_table: template_table,
        undo: undo,
        new_game: new_game
    }

    //$("table.v2048-table img").attr("src", $(".l1 img").attr("src")); // temp image in cells to check dimensions
}); // TODO make animation for slide: fade out/in (Previous slides in dir/fades out, current fades in stationary)
// TODO make reset key 'r' that must be held for x seconds (1?)
