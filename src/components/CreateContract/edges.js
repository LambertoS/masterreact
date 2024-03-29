import {
    BaseEdge,
    EdgeLabelRenderer,
    getStraightPath,
    useReactFlow,
} from 'reactflow';

/**
 * Custom edge component for React Flow that includes a "delete" button.
 *
 * @param {Object} props - Properties passed to the component, including coordinates and edge ID.
 */
export default function CustomEdge({id, sourceX, sourceY, targetX, targetY}) {
    const {setEdges} = useReactFlow();
    const [edgePath, labelX, labelY] = getStraightPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
    });

    return (
        <>
            <BaseEdge id={id} path={edgePath}/>
            <EdgeLabelRenderer>
                <button
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        pointerEvents: 'all',
                    }}
                    className="nodrag nopan"
                    onClick={() => {
                        setEdges((es) => es.filter((e) => e.id !== id));
                    }}
                >
                    delete
                </button>
            </EdgeLabelRenderer>
        </>
    );
}
