import { Handle, Position, NodeToolbar } from 'reactflow';
import { useCallback } from 'react';
import './nodes.css'

/**
 * A FunctionNode within a React Flow diagram, designed for defining and editing blockchain functions.
 * It supports specifying the function name, address, parameters, and whether the function is callable or can be invoked.
 * Users can dynamically adjust these properties directly within the node.
 *
 * @param {string} id - The unique identifier for the node.
 * @param {Object} data - The data object containing the function's details (name, address, parameters, callable, invoke).
 * @param {boolean} isConnectable - Indicates if the node's handles can be connected to other nodes.
 * @param {Function} setNodes - The function to update the nodes in the flow diagram.
 * @returns {JSX.Element} The rendered FunctionNode component.
 */
function FunctionNode({ id, data, isConnectable, setNodes }) {
    const onChange = useCallback((evt) => {
        const fieldName = evt.target.name;
        // const value = evt.target.value;
        const value = evt.target.type === 'checkbox' ? evt.target.checked : evt.target.value;
        // Update node data
        setNodes((nds) =>
            nds.map((node) =>
                node.id === id ? { ...node, data: { ...node.data, [fieldName]: value } } : node
            )
        );
    }, [id, setNodes]);

    const handleDelete = useCallback(() => {
        setNodes((nds) => nds.filter((node) => node.id !== id));
    }, [id, setNodes]);


    return (
        <div className="text-updater-node">
            <NodeToolbar isVisible={data.toolbarVisible} position={data.toolbarPosition}>
                <button onClick={handleDelete}>delete</button>
            </NodeToolbar>
            <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
            <div>
                <label >FunctionNode</label>

                <label htmlFor={`function-${id}`}>functionName:</label>
                <input
                    list={`function-options-${id}`}
                    id={`function-${id}`}
                    name="function"
                    defaultValue={data.function || ''}
                    onChange={onChange}
                    className="nodrag"
                />
                <datalist id={`function-options-${id}`}>
                    <option value="abc" />
                    <option value="def" />
                    <option value="ghi" />
                </datalist>

                <label htmlFor={`address-${id}`}>address:</label>
                <input
                    id={`address-${id}`}
                    name="address"
                    defaultValue={data.address || ''}
                    onChange={onChange}
                    className="nodrag"
                />


                <label htmlFor={`parameters-${id}`}>parameters:</label>
                <input
                    id={`parameters-${id}`}
                    name="parameters"
                    defaultValue={data.parameters || ''}
                    onChange={onChange}
                    className="nodrag"
                />

                <div style={{display: "flex"}}>
                    <label htmlFor={`callable-${id}`}>callable:</label>
                    <input
                        id={`callable-${id}`}
                        type="checkbox"
                        name="callable"
                        checked={data.callable || false}
                        onChange={onChange}
                        className="nodrag"
                    />

                    <label htmlFor={`invoke-${id}`}>invoke:</label>
                    <input
                        id={`invoke-${id}`}
                        type="checkbox"
                        name="invoke"
                        checked={data.invoke || false}
                        onChange={onChange}
                        className="nodrag"
                    />
                </div>
            </div>
            <Handle
                type="source"
                position={Position.Bottom}
                id="b"
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

export default FunctionNode;



