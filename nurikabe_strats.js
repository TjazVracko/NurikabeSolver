
// https://en.wikipedia.org/wiki/Nurikabe_(puzzle)

// ----------------------------- starts helper stuff

const solution_states = {
    "unknown": 0,
    "island": 1,
    "sea": 2,
}

class Point {
    constructor(x, y) {
        this.x = x
        this.y = y
    }

    compare(other) {
        if (this.x == other.x && this.y == other.y) {
            return true
        }
        return false
    }

    distance(other) {
        // manhattan distance
        return Math.abs(this.x - other.x) + Math.abs(this.y - other.y)
    }

    neighbours(nurikabe_matrix) {
        var max_x = nurikabe_matrix.length - 1
        var max_y = nurikabe_matrix[0].length - 1

        var x = this.x
        var y = this.y

        var arr = new Array()

        // above
        if (x - 1 >= 0) {
            arr.push(new Point(x - 1, y))
        }

        // left
        if (y - 1 >= 0) {
            arr.push(new Point(x, y - 1))
        }

        // right
        if (y + 1 <= max_y) {
            arr.push(new Point(x, y + 1))
        }

        // bellow
        if (x + 1 <= max_x) {
            arr.push(new Point(x + 1, y))
        }

        return arr
    }

}

function uniqBy(a, key) {
    var seen = {};
    return a.filter(function (item) {
        var k = key(item);
        return seen.hasOwnProperty(k) ? false : (seen[k] = true);
    })
}
class Island {
    constructor(origin_point, size) {
        this.size = size
        this.origin = origin_point
        this.area = new Array()
        this.add_point(origin_point)
    }

    add_point(point) {
        this.area.push(point)
    }

    is_complete() {
        return this.size == this.area.length
    }

    is_in(point) {
        for (var i = 0; i < this.area.length; i++) {
            if (this.area[i].x == point.x && this.area[i].y == point.y) {
                return true
            }
        }
        return false
    }

    neighbours(input_matrix) {
        // return all adjecent points of this island
        var adj = new Array;
        this.area.forEach(ip => {
            var ipns = ip.neighbours(input_matrix)
            // if point is not of this island, it is a neighbour:
            ipns.forEach(ipn => {
                if (!this.is_in(ipn)) {
                    adj.push(ipn)
                }
            })

        });
        // filter same points
        var adj = uniqBy(adj, JSON.stringify)
        return adj
    }

    closest_island_cell_to_point(point) {
        var min_dist = 999999
        var min_dist_cell = null
        this.area.forEach(island_cell => {
            var dist = island_cell.distance(point)
            if (dist < min_dist) {
                min_dist = dist
                min_dist_cell = island_cell
            }
        })
        return min_dist_cell
    }
}

class Sea {
    constructor() {
        this.area = new Array()
    }

    add_point(point) {
        this.area.push(point)
    }

    is_in(point) {
        for (var i = 0; i < this.area.length; i++) {
            if (this.area[i].x == point.x && this.area[i].y == point.y) {
                return true
            }
        }
        return false
    }

}

class Nurikabe {
    constructor(input_matrix) {
        this.input_matrix = input_matrix

        this.sea = new Sea()
        this.islands = this.init_islands(input_matrix)
        this.unasigned_island_points = new Sea()  // to hold the points, dont use all methods
    }

    init_islands(input_matrix) {
        var arr = new Array()
        for (var i = 0; i < input_matrix.length; i++) {
            for (var j = 0; j < input_matrix[0].length; j++) {
                if (input_matrix[i][j] != 0) {
                    arr.push(new Island(new Point(i, j), input_matrix[i][j]))
                }
            }
        }
        return arr
    }

    create_solution_matrix() {
        // Output current solution as matrix

        // init array
        var m = new Array(this.input_matrix.length);
        for (var i = 0; i < this.input_matrix.length; i++) {
            m[i] = new Array(this.input_matrix[0].length);
            for (var j = 0; j < this.input_matrix[0].length; j++) {
                m[i][j] = 0;
            }
        }

        // fill with values:
        this.islands.forEach(island => {
            island.area.forEach(point => {
                m[point.x][point.y] = solution_states.island
            });
        });
        this.sea.area.forEach(point => {
            m[point.x][point.y] = solution_states.sea
        });
        this.unasigned_island_points.area.forEach(point => {
            m[point.x][point.y] = solution_states.island
        });
        return m
    }

    is_in(point) {
        // is point in any if the islands or the sea
        for (var i = 0; i < this.islands.length; i++) {
            if (this.islands[i].is_in(point)) {
                return true
            }
        }
        return this.sea.is_in(point)
    }

