function generate_grid() {
    // read wors and cols from user
    nurikabe_rows = document.getElementById("input_rows").value
    nurikabe_cols = document.getElementById("input_cols").value

    console.log(nurikabe_rows)
    console.log(nurikabe_cols)

    var table = document.getElementById("grid")

    // clear table
    table.innerHTML = ""

    // fill table with input cells
    for (i = 0; i < nurikabe_rows; i++) {
        var row = table.insertRow();
        for (j = 0; j < nurikabe_cols; j++) {
            var cell = row.insertCell();
            cell.innerHTML = '<input type="text" maxlength="3" size="1" id="' + i + ',' + j + '">'
        }
    }

    // reset state machine
    current_state = States.INIT
}

function solve_btn_click() {
    console.log("LOADING MATRIX")
    nurikabe_matrix = load_matrix();
    // console.log(nurikabe_matrix)

    console.log("SOLVING START")

    var t0 = performance.now();
    solution = solve_nurikabe(nurikabe_matrix);
    var t1 = performance.now();
    var seconds_it_took = (t1 - t0) / 1000

    console.log("SOLUTION")
    console.log(solution)

    if (solution != null) {
        generate_output_grid(nurikabe_matrix, solution)
        document.getElementById("time_p").innerHTML = "Solving took " + seconds_it_took.toFixed(3) + " seconds."
    }
    else {
        document.getElementById("time_p").innerHTML = "No solution found"
    }

}

function load_matrix() {
    var nurikabe_matrix = new Array(nurikabe_rows);

    var table = document.getElementById("grid");
    for (var i = 0, row; row = table.rows[i]; i++) {
        nurikabe_matrix[i] = new Array(nurikabe_cols);
        for (var j = 0, cell; cell = row.cells[j]; j++) {
            var x = cell.firstChild.value

            nurikabe_matrix[i][j] = x != "" ? parseInt(x) : 0  // če je prazno je 0
        }
    }

    return nurikabe_matrix
}

function generate_output_grid(nurikabe_matrix, solution_matrix) {
    var table = document.getElementById("output_grid");
    table.innerHTML = ""

    table.style.border = "1px solid black"
    table.style.borderCollapse = "collapse"

    for (i = 0; i < nurikabe_rows; i++) {
        var row = table.insertRow();
        for (j = 0; j < nurikabe_cols; j++) {
            var cell = row.insertCell();
            cell.style.width = "20px"
            cell.style.height = "20px"
            cell.style.border = "1px solid black"

            if (nurikabe_matrix[i][j] != 0) {
                cell.innerHTML = nurikabe_matrix[i][j]
            }
            else if (solution_matrix[i][j] == solution_states.sea) {
                cell.style.backgroundColor = "black"
            }
            else if (solution_matrix[i][j] == solution_states.island) {
                cell.innerHTML = "&#8226"  // dot •
            }
        }
    }
}

// top level solving function
function solve_nurikabe(nurikabe_matrix) {
    /*
    1. create tree of nurikabe grids.
    2. Start at root node with unsolved nurikabe
    3. Iterate over solving strategies until no more progress is made
    4. create new leaf node, copy over current nurikabe state and make a random guess (add a istand / sea field)
    5. continue solving via strategies
    6. repeat creating leaf nodes for each new guess. If no more progress can be made or the solution is not right (not all rules followed), backtrack up the tree and make a new guess
    */

    // init tree (fill initial values into grid)
    nurikabe = new Nurikabe(nurikabe_matrix)
    console.log("nurikabe")
    console.log(nurikabe)
    var tree = new Tree(nurikabe)
    var current_node = tree.root

    do {
        // Iterate over solving strategies until no more progress is made
        do {
            change = try_solving_strategies(current_node.nurikabe)
        } while (change)

        // if solution is found, exit
        if (current_node.nurikabe.is_valid()) {
            break
        }

        // if not valid, and not full (there are unknown fiels left), construct new child node with a random guess added to the solution_matrix
        if (!current_node.nurikabe.is_full()) {
            // add next possible guess and create child
            current_node = current_node.add_child_with_guess()
        }
        // if matrix is full and not valid, move up the tree and contuniue from there with new guesses
        else {
            var p_node = current_node
            do {
                p_node = p_node.parent
                if (p_node == null) {
                    // we went up to the root and exhaused all guesses - aka no solution is possible:
                    console.log("ALL POSIBILITIES EXHAUSTED")
                    console.log(tree.root)

                    return null
                }
                var child_node = p_node.add_child_with_guess()
            } while (child_node == null)  // this moves up all nodes that have exhausted their guesses.
            current_node = child_node
        }

        // generate_output_grid(current_node.nurikabe.input_matrix, current_node.nurikabe.create_solution_matrix())

    } while (!current_node.nurikabe.is_valid())  // until a valid solution is found


    solution_node = current_node
    console.log("IS SOLUTION GOOD?")
    console.log(solution_node.nurikabe.is_valid())
    solution_matrix = solution_node.nurikabe.create_solution_matrix()
    console.log(solution_node.nurikabe)
    return solution_matrix

}


