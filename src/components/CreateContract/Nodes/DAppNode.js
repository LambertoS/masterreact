import React, {useCallback} from 'react';
import {Handle, Position, NodeToolbar} from 'reactflow';
import './nodes.css';

/**
 * Represents a DAppNode in a React Flow diagram, allowing users to specify a dApp by its address.
 * The dApp address is input by the user and reflected within the node in the flow diagram.
 *
 * @param {string} id - The unique identifier for the node.
 * @param {Object} data - The data object containing the node's dApp address and other data.
 * @param {boolean} isConnectable - Indicates if the node can be connected to other nodes.
 * @param {Function} setNodes - The function to update the nodes in the flow.
 * @returns {JSX.Element} The DAppNode component.
 */
function DAppNode({id, data, isConnectable, setNodes}) {
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
        <div className="dapp-node">
            <NodeToolbar isVisible={data.toolbarVisible} position={data.toolbarPosition}>
                <button onClick={handleDelete}>delete</button>
            </NodeToolbar>
            <Handle type="target" position={Position.Top} isConnectable={isConnectable}/>
            <div>
                <div><strong>dApp</strong></div>
                {/* <div>Address: {data.address}</div> */}
                <label htmlFor={`address-${id}`}>Address:</label>
                <input
                    id={`address-${id}`}
                    name="address"
                    defaultValue={data.address || ''}
                    onChange={onChange}
                    className="nodrag"
                />
            </div>
            <Handle type="source" position={Position.Bottom} id="b" isConnectable={isConnectable}/>
        </div>
    );
}

export default DAppNode;