    belongs_to(point) {
        // returns what the point belongs to:
        // nothing
        // unasigned island points
        // sea
        // island
        if (this.sea.is_in(point)) {
            return this.sea
        }

        for (var i = 0; i < this.islands.length; i++) {
            if (this.islands[i].is_in(point)) {
                return this.islands[i]
            }
        }

        if (this.unasigned_island_points.is_in(point)) {
            return this.unasigned_island_points
        }

        return null
    }

    is_full() {
        // is the whole solution_matrix filled in?
        var matrix = this.create_solution_matrix()
        for (var i = 0; i < matrix.length; i++) {
            for (var j = 0; j < matrix[0].length; j++) {
                if (matrix[i][j] == solution_states.unknown) {
                    return false
                }
            }
        }
        return true
    }

    is_valid() {
        // the whole board must be filled in
        var matrix = this.create_solution_matrix()
        for (var i = 0; i < matrix.length; i++) {
            for (var j = 0; j < matrix[0].length; j++) {
                if (matrix[i][j] == solution_states.unknown) {
                    return false
                }
            }
        }

        // all islands must be of specified size
        for (var i = 0; i < this.islands.length; i++) {
            if (!this.islands[i].is_complete()) {
                return false
            }
        }

        // all islands must be continious within themselves
        for (var i = 0; i < this.islands.length; i++) {
            var island = this.islands[i]
            for (var j = 0; j < island.area.length; j++) {
                var neigh = island.area[j].neighbours(this.input_matrix)
                var c = 0
                for (var k = 0; k < neigh.length; k++) {
                    // if neighbour of island point is also an island point, it must be of the same island
                    if (matrix[neigh[k].x][neigh[k].y] == solution_states.island && !island.is_in(neigh[k])) {
                        return false
                    }
                    // at least 1 neighbour of island point must also be an island point from this island, unless island size is 1
                    if (matrix[neigh[k].x][neigh[k].y] == solution_states.island && island.is_in(neigh[k])) {
                        c += 1
                    }
                }
                if (island.size == 1 && c != 0) {
                    return false
                }
                else if (island.size > 1 && c == 0) {
                    return false
                }
            }
        }

        // all islands must be sorounded by sea -> is checked above

        // the whole sea must be connected
        if (!are_points_continious_area(this.sea.area, matrix)) {  // WARN: this modifies the matrix
            return false
        }
        // if all is good, is good
        return true
    }

}

function are_points_continious_area(points, solution_matrix) {
    // set points in matrix to some number
    points.forEach(p => {
        solution_matrix[p.x][p.y] = 1337
    })
    // check if area is continious
    return is_continious_area(1337, solution_matrix)
}

function is_continious_area(elem, matrix) {
    var starting_point = find_an_elem(elem, matrix)
    walk_the_matrix(starting_point, elem, matrix)

    if (find_an_elem(elem, matrix) != null) {
        return false
    }
    return true
}

function find_an_elem(elem, matrix) {
    for (var i = 0; i < matrix.length; i++) {
        for (var j = 0; j < matrix[0].length; j++) {
            if (matrix[i][j] == elem) {
                return new Point(i, j)
            }
        }
    }
    return null
}

function walk_the_matrix(point, elem, matrix) {
    // Clear current point and move to adjacent cells that are "elem"
    // check if this is a valid cell to work on:
    if (matrix[point.x][point.y] != elem) {
        return // nothing to do here, terminate this recursion branch
    }

    // clear this cell:
    matrix[point.x][point.y] = -1
    // recurse to all neighbours:
    var neigh = point.neighbours(matrix)
    neigh.forEach(n => {
        walk_the_matrix(n, elem, matrix)
    })

}



// ----------------------------- SOLVING STRATEGIES


/*
Since two islands may only touch at corners, cells between two partial islands
(numbers and adjacent white cells that don't total their numbers yet) must be black.
This is often a way to start a Nurikabe puzzle, by marking cells adjacent to two or more numbers as black.
*/

function black_between_partial_islands(nurikabe) {
    var change = false;
    // for each island
    // for each island
    // compare neighbours of islands
    // if same point is neighbour of both islands -> color it black
    for (var i = 0; i < nurikabe.islands.length; i++) {
        var island1 = nurikabe.islands[i]
        var neighbours1 = island1.neighbours(nurikabe.input_matrix)
        for (var j = 0; j < nurikabe.islands.length; j++) {
            if (i == j) continue;  // dont compare with same island
            var island2 = nurikabe.islands[j]
            var neighbours2 = island2.neighbours(nurikabe.input_matrix)

            // compare neighbours
            for (var k = 0; k < neighbours1.length; k++) {
                for (var l = 0; l < neighbours2.length; l++) {
                    if (neighbours1[k].compare(neighbours2[l]) && !nurikabe.sea.is_in(neighbours2[l])) {  // if points are the same and the point is not part of the sea
                        nurikabe.sea.add_point(neighbours1[k])
                        change = true;
                    }
                }
            }
        }
    }
    return change
}