function try_solving_strategies(nurikabe) {
    // call each solving strat once:
    var r1 = black_around_complete_islands(nurikabe)
    // generate_output_grid(nurikabe.input_matrix, nurikabe.create_solution_matrix())

    var r2 = black_between_partial_islands(nurikabe)
    // generate_output_grid(nurikabe.input_matrix, nurikabe.create_solution_matrix())

    var r3 = black_L_means_white_inside(nurikabe)
    // generate_output_grid(nurikabe.input_matrix, nurikabe.create_solution_matrix())

    var r4 = add_unasigned_island_points_to_islands(nurikabe)
    // generate_output_grid(nurikabe.input_matrix, nurikabe.create_solution_matrix())

    var r5 = check_for_unreachable_sea_cells(nurikabe)
    // generate_output_grid(nurikabe.input_matrix, nurikabe.create_solution_matrix())

    var r6 = all_neighbours_are_same(nurikabe)
    // generate_output_grid(nurikabe.input_matrix, nurikabe.create_solution_matrix())

    var r7 = island_spread(nurikabe)
    // generate_output_grid(nurikabe.input_matrix, nurikabe.create_solution_matrix())

    var r8 = sea_spread(nurikabe)
    // generate_output_grid(nurikabe.input_matrix, nurikabe.create_solution_matrix())

    var r9 = fill_sea_if_islands_are_complete(nurikabe)
    // generate_output_grid(nurikabe.input_matrix, nurikabe.create_solution_matrix())

    var r10 = connect_island_parts(nurikabe)
    // generate_output_grid(nurikabe.input_matrix, nurikabe.create_solution_matrix())

    return r1 || r2 || r3 || r4 || r5 || r6 || r7 || r8 || r9 || r10 // ...
}


// ------------------------------- STEP BY SPET FSM -------------------------------------

States = {
    INIT: 'Initialisation',
    SOLVE_START: 'Go through solving strategies',
    END: 'NO SOLUTION FOUND',
    SOLUTION: 'SOLUTION FOUND',
    black_around_complete_islands: 'Add black cells around complete islands',
    black_between_partial_islands: 'Add black cells between partial islands',
    black_L_means_white_inside: 'Black L shape means 4th cell is island',
    add_unasigned_island_points_to_islands: 'Add unasigned white cells to islands',
    check_for_unreachable_sea_cells: 'Check for unreachable sea cells',
    all_neighbours_are_same: 'Check if all neighbours are the same',
    island_spread: 'Spread islands',
    sea_spread: 'Spread the sea',
    fill_sea_if_islands_are_complete: 'FIll sea if all islands are complete',
    connect_island_parts: 'Connect island parts',
    STRATS_EXHAUSTED: 'ALL SOLVING STRATEGIES EXHAUSED',
    ADD_GUESS: 'ADDING NODE TO TREE WITH RANDOM GUESS'
}

current_state = States.INIT

