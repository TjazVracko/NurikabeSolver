class Tree {
    constructor(nurikabe) {
        this.root = new Node(nurikabe, null);
    }
}

const NodeStates = {
    "inactive": 0,  // before solving here
    "active": 1,    // during solving
    "done": 2,      // solving exhausted, moved on to child nodes
    "discarded": 3  // not a viable path
}

class Node {
    constructor(nurikabe, parent) {
        this.nurikabe = nurikabe;  // this nodes nurikabe object
        this.parent = parent;
        this.children = new Array();  // holds all child nodes
        this.state = NodeStates.inactive
    }

    add_child(nurikabe_with_guess) {
        var n = new Node(nurikabe_with_guess, this)
        this.children.push(n)
        return n
    }
}