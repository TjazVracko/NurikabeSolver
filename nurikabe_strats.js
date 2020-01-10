
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
        if (!this.is_in(point))
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

    closest_origin_area_cell_to_point(point, matrix) {
        var min_dist = 999999
        var min_dist_cell = null

        var origin_area = get_continious_areas(this.area, matrix)[0]

        origin_area.forEach(island_cell => {
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
        if (!this.is_in(point))
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
            if (!are_points_continious_area(this.islands[i].area, matrix)) {
                return false
            }
        }

        // all islands must be sorounded by sea -> is checked above

        // the whole sea must be connected
        if (!are_points_continious_area(this.sea.area, matrix)) {
            return false
        }

        // there are no 2x2 sea ares
        for (var i = 0; i < matrix.length - 1; i++) {
            for (var j = 0; j < matrix[0].length - 1; j++) {  // -1 v for zato, da ne gremo čisto do roba (jemljemo 2x2 v desno in dol)
                var c1 = matrix[i][j]   //levo gori
                var c2 = matrix[i][j + 1] //desno gori
                var c3 = matrix[i + 1][j] //levo doli
                var c4 = matrix[i + 1][j + 1] //desno doli
                if (matrix[i][j] == solution_states.sea && matrix[i][j + 1] == solution_states.sea && matrix[i + 1][j] == solution_states.sea && matrix[i + 1][j + 1] == solution_states.sea) {
                    return false
                }
            }
        }

        // there are no unasigned island points:
        if (this.unasigned_island_points.area.length != 0) {
            return false
        }

        // if all is good, is good
        return true
    }

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

*/

function add_unasigned_island_points_to_islands(nurikabe) {
    var change = false
    var matrix = nurikabe.create_solution_matrix()  // current matrix

    // try to add each unasigned island points to some island, if possible

    // Add all directly adjacent island points to the island
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
            // // check distance from closest cell of the island to this cell.
            // var closest = island.closest_island_cell_to_point(uip)
            // var dist = closest.distance(uip)
            // // this distance must be smaller then ISLAND_SIZE - ISLAND_AREA_LEN to be inside the island.
            // if (dist <= island.size - island.area.length) {
            //     viable_islands.push(island)
            // }

            // check distance from closest cell of the island to this cell using shortes path over "unknown" cells
            var closest = island.closest_island_cell_to_point(uip)
            // var dist = closest.distance(current_point)
            var shortest_path = bfs(matrix, uip, closest, successors_unknown)
            if (shortest_path != null) {
                var dist = shortest_path.length - 1
                // this distance must be larger then ISLAND_SIZE - (dist from closes point to origin) to be outside.
                // if (dist <= island.size - island.area.length) {
                var path_island_point_to_origin = bfs(matrix, closest, island.origin, successors_unknown_or_of_island)
                if (path_island_point_to_origin != null) {
                    if (dist <= island.size - path_island_point_to_origin.length) {
                        viable_islands.push(island)
                    }
                }

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
// TODO: find error in here TODO: TODO: TODO:

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
                    // check distance from closest cell of the "island origin area" to this cell using shortes path over "unknown" or "island" cells
                    var closest = island.closest_origin_area_cell_to_point(current_point, matrix)
                    // var dist = closest.distance(current_point)
                    var shortest_path = bfs(matrix, current_point, closest, successors_unknown_or_of_island)
                    if (shortest_path != null) {
                        var dist = shortest_path.length - 1
                        // this distance must be larger then ISLAND_SIZE - (dist from closes point to origin) to be outside.
                        // if (dist <= island.size - island.area.length) {
                        var path_island_point_to_origin = bfs(matrix, closest, island.origin, successors_unknown_or_of_island)
                        if (path_island_point_to_origin != null) {
                            if (dist <= island.size - path_island_point_to_origin.length) {
                                viable_islands.push(island)
                            }
                        }

                    }
                })
                if (viable_islands.length == 0) {
                    // must be sea
                    nurikabe.sea.add_point(current_point)
                    change = true
                    // matrix = nurikabe.create_solution_matrix()  // update matrix to see change
                }


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
                    var others = neigh_islands.filter(n => !nurikabe.unasigned_island_points.is_in(n))
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
same for each area of the island, if they are not connected
*/

function island_spread(nurikabe) {
    var change = false

    var matrix = nurikabe.create_solution_matrix()  // current matrix

    // nurikabe.islands.filter(i => !i.is_complete()).forEach(island => {
    //     var neighs = island.neighbours(nurikabe.input_matrix)
    //     // filter unknown
    //     var non_island_neighs = neighs.filter(p => matrix[p.x][p.y] == solution_states.unknown)

    //     // some neighbours might be unknown, but are to far away from the origin to be part of this island
    //     var usable_neighs = non_island_neighs.filter(p => p.distance(island.origin) < island.size)

    //     if (usable_neighs.length == 1) {
    //         island.add_point(usable_neighs[0])
    //         change = true
    //     }
    // })

    // the same thing as above, but for each island area (if it can only spread in 1 direction it does so)
    nurikabe.islands.filter(i => !i.is_complete()).forEach(island => {
        var areas = get_continious_areas(island.area, matrix)
        areas.forEach(area => {
            var neighs = area_neighbours(island, area, matrix)

            var unknown_neighs = neighs.filter(p => matrix[p.x][p.y] == solution_states.unknown)

            // some neighbours might be unknown, but are to far away from the origin to be part of this island
            var usable_neighs = unknown_neighs.filter(p => p.distance(island.origin) < island.size)

            if (usable_neighs.length == 1) {
                island.add_point(usable_neighs[0])
                change = true
            }
        })

    })

    return change
}



/*
All black cells must eventually be connected. If there is a black region with only one possible way to connect to the rest of the board,
the sole connecting pathway must be black.

If there is more that 1 black region, each black region that can spread in only 1 direction must spread in that direction.

*/

function sea_spread(nurikabe) {
    var change = false

    var matrix = nurikabe.create_solution_matrix()
    if (are_points_continious_area(nurikabe.sea.area, matrix)) {
        // if the sea is one area, we can not know if it must spread further
    }
    else {
        // start at some area of the sea
        var solution_matrix = nurikabe.create_solution_matrix()  // this one stays unmodified
        var starting_point = find_an_elem(solution_states.sea, matrix)

        do {
            // find all connected sea points
            var area_neighbours = new Array()
            recursive_neigh_search(starting_point, solution_states.sea, matrix, area_neighbours)  // matrix is modified with each call
            area_neighbours = uniqBy(area_neighbours, JSON.stringify)   // only unique points:

            // keep only unknows points
            area_neighbours = area_neighbours.filter(n => solution_matrix[n.x][n.y] == solution_states.unknown)

            // if sea can spred in only 1 dir, spread
            if (area_neighbours.length == 1) {
                nurikabe.sea.add_point(area_neighbours[0])
                change = true
            }

            // go to next sea area
            starting_point = find_an_elem(solution_states.sea, matrix)
        } while (starting_point != null)


    }

    return change
}

function recursive_neigh_search(point, elem, matrix, arr) {
    // Clear current point and move to adjacent cells that are "elem"
    // check if this is a valid cell to work on:
    if (matrix[point.x][point.y] != elem) {
        arr.push(point)
        return // nothing to do here, terminate this recursion branch
    }

    // clear this cell:
    matrix[point.x][point.y] = -1
    // recurse to all neighbours:
    var neigh = point.neighbours(matrix)
    neigh.forEach(n => {
        recursive_neigh_search(n, elem, matrix, arr)
    })

}

/*
if all islands are complete, the rest of the board is black
*/

function fill_sea_if_islands_are_complete(nurikabe) {
    var change = false

    var all_complete = nurikabe.islands.reduce((sum, next) => sum && next.is_complete(), true)

    if (all_complete) {
        var matrix = nurikabe.create_solution_matrix()
        for (var i = 0; i < matrix.length; i++) {
            for (var j = 0; j < matrix[0].length; j++) {
                if (matrix[i][j] == solution_states.unknown) {
                    nurikabe.sea.add_point(new Point(i, j))
                    change = true
                }
            }
        }
    }

    return change
}

/*
All white cells must eventually be part of exactly one island. If there is a white region that does not contain a number,
and there is only one possible way for it to connect to a numbered white region, the sole connecting pathway must be white.
*/

function connect_island_parts(nurikabe) {
    // island may have assigned points that are not connected yet.
    // From those points, find possible paths to the origin (over unknown or this islands points).
    var change = false
    var matrix = nurikabe.create_solution_matrix()

    nurikabe.islands.forEach(island => {
        if (change) return // if an island was updated, stop searching beacouse island areas have changed

        // does this island have unconnected regions?
        var areas = get_continious_areas(island.area, matrix)
        if (areas.length > 1) {
            // theres more that 1 area
            var origin_area = areas[0]  // first area must be the origins area
            var other_areas = areas.slice(1)
            other_areas.forEach(other_area => {
                if (change) return // if island was updated, stop searching beacouse island areas have changed

                var viable_paths = new Array()
                // for each pair of points (one from the origin_area and one form this area)
                origin_area.forEach(origin_p => {
                    other_area.forEach(other_p => {
                        // find ALL the shortest paths
                        var path = bfs(matrix, origin_p, other_p, successors_unknown)  // tu poišči vse poti najkrajše dolžine (ker je lahko več isto dolgih poti, in je seveda samo ena pravilna - aka ne vemo kera če jih je več)
                        // there is only 1 path
                        // if PATH.len - 2 <= ISLAND.SIZE - ORIGIN_AREA.size - THIS_AREA.size (-2 cause path includes the origin and endpoint)
                        if (path != null && path.length - 2 <= island.size - origin_area.length - other_area.length) {
                            var path_len = path.length
                            // find all possible paths with this shortest len
                            var all_paths = dfs_all_paths(matrix, origin_p, other_p, successors_unknown, path_len)
                            if (all_paths.length == 1) {
                                // this path is viable -> add it to array
                                viable_paths.push(path)
                            }
                        }
                    })
                })
                // if only 1 viable path is found. The whole path is added to this island
                if (viable_paths.length == 1) {
                    // the whole path but the origin and endpoint, cause those are allready part of the island
                    viable_paths[0].slice(1, -1).forEach(p => {
                        island.add_point(p)
                        change = true
                        // if island was updated, stop searching beacouse island areas have changed
                    })
                }
            })
        }
    })

    return change
}