function step_btn_click() {
    console.log("LOADING MATRIX")
    nurikabe_matrix = load_matrix();
    // console.log(nurikabe_matrix)

    if (current_state == States.END || current_state == States.SOLUTION) {
        console.log("INIT STATE MACHINE")
        current_state = States.INIT
        console.log("SOLVING START")
    }

    solution = solve_nurikabe_state(nurikabe_matrix);

    // console.log("SOLUTION")
    console.log(solution)

    if (solution != null) {
        generate_output_grid(nurikabe_matrix, solution)
    }
    document.getElementById("time_p").innerHTML = current_state
}


function solve_nurikabe_state(nurikabe_matrix) {
    if (current_state == States.INIT) {
        // init tree (fill initial values into grid)
        nurikabe = new Nurikabe(nurikabe_matrix)
        console.log("nurikabe")
        console.log(nurikabe)
        tree = new Tree(nurikabe)
        current_node = tree.root

        current_state = States.SOLVE_START
    }

    else if (current_state == States.SOLVE_START) {
        current_state = States.black_around_complete_islands
    }

    else if (current_state == States.black_around_complete_islands) {
        r1 = black_around_complete_islands(current_node.nurikabe)
        current_state = States.black_between_partial_islands
    }
    else if (current_state == States.black_between_partial_islands) {
        r2 = black_between_partial_islands(current_node.nurikabe)
        current_state = States.black_L_means_white_inside
    }
    else if (current_state == States.black_L_means_white_inside) {
        r3 = black_L_means_white_inside(current_node.nurikabe)
        current_state = States.add_unasigned_island_points_to_islands
    }
    else if (current_state == States.add_unasigned_island_points_to_islands) {
        r4 = add_unasigned_island_points_to_islands(current_node.nurikabe)
        current_state = States.check_for_unreachable_sea_cells
    }
    else if (current_state == States.check_for_unreachable_sea_cells) {
        r5 = check_for_unreachable_sea_cells(current_node.nurikabe)
        current_state = States.all_neighbours_are_same
    }
    else if (current_state == States.all_neighbours_are_same) {
        r6 = all_neighbours_are_same(current_node.nurikabe)
        current_state = States.island_spread
    }
    else if (current_state == States.island_spread) {
        r7 = island_spread(current_node.nurikabe)
        current_state = States.sea_spread
    }
    else if (current_state == States.sea_spread) {
        r8 = sea_spread(current_node.nurikabe)
        current_state = States.fill_sea_if_islands_are_complete
    }
    else if (current_state == States.fill_sea_if_islands_are_complete) {
        r9 = fill_sea_if_islands_are_complete(current_node.nurikabe)
        current_state = States.connect_island_parts
    }
    else if (current_state == States.connect_island_parts) {
        r10 = connect_island_parts(current_node.nurikabe)
        if (r1 || r2 || r3 || r4 || r5 || r6 || r7 || r8 || r9 || r10) {
            // go through starts again
            current_state = States.SOLVE_START
        }
        else {
            current_state = States.STRATS_EXHAUSTED
        }

    }

    else if (current_state == States.STRATS_EXHAUSTED) {
        // if solution is found, exit
        if (current_node.nurikabe.is_valid()) {
            current_state = States.SOLUTION
        }
        else {
            current_state = States.ADD_GUESS
        }
    }

    else if (current_state == States.ADD_GUESS) {
        if (!current_node.nurikabe.is_full()) {
            // add next possible guess and create child
            current_node = current_node.add_child_with_guess()
        }
        // if matrix is full and not valid, move up the tree and contuniue from there with new guesses
        else {
            var p_node = current_node
            do {
                p_node = p_node.parent
                if (p_node == null) {
                    // we went up to the root and exhaused all guesses - aka no solution is possible:
                    console.log("ALL POSIBILITIES EXHAUSTED")
                    console.log(tree.root)

                    current_state = States.END
                    return null
                }
                var child_node = p_node.add_child_with_guess()
            } while (child_node == null)  // this moves up all nodes that have exhausted their guesses.
            current_node = child_node
        }
        current_state = States.SOLVE_START
    }
    return current_node.nurikabe.create_solution_matrix()

}