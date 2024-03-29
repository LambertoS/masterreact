import React, {useCallback} from 'react';
import {Handle, Position, NodeToolbar} from 'reactflow';
import './nodes.css';

/**
 * SendTokenNode facilitates the configuration of token transfer operations within a React Flow diagram.
 * Users can specify the receiver's address, the amount, and the token to be transferred.
 *
 * @param {string} id - The unique identifier of the node.
 * @param {Object} data - Contains data for token transfer, including recipient address, amount, and token type.
 * @param {boolean} isConnectable - Indicates if the node's handles can be connected.
 * @param {Function} setNodes - Function to update the nodes in the flow diagram.
 * @returns {JSX.Element} The SendTokenNode component for configuring token transfers.
 */
function SendTokenNode({id, data, isConnectable, setNodes}) {
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
        <div className="token-send-node">
            <NodeToolbar isVisible={data.toolbarVisible} position={data.toolbarPosition}>
                <button onClick={handleDelete}>delete</button>
            </NodeToolbar>
            <Handle type="target" position={Position.Top} isConnectable={isConnectable}/>
            <div>
                <label>TokenNode</label>
                <label htmlFor={`tokenAddress-${id}`}>Reciever:</label>
                <input
                    id={`tokenAddress-${id}`}
                    name="tokenAddress"
                    defaultValue={data.tokenAddress || ''}
                    onChange={onChange}
                    className="nodrag"
                />
                <label htmlFor={`amount-${id}`}>Amount:</label>
                <input
                    id={`amount-${id}`}
                    name="amount"
                    defaultValue={data.amount || ''}
                    onChange={onChange}
                    className="nodrag"
                />
                <label htmlFor={`token-${id}`}>Token:</label>
                <input
                    id={`token-${id}`}
                    name="token"
                    defaultValue={data.token || ''}
                    onChange={onChange}
                    className="nodrag"
                />
            </div>
            <Handle
                type="source"
                position={Position.Bottom}
                id="b"
                isConnectable={isConnectable}
            />
        </div>
    );
}

export default SendTokenNode;
