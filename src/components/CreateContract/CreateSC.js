export function downloadContract(contractString, filename) {
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

function getStartAndEndString () {
    const beginning =`{-# STDLIB_VERSION 6 #-}\n{-# CONTENT_TYPE DAPP #-}\n{-# SCRIPT_TYPE ACCOUNT #-}
        
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
    const ending = `@Verifier(tx)
func verify() = sigVerify(tx.bodyBytes, tx.proofs[0], tx.senderPublicKey)`;

    return {beginning, ending}
}

function getNodeString(node, indent, hasLeftConnections = false, extraInfo = '') {
    const indentation = ' '.repeat(indent); // Create an indentation string
    switch (node.type) {
        case 'start':
            return ``;
        case 'function':
            if (node.data.invoke) {
                return `invoke(${node.data.address}, "${node.data.function}", [${node.data.parameters}], [])\n`
            } else {
                // Adjust the function string based on callable and left connections
                const functionPrefix = node.data.callable ? `${indentation}@Callable(i)\n` : `${indentation}`;
                const functionDeclaration = `func ${node.data.function}(${node.data.parameters})`;
                const functionDeclarationNoConnection = `${node.data.function}(${node.data.parameters})`;
                // If there are left connections, add "=" on the same line
                return hasLeftConnections ? `${functionPrefix}${functionDeclaration} =\n` : `${functionPrefix}${functionDeclarationNoConnection}\n`;
            }
        case 'token':
            return `${indentation}[ScriptTransfer(${node.data.tokenAddress}, ${node.data.amount}, ${node.data.token})]\n`;
        case 'logic':
            return `${indentation}Logic Node: ${node.data.label}, performs logical operations\n`;
        case 'value':
            return `${indentation}${node.data.value}\n`;
        case 'string':
            return `${indentation}[StringEntry(${node.data.key}, ${node.data.value})]\n`;
        case 'error':
            return `${indentation}throw("${node.data.message}")\n`;
        case 'key':
            // Format the key declaration with possible extra information from 'l' connection
            let keyLine = `${indentation}${node.data.strict ? 'strict ' : 'let '}${node.data.key}`;

            if (extraInfo) {
                keyLine += ` = ${extraInfo}`;
            }
            return keyLine + "\n";
        case 'note':
            return `${indentation}# ${node.data.note}\n`;
        default:
            return `${indentation}Unknown Node: ${node.data.label}, of type ${node.type}\n`;
    }
}

function getConnectedNodeString(node, indent) {
    // Assuming this function is designed to return a string representation of the connected node
    // The implementation here might depend on the node's type and data
    // For simplicity, let's assume a basic formatting:
    if (!node) return '';
    switch (node.type) {
        case 'function':
            if (node.data.invoke) {
                return `invoke(${node.data.address}, "${node.data.function}", [${node.data.parameters}], [])`
            } else {
                // Return the function call, adjust as needed for your implementation
                return `${node.data.function}(${node.data.parameters})`;
            }
        case 'value':
            return `${node.data.value}`;
        case 'string':
            return `"${node.data.value}"`;
        // Add more cases as needed for different node types
        default:
            return '';
    }
}

