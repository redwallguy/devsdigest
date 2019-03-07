define(['jquery','./base'], function($, base) {

   /* Creating table, inserting into DOM, and keeping references to elements in 2D array
    * Each td has class identifiers corresponding to position (x,y) in table.
    * (1,1) positioned at top left.
    */
    let redo_arr = [];
    let table_arr = [];
    let table_element = $("table.v2048-table tbody");

    for (let i=0; i < 4 ; i++) {
        let tr = $("<tr></tr>");
        let tmp_arr = [];
        for (let j=0; j < 4; j++) {
            let cell_pos = "y" + i + " x" + j;
            let cell_pos_selector = "td.y" + i + ".x" + j;
            let td = $("<td class='" + cell_pos + "' data-2048-num='0'><img/></td>");

            tmp_arr.push($(cell_pos_selector));
            tr.append(td);
        }

        table_arr.push(tmp_arr);
        table_element.append(tr);
    }

   /* Wrapper function for swipe. Called by keydown
    *
    */
    function swipe(direction) {
        switch (direction) {
            case "left": {
                swipe_helper("x", 4);
                break;
            }
            case "right": {
                swipe_helper("x", 1);
                break;
            }
            case "up": {
                swipe_helper("y", 4);
                break;
            }
            case "down": {
                swipe_helper("y", 1);
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
                    let cell = (axis === "x") ? get_cell(j,i) : get_cell(i,j);
                    if (cell.attr("data-2048-num") !== "0") {
                        gather.push(cell.attr("data-2048-num"));
                    }
                }

                let end_state = [];

                for (let j=0; j < gather.length; j++) {
                    if (j === (gather.length - 1)) { // If we get to end of gather, it's not paired, so push and break.
                        end_state.push(gather[j])
                        break;
                    }
                    if (j === gather.length) { // If we overshoot, end was paired, so break.
                        break;
                    }
                    if (gather[j] === gather[j+1]) { // If consecutive entries match, push their sum and skip matched entry.
                        end_state.push(gather[j] * 2);
                        j++;
                    }
                    else { // If no match, push entry.
                        end_state.push(gather[j]);
                    }
                }

                for (let j=0; j < 4; j++) {
                    (axis === "x") ? set_cell(j,i,0) : set_cell(i,j,0);
                }

                for (let j=0; j < end_state.length; j++) {
                    (axis === "x" && ortho_start==1) ? set_cell(j,i,end_state[j]) : // right
                    (axis === "x" && ortho_start==4) ? set_cell(3-j,i,end_state[j]) : // left
                    (axis === "y" && ortho_start==1) ? set_cell(i,j,end_state[j]) : // down
                    (axis === "y" && ortho_start==4) ? set_cell(i,3-j,end_state[j]) : // up
                    console.log("End of axis/ortho chain: should never be reached.");
                }
            }


        }
    }

   /* Helper functions
    *
    */

   /* Get jquery object of td element at position (x,y) in the table ((0,0) origin @ top left)
    *
    */
    function get_cell(x,y) {
        return $("table.v2048-table td.x" + x + ".y" + y);
    }

   /* Set image for cell(x,y) as image from legend(n)
    *
    */
    function set_cell(x,y,n) {
        get_cell(x,y).attr("data-2048-num", n);
        get_cell(x,y).find("img").attr("src", nth_image(n));
    }

   /* Get nth image from legend table
    *
    */
    function nth_image(n) {
        return (n === 0 || n === "0") ? "" : $("table.v2048-legend td.l" + n + " img").attr("src");
    }

    //$("table.v2048-table img").attr("src", $(".l1 img").attr("src")); // temp image in cells to check dimensions


    set_cell(1,1,2);
    set_cell(1,2,2);
    set_cell(2,1,1);
    set_cell(2,2,2);

    setTimeout(function(){swipe("right");},2000);
}); // TODO make animation for slide: fade out/in (Previous slides in dir/fades out, current fades in stationary)