/*
Once an island is "complete"—that is, it has all the white cells its number requires—all cells that share a side with it must be black.
Obviously, any cells marked with '1' at the outset are complete islands unto themselves, and can be isolated with black at the beginning.
*/

function black_around_complete_islands(nurikabe) {
    var change = false
    nurikabe.islands.forEach(island => {
        if (island.is_complete()) {
            // add all black around the island
            island.area.forEach(island_point => {
                // find 4 neighbours of point and color them "sea" if they have no color yet
                var neigh = island_point.neighbours(nurikabe.input_matrix)
                neigh.forEach(n => {
                    if (!nurikabe.is_in(n)) {
                        nurikabe.sea.add_point(n)
                        change = true
                    }
                });
            });
        }
    });

    return change
}

/*
Whenever three black cells form an "elbow"—an L-shape—the cell in the bend (diagonally in from the corner of the L) must be white.
(The alternative is a "pool", for lack of a better term.)
*/

function black_L_means_white_inside(nurikabe) {
    var change = false
    // chech each 2x2 area of the matrix for L shaped sea cells - mark the 4th cell white (add to uknown_island_cells)
    var matrix = nurikabe.create_solution_matrix()  // current matrix

    for (var i = 0; i < matrix.length - 1; i++) {
        for (var j = 0; j < matrix[0].length - 1; j++) {  // -1 v for zato, da ne gremo čisto do roba (jemljemo 2x2 v desno in dol)
            var c1 = matrix[i][j]   //levo gori
            var c2 = matrix[i][j + 1] //desno gori
            var c3 = matrix[i + 1][j] //levo doli
            var c4 = matrix[i + 1][j + 1] //desno doli

            // 4 možnosti za črni L
            if (c1 == solution_states.sea && c2 == solution_states.sea && c3 == solution_states.sea && c4 == solution_states.unknown) {
                nurikabe.unasigned_island_points.add_point(new Point(i + 1, j + 1))  // c4
                change = true
            }
            else if (c1 == solution_states.sea && c2 == solution_states.sea && c4 == solution_states.sea && c3 == solution_states.unknown) {
                nurikabe.unasigned_island_points.add_point(new Point(i + 1, j))  // c3
                change = true
            }
            else if (c1 == solution_states.sea && c3 == solution_states.sea && c4 == solution_states.sea && c2 == solution_states.unknown) {
                nurikabe.unasigned_island_points.add_point(new Point(i, j + 1))  // c2
                change = true
            }
            else if (c2 == solution_states.sea && c3 == solution_states.sea && c4 == solution_states.sea && c1 == solution_states.unknown) {
                nurikabe.unasigned_island_points.add_point(new Point(i, j))  // c1
                change = true
            }
        }
    }
    return change
}

/*
Used with previous strategy - assings unasgned island cells to islands

TODO: All white cells must eventually be part of exactly one island. If there is a white region that does not contain a number,
and there is only one possible way for it to connect to a numbered white region, the sole connecting pathway must be white.
*/

function add_unasigned_island_points_to_islands(nurikabe) {
    var change = false
    // try to add each unasigned island points to some island, if possible

    nurikabe.unasigned_island_points.area.forEach(uip => {
        // is unasigned points neighbour of island?
        nurikabe.islands.forEach(island => {
            // if island is not complete (this is more of a sanity check, you cant realy have a neighbour white cell to a complete island)
            if (!island.is_complete()) {
                island.neighbours(nurikabe.input_matrix).forEach(neighbour => {
                    if (neighbour.compare(uip)) {
                        island.add_point(uip)
                        nurikabe.unasigned_island_points.area.splice(nurikabe.unasigned_island_points.area.indexOf(uip), 1)
                        change = true
                    }
                })
            }
        })
    })

    // is unasigned point close enough to an island to be part of it (check distance)
    nurikabe.unasigned_island_points.area.forEach(uip => {
        var viable_islands = new Array()
        nurikabe.islands.forEach(island => {
            // check distance from closest cell of the island to this cell.
            var closest = island.closest_island_cell_to_point(uip)
            var dist = closest.distance(uip)
            // this distance must be smaller then ISLAND_SIZE - ISLAND_AREA_LEN to be inside the island.
            if (dist <= island.size - island.area.length) {
                viable_islands.push(island)
            }
        })
        if (viable_islands.length == 1) {
            // must be of this island
            viable_islands[0].add_point(uip)
            nurikabe.unasigned_island_points.area.splice(nurikabe.unasigned_island_points.area.indexOf(uip), 1)
            change = true
        }
    })

    return change
}