function createContract(data) {
    const { nodes, edges } = data;
    const sortOrder = ['l', 't', 'f', 'b'];
    const {beginning, ending} = getStartAndEndString()

    const cleanedEdges = edges.filter(edge => {
        // Check if both source and target nodes exist
        const sourceExists = nodes.some(node => node.id === edge.source);
        const targetExists = nodes.some(node => node.id === edge.target);
        return sourceExists && targetExists;
    });

    // Find the start node
    const startNode = nodes.find(node => node.type === "start");
    if (!startNode) throw new Error("Start node not found.");

    let contractString = beginning;
    let bottomTraversalNodes = [];
    const visited = new Set()

    function traverseStartNodeBottom(node) {
        // Ignore the start node
        if (node.type !== "start") {
            bottomTraversalNodes.push(node);
        }

        // Find the next node connected to the current node's 'bottom' handle
        const bottomEdge = edges.find(edge => edge.source === node.id && edge.sourceHandle === 'b');
        if (bottomEdge) {
            const nextNode = nodes.find(n => n.id === bottomEdge.target);
            if (nextNode) {
                traverseStartNodeBottom(nextNode); // Recursively visit the next node
            }
        }
    }

    function generalTraverseNodeFromLeft(node, indent = 4) {
        if (visited.has(node.id)) return; // Prevent infinite loops
        visited.add(node.id); // Mark as visited

        // Special handling for key nodes to include connected node information
        if (node.type === 'key') {
            const lConnection = edges.find(edge => edge.source === node.id && edge.sourceHandle === 'l');
            if (lConnection) {
                const connectedNode = nodes.find(n => n.id === lConnection.target);
                if (connectedNode) {
                    // Fetching the string representation of the connected node for 'key' nodes with 'l' connections
                    const extraInfo = getConnectedNodeString(connectedNode, 0); // Assuming this function returns the connected node's string representation
                    visited.add(lConnection.target); // Mark this node as used for extraInfo
                    contractString += `${' '.repeat(indent)}${node.data.strict ? 'strict ' : 'let '}${node.data.key} = ${extraInfo}\n`;
                }
            } else {
                // If no 'l' connection, append the key node as usual
                contractString += `${' '.repeat(indent)}${node.data.strict ? 'strict ' : 'let '}${node.data.key}\n`;
            }
        } else if (node.type === 'logic') {
            const condition = node.data.condition ? node.data.condition : "EQUALS"
            // Get left value(s) node
            const lConnections = edges.filter(edge => edge.source === node.id && edge.sourceHandle === 'l');

            // Two connections
            if (lConnections.length > 1 && lConnections.length < 3) {
                const connectedNode1 = nodes.find(n => n.id === lConnections[0].target);
                const connectedNode2 = nodes.find(n => n.id === lConnections[1].target);

                if (connectedNode1 && connectedNode2) {
                    const extraInfo1 = getConnectedNodeString(connectedNode1, 0);
                    const extraInfo2 = getConnectedNodeString(connectedNode2, 0);
                    visited.add(lConnections[0].target).add(lConnections[1].target);

                    switch (condition) {
                        case "EQUALS":
                            contractString += `${' '.repeat(indent)}if (${extraInfo1} == ${extraInfo2}) then\n`
                            break
                        case "NOTEQUAL":
                            contractString += `${' '.repeat(indent)}if (${extraInfo1} != ${extraInfo2}) then\n`
                            break
                        case "AND":
                            contractString += `${' '.repeat(indent)}if (${extraInfo1} && ${extraInfo2}) then\n`
                            break
                        case "OR":
                            contractString += `${' '.repeat(indent)}if (${extraInfo1} || ${extraInfo2}) then\n`
                            break
                        default:
                            console.log("Condition not found.")
                    }
                }
            }
            // One connection
            else if (lConnections.length === 1) {
                const connectedNode = nodes.find(n => n.id === lConnections[0].target);
                if (connectedNode) {
                    const extraInfo = getConnectedNodeString(connectedNode, indent);
                    visited.add(lConnections[0].target);

                    switch (condition) {
                        case "EQUALS":
                            contractString += `${' '.repeat(indent)}if (${extraInfo}) then\n`
                            break
                        case "NOTEQUAL":
                            contractString += `${' '.repeat(indent)}if (!${extraInfo}) then\n`
                            break
                        default:
                            console.log("Condition not found.")
                    }
                }
            } else {
                // TODO implement?
            }

            // True
            const tConnection = edges.find(edge => edge.source === node.id && edge.sourceHandle === 't');
            if (tConnection) {
                const tConnectedNode = nodes.find(n => n.id === tConnection.target);
                if (tConnectedNode) {
                    generalTraverseNodeFromLeft(tConnectedNode, indent+4)
                }
            }

            // False
            contractString += `${' '.repeat(indent)}else\n`
            const fConnection = edges.find(edge => edge.source === node.id && edge.sourceHandle === 'f');
            if (fConnection) {
                const fConnectedNode = nodes.find(n => n.id === fConnection.target);
                if (fConnectedNode) {
                    generalTraverseNodeFromLeft(fConnectedNode, indent+4)
                }
            }
        } else {
            contractString += getNodeString(node, indent);
        }

        // Process outgoing edges based on custom sort order
        const outgoingEdges = cleanedEdges
            .filter(edge => edge.source === node.id)
            .sort((a, b) => sortOrder.indexOf(a.sourceHandle) - sortOrder.indexOf(b.sourceHandle));

        outgoingEdges.forEach(cleanedEdges => {
            const nextNode = nodes.find(n => n.id === cleanedEdges.target);
            if (nextNode) generalTraverseNodeFromLeft(nextNode, indent);
        });
    }

    function startTraversalFromBottomNodes() {
        const visited = new Set(); // To keep track of visited nodes across all traversals

        bottomTraversalNodes.forEach(node => {
            // Special cases
            if (node.type === "function") {
                const functionPrefix = node.data.callable ? `@Callable(i)\n` : ``;
                const functionDeclaration = `func ${node.data.function}(${node.data.parameters})`
                contractString += `${functionPrefix}${functionDeclaration} = {\n`
            } else if (node.type === "key") {
                const lConnection = edges.find(edge => edge.source === node.id && edge.sourceHandle === 'l');
                if (lConnection) {
                    const connectedNode = nodes.find(n => n.id === lConnection.target);
                    if (connectedNode) {
                        // Fetching the string representation of the connected node for 'key' nodes with 'l' connections
                        let extraInfo = getConnectedNodeString(connectedNode, 0); // Assuming this function returns the connected node's string representation
                        visited.add(lConnection.target); // Mark this node as used for extraInfo
                        contractString += `${node.data.strict ? 'strict ' : 'let '}${node.data.key} = ${extraInfo}\n\n`;
                    }
                }
            } else if (node.type === "note") {
                contractString += getNodeString(node, 0);
            }

            // Find and start from 'l' connected nodes, then proceed with general traversal
            const leftConnectedEdge = cleanedEdges.find(edge => edge.source === node.id && edge.sourceHandle === 'l');
            if (leftConnectedEdge) {
                const leftConnectedNode = nodes.find(n => n.id === leftConnectedEdge.target);
                if (leftConnectedNode && !visited.has(leftConnectedNode.id)) {
                    generalTraverseNodeFromLeft(leftConnectedNode);
                }
            } else {
                // If no 'l' connection, start general traversal from the current node
                /*if (!visited.has(node.id)) {
                    generalTraverseNodeFromLeft(node, visited);
                }*/
            }

            if (node.type === "function") {
                contractString += "}\n\n"
            }
        });
    }

    console.log("node: ", nodes)
    console.log("edges: ", cleanedEdges)

    traverseStartNodeBottom(startNode);

    startTraversalFromBottomNodes()

    contractString += ending
    console.log(contractString)
    return contractString;
}

export default createContract;