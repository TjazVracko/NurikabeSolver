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

}

function solve_btn_click() {
    console.log("LOADING MATRIX")
    nurikabe_matrix = load_matrix();
    // console.log(nurikabe_matrix)

    console.log("SOLVING START")

    solution = solve_nurikabe(nurikabe_matrix);
    console.log("SOLUTION")
    console.log(solution)
    generate_output_grid(nurikabe_matrix, solution)

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

    // Iterate over solving strategies until no more progress is made
    var current_node = tree.root
    do {
        change = try_solving_strategies(tree.root.nurikabe)
    } while (change)

    // when no more changes are possible, construct new child node with a random guess added to the solution_matrix

    // bla bla
    solution_node = tree.root  // find node with solution to puzzle
    solution_matrix = solution_node.nurikabe.create_solution_matrix()
    console.log(solution_node.nurikabe)
    return solution_matrix

}


function try_solving_strategies(nurikabe) {
    // call each solving strat once:
    // var r1 = strat_test(nurikabe)  // each strat returns true if it changed something, false otherwise
    // var r2 = strat_test2(nurikabe)
    var r1 = black_around_complete_islands(nurikabe)
    var r2 = black_between_partial_islands(nurikabe)
    var r3 = black_L_means_white_inside(nurikabe)
    var r4 = add_unasigned_island_points_to_islands(nurikabe)
    var r5 = check_for_unreachable_sea_cells(nurikabe)

    return r1 || r2 || r3 || r4 || r5 // ...
}

function array_copy(arr) {
    var newArray = currentArray.map(function (arr) {
        return arr.slice();
    });
    return newArray
}

