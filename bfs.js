
// --------------------------- BFS implementation:
// from https://stackoverflow.com/questions/55239386/finding-shortest-path-in-two-dimensional-array-javascript


const buildPath = (traversalTree, to) => {
    let path = [to]
    let parent = traversalTree[JSON.stringify(to)]
    while (parent) {
        path.push(parent)
        parent = traversalTree[JSON.stringify(parent)]
    }
    return path.reverse()
}

const bfs = (matrix, from, to, successors_function) => {
    let traversalTree = []
    let visited = new Sea()
    let queue = []
    queue.push(from)
    visited.add_point(from)

    while (queue.length) {
        let subtreeRoot = queue.shift()


        if (subtreeRoot.compare(to)) {
            return buildPath(traversalTree, to)
        }

        for (child of successors_function(subtreeRoot, matrix, to)) {
            // for (child of subtreeRoot.neighbours(matrix)) {
            if (!visited.is_in(child)) {
                traversalTree[JSON.stringify(child)] = subtreeRoot
                queue.push(child)
                visited.add_point(child)
            }
        }
    }
    return null // if no path exists
}

// ---------- dfs with all paths:
/*
DFS(source,target,visited,path):
   if (source == target): //stop clause
       print path
       return
   for each son v of source:
      if v is in visited: //the vertex is already in the current path
           continue
      path.append(v)
      visited.add(v)
      DFS(v,target,visited,path)
      visited.remove(v)
      path.deleteLast()
*/
function dfs_all_paths(matrix, from, to, successors_function, max_length) {
    var all_paths = new Array()
    var visited = new Sea()
    var path = new Array()

    dfs_all_paths_util(matrix, from, to, successors_function, all_paths, path, visited, max_length)

    return all_paths
}

function dfs_all_paths_util(matrix, from, to, successors_function, all_paths, path, visited, max_length) {
    if (from.compare(to)) {
        path.unshift(from)
        all_paths.push(_.cloneDeep(path))  // save path
        return
    }
    if (path.length >= max_length) {
        return
    }

    for (n of successors_function(from, matrix, to)) {
        if (visited.is_in(n)) {
            continue
        }
        path.push(n)
        visited.add_point(n)
        console.log("recurring")
        dfs_all_paths_util(matrix, n, to, successors_function, all_paths, path, visited, max_length)
        visited.area.splice(visited.area.indexOf(n), 1)
        path.pop()
    }
}


// succsessor functions:

let successors_unknown = (root, m, to) => {
    // only neighbours that are unknown (not sea or island)
    let connectedCells = root.neighbours(m)

    // valid next cells are unknown neghibours or the cell we are trying to reach
    const successors = connectedCells.filter(
        (cell) => (m[cell.x][cell.y] == solution_states.unknown || cell.compare(to))
    )

    return successors
}



let successors_unknown_or_of_island = (root, m, to) => {
    // only neighbours that are unknown (not sea or island)
    let connectedCells = root.neighbours(m)

    // valid next cells are unknown neighbours or the cell we are trying to reach, or points from selected island
    const successors = connectedCells.filter(
        (cell) => (m[cell.x][cell.y] == solution_states.unknown || m[cell.x][cell.y] == solution_states.island || cell.compare(to))
    )

    return successors
}
