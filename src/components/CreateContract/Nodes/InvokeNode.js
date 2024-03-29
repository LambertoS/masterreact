import React, {useCallback} from 'react';
import {Handle, Position, NodeToolbar} from 'reactflow';
import './nodes.css';

/**
 * Represents an InvokeNode within a React Flow diagram, facilitating the invocation of a specified blockchain function.
 * It allows users to define the address of the blockchain function, the function name, and the parameters for invocation.
 * This node type is essential for simulating or planning the invocation of blockchain functions within the diagram.
 *
 * @param {string} id - The unique identifier for the node.
 * @param {Object} data - The data object containing the invocation details (address, functionName, parameters).
 * @param {boolean} isConnectable - Indicates if the node's handles can be connected to other nodes.
 * @param {Function} setNodes - The function to update the nodes in the flow diagram.
 * @returns {JSX.Element} The rendered InvokeNode component.
 */
function InvokeNode({id, data, isConnectable, setNodes}) {
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
        <div className="invoke-node">
            <NodeToolbar isVisible={data.toolbarVisible} position={data.toolbarPosition}>
                <button onClick={handleDelete}>delete</button>
            </NodeToolbar>
            <Handle type="target" position={Position.Top} isConnectable={isConnectable}/>
            <div>
                <div><strong>Invoke</strong></div>
                {/* <div>Address: {data.address}</div>
                <div>Function Name: {data.functionName}</div>
                <div>Parameters: {data.invokeParameters}</div> */}
                <label htmlFor={`address-${id}`}>Address:</label>
                <input
                    id={`address-${id}`}
                    name="address"
                    defaultValue={data.address || ''}
                    onChange={onChange}
                    className="nodrag"
                />
                <label htmlFor={`functionName-${id}`}>FunctionName:</label>
                <input
                    id={`functionName-${id}`}
                    name="functionName"
                    defaultValue={data.functionName || ''}
                    onChange={onChange}
                    className="nodrag"
                />
                <label htmlFor={`invoke-${id}`}>Parameters:</label>
                <input
                    id={`invoke-${id}`}
                    name="invoke"
                    defaultValue={data.invokeParameters || ''}
                    onChange={onChange}
                    className="nodrag"
                />
            </div>
            <Handle type="source" position={Position.Bottom} id="b" isConnectable={isConnectable}/>
        </div>
    );
}

export default InvokeNode;
