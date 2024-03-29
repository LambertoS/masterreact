import React, {useCallback} from 'react';
import {Handle, Position, NodeToolbar} from 'reactflow';
import './nodes.css';

/**
 * Represents a CallableNode in a React Flow diagram, allowing users to define callable functions.
 * Users can input a function name and parameters, which are then reflected in the flow diagram.
 *
 * @param {string} id - The unique identifier for the node.
 * @param {Object} data - The data object containing the node's data.
 * @param {boolean} isConnectable - Indicates if the node can be connected to other nodes.
 * @param {Function} setNodes - The function to update the nodes in the flow.
 * @returns {JSX.Element} The CallableNode component.
 */
function CallableNode({id, data, isConnectable, setNodes}) {
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
        <div className="callable-node">
            <NodeToolbar isVisible={data.toolbarVisible} position={data.toolbarPosition}>
                <button onClick={handleDelete}>delete</button>
            </NodeToolbar>
            <Handle type="target" position={Position.Top} isConnectable={isConnectable}/>
            <div>
                <div><strong>@callable</strong></div>
                {/* <div>Function Name: {data.functionName}</div>
                <div>Parameters: {data.parameters}</div> */}
                <label htmlFor={`functionName-${id}`}>FunctionName:</label>
                <input
                    id={`functionName-${id}`}
                    name="functionName"
                    defaultValue={data.functionName || ''}
                    onChange={onChange}
                    className="nodrag"
                />
                <label htmlFor={`parameters-${id}`}>Parameters:</label>
                <input
                    id={`parameters-${id}`}
                    name="parameters"
                    defaultValue={data.parameters || ''}
                    onChange={onChange}
                    className="nodrag"
                />
            </div>
            <Handle type="source" position={Position.Bottom} id="b" isConnectable={isConnectable}/>
        </div>
    );
}

export default CallableNode;
