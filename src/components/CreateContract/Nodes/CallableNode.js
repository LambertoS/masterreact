// import { memo } from 'react';
import { Handle, Position, NodeToolbar } from 'reactflow';
import { useCallback } from 'react';
import './nodes.css'


function CallableNode({ id, data, isConnectable, setNodes }) {
    const onChange = useCallback((evt) => {
        const fieldName = evt.target.name;
        const value = evt.target.value;
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
                <label >CallableNode</label>
                <label htmlFor={`address-${id}`}>address:</label>
                <input
                    id={`address-${id}`}
                    name="address"
                    defaultValue={data.address || ''}
                    onChange={onChange}
                    className="nodrag"
                />
                <label htmlFor={`callable-${id}`}>@callable:</label>
                <input
                    id={`callable-${id}`}
                    name="callable"
                    defaultValue={data.callable || ''}
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
            </div>
            <Handle
                type="source"
                position={Position.Bottom}
                id="a"
                isConnectable={isConnectable}
            />
        </div>
    );
}

export default CallableNode;



