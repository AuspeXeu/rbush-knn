'use strict';

var Queue = require('tinyqueue');

module.exports = knn;

function knn(tree, queryPoint, n, predicate) {
    var node = tree.data,
        result = [],
        toBBox = tree.toBBox,
        i, child;

    var queue = new Queue(null, compareDist);

    while (node) {
        for (i = 0; i < node.children.length; i++) {
            child = node.children[i];
            queue.push({
                node: child,
                isItem: node.leaf,
                dist: boxDist(queryPoint, node.leaf ? toBBox(child) : child.bbox)
            });
        }

        while (queue.length && queue.peek().isItem) {
            var candidate = queue.pop().node;
            if (!predicate || predicate(candidate))
                result.push(candidate);
            if (n && result.length === n) return result;
        }

        node = queue.pop();
        if (node) node = node.node;
    }

    return result;
}

function compareDist(a, b) {
    return a.dist - b.dist;
}

function boxDist(p, box) {
    var dx = axisDist(p[0], box[0], box[2]),
        dy = axisDist(p[1], box[1], box[3]);
    return dx * dx + dy * dy;
}

function axisDist(k, min, max) {
    return k < min ? min - k :
           k <= max ? 0 :
           k - max;
}
