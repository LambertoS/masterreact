import Dagre from "@dagrejs/dagre";

const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

/**
 * Arranges nodes and edges of a graph in a specified layout using the Dagre library.
 * @param {Array} nodes - The nodes to layout.
 * @param {Array} edges - The edges connecting the nodes.
 * @param {Object} options - Layout options, including direction.
 * @returns {Object} An object containing layouted nodes and edges.
 */
export const getLayoutedElements = (nodes, edges, options) => {
    g.setGraph({ rankdir: options.direction });

    edges.forEach((edge) => g.setEdge(edge.source, edge.target));
    nodes.forEach((node) => g.setNode(node.id, node));

    Dagre.layout(g);

    return {
        nodes: nodes.map((node) => {
            const { x, y } = g.node(node.id);

            return { ...node, position: { x, y } };
        }),
        edges,
    };
};