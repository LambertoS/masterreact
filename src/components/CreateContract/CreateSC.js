


function createContract(data) {
    const { nodes, edges } = data;

    let functionScopeStack = [];
    let indentStack = [];

    // Custom sort order for sourceHandle
    const sortOrder = ['l', 'r', 't', 'b'];
    // Fixed beginning and ending of the contract string
    const beginning =
        `
{-# STDLIB_VERSION 5 #-}
{-# CONTENT_TYPE DAPP #-}
{-# SCRIPT_TYPE ACCOUNT #-}

func getData (adr: Address, key: String) = {
    let data = match getString(adr, key) {
        case a: String =>
            a
        case _ =>
            ""
    }
    data
}
`;
    const ending =
        `
@Verifier(tx)
func verify() = sigVerify(tx.bodyBytes, tx.proofs[0], tx.senderPublicKey)
`;

    // Find the start node
    const startNode = nodes.find(node => node.type === "start");
    if (!startNode) {
        throw new Error("Start node not found.");
    }

    let contractString = beginning;
    const visitedNodes = new Set();


    function downloadContract(contractString, filename) {
        // Create a blob from the contract string
        const blob = new Blob([contractString], { type: 'text/plain' });

        // Create a URL for the blob
        const url = window.URL.createObjectURL(blob);

        // Create an anchor element and set its href to the blob URL
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || 'contract.ride';

        // Append the anchor to the document, trigger the download, then remove the anchor
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Release the blob URL to free up resources
        window.URL.revokeObjectURL(url);
    }

    function getNodeString(node, indent, hasLeftConnections = false, extraInfo = '') {
        const indentation = ' '.repeat(indent); // Create an indentation string
        switch (node.type) {
            case 'start':
                return ``;
            //         case 'function':
            //             if (node.data.callable) {
            //                 return `${indentation}@Callable(i)
            // ${indentation}func ${node.data.function}(${node.data.parameters})\n`;
            //             } else {
            //                 return `${indentation}func ${node.data.function}(${node.data.parameters})\n`;
            //             }
            case 'function':
                // Adjust the function string based on callable and left connections
                const functionPrefix = node.data.callable ? `${indentation}@Callable(i)\n    ` : `${indentation}`;
                const functionDeclaration = `func ${node.data.function}(${node.data.parameters})`;
                const functionDeclarationNoConnection = `${node.data.function}(${node.data.parameters})`;
                // If there are left connections, add "=" on the same line
                return hasLeftConnections ? `${functionPrefix}${functionDeclaration} =\n` : `${functionPrefix}${functionDeclarationNoConnection}\n`;
            case 'token':
                return `${indentation}ScriptTransfer(${node.data.tokenAddress}, ${node.data.amount}, ${node.data.token})\n`;
            case 'logic':
                return `${indentation}Logic Node: ${node.data.label}, performs logical operations\n`;
            case 'value':
                return `${indentation}${node.data.value}\n`;
            case 'string':
                return `${indentation}StringEntry(${node.data.key}, ${node.data.value})\n`;
            case 'error':
                return `${indentation}${node.data.message}\n`;
            // case 'key':
            //     if (node.data.strict) {
            //         return `${indentation}strict ${node.data.key}\n`;
            //     } else {
            //         return `${indentation}let ${node.data.key}\n`;
            //     }
            case 'key':
                // Format the key declaration with possible extra information from 'l' connection
                console.log("test: " + node.data.strict)
                let keyLine = `${indentation}${node.data.strict ? 'strict ' : 'let '}${node.data.key}`;
                
                if (extraInfo) {
                    keyLine += ` = ${extraInfo}`;
                }
                return keyLine + "\n";
            case 'note':
                return `${indentation}${node.data.label}\n`;
            default:
                return `${indentation}Unknown Node: ${node.data.label}, of type ${node.type}\n`;
        }
    }



    // function traverse(node, indent = 0) {
    //     if (visitedNodes.has(node.id)) return;
    //     visitedNodes.add(node.id);

    //     const isFunctionNode = node.type === 'function';
    //     // Check for any 'l' connections for the current function node
    //     const hasLeftConnections = edges.some(edge => edge.source === node.id && edge.sourceHandle === 'l');

    //     if (isFunctionNode) {
    //         functionScopeStack.push(node.id);
    //         indentStack.push(indent); // Save current indent level
    //         if (hasLeftConnections) {
    //             // Only add braces if there are 'l' connections
    //             contractString += getNodeString(node, indent) + "{\n";
    //         } else {
    //             // Adjust to add function signature without braces
    //             contractString += getNodeString(node, indent);
    //         }
    //     } else {
    //         contractString += getNodeString(node, indent);
    //     }

    //     const nextIndent = indent + (isFunctionNode && hasLeftConnections ? 4 : 0);


    //     // Sort outgoing edges based on custom sort order
    //     const outgoingEdges = edges
    //         .filter(edge => edge.source === node.id)
    //         .sort((a, b) => sortOrder.indexOf(a.sourceHandle) - sortOrder.indexOf(b.sourceHandle));

    //     outgoingEdges.forEach(edge => {
    //         const nextNode = nodes.find(n => n.id === edge.target);
    //         if (nextNode) traverse(nextNode, nextIndent);
    //     });


    //     if (isFunctionNode && functionScopeStack.length && functionScopeStack[functionScopeStack.length - 1] === node.id) {
    //         if (hasLeftConnections) {
    //             // Only add closing brace if there were 'l' connections
    //             contractString += `${' '.repeat(indent)}}\n`;
    //         }
    //         functionScopeStack.pop();
    //         indent = indentStack.pop() || 0; // Reset indent to previous level
    //     }
    // }
    function traverse(node, indent = 0) {
        if (visitedNodes.has(node.id)) return;
        visitedNodes.add(node.id);
        const isFunctionNode = node.type === 'function';
        let extraInfo = ''; // Used for storing additional information for specific node connections
    
        // Determine if the current node has 'l' connections, primarily used for function nodes
        const hasLeftConnections = edges.some(edge => edge.source === node.id && edge.sourceHandle === 'l');
    
        // Special handling for key nodes to include connected node information
        if (node.type === 'key') {
            const lConnection = edges.find(edge => edge.source === node.id && edge.sourceHandle === 'l');
            if (lConnection) {
                const connectedNode = nodes.find(n => n.id === lConnection.target);
                if (connectedNode) {
                    // Fetching the string representation of the connected node for 'key' nodes with 'l' connections
                    extraInfo = getConnectedNodeString(connectedNode, 0); // Assuming this function returns the connected node's string representation
                    contractString += `${' '.repeat(indent)}${node.data.strict ? 'strict ' : ''}${node.data.key} = ${extraInfo}\n`;
                }
            } else {
                // If no 'l' connection, append the key node as usual
                contractString += `${' '.repeat(indent)}${node.data.strict ? 'strict ' : ''}${node.data.key}\n`;
            }
        } else if (node.type === 'function') {
            // Handling for function nodes
            functionScopeStack.push(node.id);
            indentStack.push(indent); // Save current indent level
            contractString += getNodeString(node, indent, hasLeftConnections, extraInfo);
            if (hasLeftConnections) {
                // Add opening brace if there are 'l' connections for function nodes
                contractString += "{\n";
            }
        } else {
            // For all other node types
            contractString += getNodeString(node, indent, hasLeftConnections, extraInfo);
        }
    
        const nextIndent = indent + (isFunctionNode && hasLeftConnections ? 4 : 0);
    
        // Process outgoing edges based on custom sort order
        const outgoingEdges = edges
            .filter(edge => edge.source === node.id)
            .sort((a, b) => sortOrder.indexOf(a.sourceHandle) - sortOrder.indexOf(b.sourceHandle));
    
        outgoingEdges.forEach(edge => {
            const nextNode = nodes.find(n => n.id === edge.target);
            if (nextNode) traverse(nextNode, nextIndent);
        });
    
        if (node.type === 'function' && functionScopeStack.length && functionScopeStack[functionScopeStack.length - 1] === node.id) {
            if (hasLeftConnections) {
                // Only add closing brace if there were 'l' connections for function nodes
                contractString += `${' '.repeat(indent)}}\n`;
            }
            functionScopeStack.pop();
            indent = indentStack.pop() || 0; // Reset indent to previous level after exiting a function scope
        }
    }
    

    function getConnectedNodeString(node, indent) {
        // Assuming this function is designed to return a string representation of the connected node
        // The implementation here might depend on the node's type and data
        // For simplicity, let's assume a basic formatting:
        if (!node) return '';
        switch (node.type) {
            case 'value':
                return `${node.data.value}`;
            case 'string':
                return `"${node.data.value}"`;
            // Add more cases as needed for different node types
            default:
                return '';
        }
    }

    traverse(startNode, 0);
    contractString += ending;

    downloadContract(contractString, 'my_smart_contract.ride');
    // Return the constructed string wrapped in a Promise to simulate async operation
    return Promise.resolve(contractString);
}
export default createContract;