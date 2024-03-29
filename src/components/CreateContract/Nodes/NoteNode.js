import React, {useCallback} from 'react';
import {Handle, Position, NodeToolbar} from 'reactflow';
import './nodes.css';

/**
 * NoteNode provides a simple interface for adding annotations or notes within a React Flow diagram.
 * It features a textarea for inputting text, supporting dynamic updates to the flow.
 *
 * @param {string} id - The unique identifier of the node.
 * @param {Object} data - Contains the note text entered by the user.
 * @param {boolean} isConnectable - Indicates if the node's handles can be connected.
 * @param {Function} setNodes - Function to update the nodes in the flow diagram.
 * @returns {JSX.Element} The rendered NoteNode component for user annotations.
 */
function NoteNodes({id, data, isConnectable, setNodes}) {
    const onChange = useCallback((evt) => {
        const fieldName = evt.target.name;
        const value = evt.target.value;
        setNodes((nds) =>
            nds.map((node) =>
                node.id === id ? {...node, data: {...node.data, [fieldName]: value}} : node
            )
        );
    }, [id, setNodes]);

    const handleDelete = useCallback(() => {
        setNodes((nds) => nds.filter((node) => node.id !== id));
    }, [id, setNodes]);

    return (
        <div className="note-node">
            <NodeToolbar isVisible={data.toolbarVisible} position={data.toolbarPosition}>
                <button onClick={handleDelete}>delete</button>
            </NodeToolbar>
            <Handle type="target" position={Position.Top} isConnectable={isConnectable}/>
            <div>
                <div><strong>Note:</strong></div>
                <textarea
                    id={`Note-${id}`}
                    name="note"
                    defaultValue={data.note || ''}
                    onChange={onChange}
                    className="nodrag"
                />
            </div>
            <Handle type="source" position={Position.Bottom} id="b" isConnectable={isConnectable}/>
        </div>
    );
}

export default NoteNodes;
