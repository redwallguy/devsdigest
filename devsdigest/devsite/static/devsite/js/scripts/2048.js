define(['jquery','./base'], function($, base) {

   /* Creating table, inserting into DOM, and keeping references to elements in 2D array
    * Each td has class identifiers corresponding to position (x,y) in table.
    * (1,1) positioned at top left.
    */
    let redo_arr = [];
    let table_arr = [];
    let table_element = $(".v2048-board");

    for (let i=0; i < 4 ; i++) {
        let div = $("<div class='v2048-board-tr"+ i + "'></div>");
        let tmp_arr = [];
        for (let j=0; j < 4; j++) {
            let cell_pos = "y" + i + " x" + j;
            let cell_pos_selector = "td.y" + i + ".x" + j;
            let img = $("<div class='" + cell_pos + "' data-2048-num='0'><img/></div>");

            tmp_arr.push($(cell_pos_selector));
            div.append(img);
        }

        table_arr.push(tmp_arr);
        table_element.append(div);
    }

   /* Wrapper function for swipe. Called by keydown
    *
    */
    function swipe(direction) {
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
                    let cell = (axis === "x" && ortho_start===0) ? get_cell(j,i) :
                     (axis === "x" && ortho_start===1) ? get_cell(3-j,i) :
                     (axis === "y" && ortho_start===0) ? get_cell(i,j) :
                     (axis === "y" && ortho_start===1) ? get_cell(i,3-j) :
                     "ERROR IN GATHER";
                    if (cell.attr("data-2048-num") !== "0") {
                        gather.push(cell.attr("data-2048-num"));
                    }
                }

                console.log("Gather " + i + ": " + gather);
                let buffer = 4-gather.length;

                for (let j=0; j < buffer; j++) {
                    gather.unshift("0");
                }

                console.log("Shifted " + i + ": " + gather);

                let end_state = [];

                for (let j=0; j < 4; j++) {
                    if (j === 3) { // If we get to end of gather, it's not paired, so push and break.
                        end_state.push(gather[j]);
                        break;
                    }
                    if (j === 4) { // If we overshoot, end was paired, so break.
                        break;
                    }
                    if (gather[j] === gather[j+1] && parseInt(gather[j]) !== 0) { // If consecutive entries match, push their sum and skip matched entry.
                        end_state.push("0", (parseInt(gather[j])+1).toString());
                        j++;
                    }
                    else { // If no match, push entry.
                        end_state.push(gather[j]);
                    }
                }

                console.log("End state: " + i + ": " + end_state);

                for (let j=0; j < 4; j++) {
                    (axis === "x" && ortho_start==0) ? set_cell(j,i,end_state[j]) : // right
                    (axis === "x" && ortho_start==1) ? set_cell(3-j,i,end_state[j]) : // left
                    (axis === "y" && ortho_start==0) ? set_cell(i,j,end_state[j]) : // down
                    (axis === "y" && ortho_start==1) ? set_cell(i,3-j,end_state[j]) : // up
                    console.log("End of axis/ortho chain: should never be reached.");
                }
            }


        }
    }

    function reset() {

    }

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

   /* Add either l1 or l2 image into random empty cell
    *
    */
    function add_rand_cell() {
        let empty = $("[data-2048-num='0']");
        (rand_int(0,1) === 0) ? set_cell_object($(empty[rand_int(0,empty.length-1)]),1) :
         set_cell_object($(empty[rand_int(0,empty.length-1)]),2);
    }

   /* Get nth image from legend table
    *
    */
    function nth_image(n) {
        return (n === 0 || n === "0") ? "" : $("table.v2048-legend td.l" + n + " img").attr("src");
    }
   /* Rand int in range [a,b] (i.e, double inclusive)
    *
    */
    function rand_int(a,b) {
        return Math.floor(Math.random()*(b-a) + a);
    }

    add_rand_cell();
    add_rand_cell();

    $(document).keydown(function(e){
        switch (e.which) {
            case 38: {
                e.preventDefault();
                swipe("up");
                add_rand_cell();
                break;
            }
            case 40: {
                e.preventDefault();
                swipe("down");
                add_rand_cell();
                break;
            }
            case 37: {
                e.preventDefault();
                swipe("left");
                add_rand_cell();
                break;
            }
            case 39: {
                e.preventDefault();
                swipe("right");
                add_rand_cell();
                break;
            }
        }
    });
    //$("table.v2048-table img").attr("src", $(".l1 img").attr("src")); // temp image in cells to check dimensions
}); // TODO make animation for slide: fade out/in (Previous slides in dir/fades out, current fades in stationary)