/*
Some puzzles will require the location of "unreachables" — cells that cannot be connected to any number,
being either too far away from all of them or blocked by other numbers. Such cells must be black.
Often, these cells will have only one route of connection to other black cells or will form an elbow
whose required white cell (see previous bullet) can only reach one number, allowing further progress.
*/

function check_for_unreachable_sea_cells(nurikabe) {
    var change = false
    var matrix = nurikabe.create_solution_matrix()  // current matrix
    // go over the matrix and check the distance from each cell to the island origins. If the distance is larger then the island size,
    // this cell can not be part of that island.
    // if no islands are close enough, this cell is sea

    // for each cell
    for (var i = 0; i < matrix.length; i++) {
        for (var j = 0; j < matrix[0].length; j++) {
            if (matrix[i][j] == solution_states.unknown) {
                var current_point = new Point(i, j)
                // for each island that is not complete
                var viable_islands = new Array()
                nurikabe.islands.filter(island => !island.is_complete()).forEach(island => {
                    // check distance from closest cell of the island to this cell.
                    var closest = island.closest_island_cell_to_point(current_point)
                    var dist = closest.distance(current_point)
                    // this distance must be larger then ISLAND_SIZE - ISLAND_AREA_LEN to be outside.
                    if (dist <= island.size - island.area.length) {
                        viable_islands.push(island)
                    }
                })
                if (viable_islands.length == 0) {
                    // must be sea
                    nurikabe.sea.add_point(current_point)
                    change = true
                    // matrix = nurikabe.create_solution_matrix()  // update matrix to see change
                }
                // NOTE: THIS IS NOT TRUE for unknown cells, but it is true for unasigned island cells (see above function)
                // else if (viable_islands.length == 1) {
                //     // must be of this island
                //     viable_islands[0].add_point(current_point)
                //     change = true
                //     matrix = nurikabe.create_solution_matrix()  // update matrix to see change
                // }

            }
        }
    }


    return change
}


/*
If all neighbours of an unknown cell are sea, this cell must also be sea.
If all neighbours of an unknown cell are of the same island, this cell must also be of that island.
*/

function all_neighbours_are_same(nurikabe) {
    var change = false
    var matrix = nurikabe.create_solution_matrix()  // current matrix

    for (var i = 0; i < matrix.length; i++) {
        for (var j = 0; j < matrix[0].length; j++) {
            if (matrix[i][j] == solution_states.unknown) {
                var current_point = new Point(i, j)
                var neighs = current_point.neighbours(nurikabe.input_matrix)

                var sea_count = 0
                var neigh_islands = new Array()
                neighs.forEach(n => {
                    if (matrix[n.x][n.y] == solution_states.sea) {
                        sea_count++
                    }

                    if (matrix[n.x][n.y] == solution_states.island) {

                        neigh_islands.push(nurikabe.belongs_to(n))
                    }
                })

                if (sea_count == neighs.length) {
                    nurikabe.sea.add_point(current_point)
                    change = true
                }
                if (neigh_islands.length == neighs.length) {
                    // if all neighbouring islands are the same island, or part of the "unasigned island", this point must be of that island

                    // how many unasigned?
                    var unasigned_c = neigh_islands.filter(n => nurikabe.unasigned_island_points.is_in(n)).length

                    // how many others are the same?
                    var others = neigh_islands.filter(n => !nurikabe.unasigned_island_points.is_in(n))  // TODO: find error here, something is wrong
                    var others_c = others.filter(n => n == others[0]).length  // filter for the same island as the first one

                    if (others_c + unasigned_c == neighs.length) {
                        nurikabe.unasigned_island_points.add_point(current_point)
                        change = true
                    }
                }
            }

        }
    }


    return change
}

/*
if a non-complete island has only 1 neighbour that is unknown, the island must spread in that direction
TODO: da spreadaš najprej od origina, potem pa od ostalih točk, maybe
*/

function island_spread(nurikabe) {
    var change = false

    var matrix = nurikabe.create_solution_matrix()  // current matrix

    nurikabe.islands.forEach(island => {
        var neighs = island.neighbours(nurikabe.input_matrix)
        // filter unknown
        var non_island_neighs = neighs.filter(p => matrix[p.x][p.y] == solution_states.unknown)

        // some neighbours might be unknown, but are to far away from the origin to be part of this island
        var usable_neighs = non_island_neighs.filter(p => p.distance(island.origin) < island.size)

        if (usable_neighs.length == 1) {
            island.add_point(usable_neighs[0])
            change = true
        }
    })

    return change
}



/*
TODO: All black cells must eventually be connected. If there is a black region with only one possible way to connect to the rest of the board,
the sole connecting pathway must be black.

*/