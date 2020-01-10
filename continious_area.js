
// -------------- CONTINIOUS AREA ALGORITHM

// THIS IS FOR CHECKING

function are_points_continious_area(points, solution_matrix) {
    // set points in matrix to some number
    var matrix = _.cloneDeep(solution_matrix)
    points.forEach(p => {
        matrix[p.x][p.y] = 1337
    })
    // check if area is continious
    return is_continious_area(1337, matrix)
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


// THIS IS FOR GETTING THE AREAS

function get_continious_areas(points, solution_matrix) {
    var elem = 1337
    // set points in matrix to some number
    var matrix = _.cloneDeep(solution_matrix)
    points.forEach(p => {
        matrix[p.x][p.y] = elem
    })

    // find each area
    var areas = new Array()
    var starting_point = points[0]  // we start in the islands origin
    while (starting_point != null) {
        var area = new Array()
        walk_the_matrix_add(starting_point, elem, matrix, area)
        areas.push(area)

        starting_point = find_an_elem(elem, matrix)
    }
    return areas
}

function walk_the_matrix_add(point, elem, matrix, arr) {
    // Clear current point and move to adjacent cells that are "elem"
    // check if this is a valid cell to work on:
    if (matrix[point.x][point.y] != elem) {
        return // nothing to do here, terminate this recursion branch
    }

    // clear this cell:
    matrix[point.x][point.y] = -1
    arr.push(point)
    // recurse to all neighbours:
    var neigh = point.neighbours(matrix)
    neigh.forEach(n => {
        walk_the_matrix_add(n, elem, matrix, arr)
    })

}

// get all area neighbours:
function area_neighbours(island, area, matrix) {
    // return all adjecent points of this are
    var adj = new Array;
    area.forEach(ip => {
        var ipns = ip.neighbours(matrix)
        // if point is not of this island, it is a neighbour:
        ipns.forEach(ipn => {
            if (!island.is_in(ipn)) {
                adj.push(ipn)
            }
        })

    });
    // filter same points
    var adj = uniqBy(adj, JSON.stringify)
    return adj
}