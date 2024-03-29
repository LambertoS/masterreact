import React, {useCallback} from 'react';
import {Handle, Position, NodeToolbar} from 'reactflow';
import './nodes.css';

/**
 * LogicNode represents a logic operation in a React Flow diagram, such as AND, OR, EQUALS, etc.
 * It allows the user to select an operator from a dropdown menu and dynamically updates the diagram.
 *
 * @param {string} id - The unique identifier of the node.
 * @param {Object} data - Contains the logic condition selected by the user.
 * @param {boolean} isConnectable - Indicates if the node's handles can be connected.
 * @param {Function} setNodes - Function to update the nodes in the flow diagram.
 * @returns {JSX.Element} The LogicNode component, allowing for logical operations within the flow.
 */
function LogicNode({id, data, isConnectable, setNodes}) {
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

    const handleStyleTrue = {right: 10};
    const handleStyleFalse = {left: 10};

    return (
        <div className="logic-node">
            <NodeToolbar isVisible={data.toolbarVisible} position={data.toolbarPosition}>
                <button onClick={handleDelete}>delete</button>
            </NodeToolbar>
            <Handle type="target" position={Position.Top} isConnectable={isConnectable}/>
            <div>
                <label>LogicalNode</label>
                <label htmlFor={`condition-${id}`}>Operator:</label>
                <select
                    id={`condition-${id}`}
                    name="condition"
                    defaultValue={data.condition || ''}
                    onChange={onChange}
                    className="nodrag"
                >
                    <option value="EQUALS">EQUALS</option>
                    <option value="AND">AND</option>
                    <option value="OR">OR</option>
                    <option value="NOTEQUAL">NOTEQUAL</option>
                </select>
                <label>false true</label>
            </div>
            <Handle
                type="source"
                position={Position.Bottom}
                style={handleStyleFalse}
                id="f"
                isConnectable={isConnectable}
            />
            <Handle
                type="source"
                position={Position.Bottom}
                style={handleStyleTrue}
                id="t"
                isConnectable={isConnectable}
            />
            <Handle
                type="source"
                position={Position.Left}
                id="l"
                isConnectable={isConnectable}
            />
        </div>
    );
}

export default LogicNode;
