


function createContract(data) {
    const { nodes, edges } = data;

    let functionScopeStack = [];

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

    function getNodeString(node, indent) {
        const indentation = ' '.repeat(indent); // Create an indentation string
        switch (node.type) {
            case 'start':
                return ``;
            case 'function':
                if (node.data.callable) {
                    return `${indentation}@Callable(i)
    ${indentation}func ${node.data.function}(${node.data.parameters})\n`;
                } else {
                    return `${indentation}func ${node.data.function}(${node.data.parameters})\n`;
                }
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
            case 'key':
                if (node.data.strict) {
                    return `${indentation}strict ${node.data.key}\n`;
                } else {
                    return `${indentation}let ${node.data.key}\n`;
                }
            case 'note':
                return `${indentation}${node.data.label}\n`;
            default:
                return `${indentation}Unknown Node: ${node.data.label}, of type ${node.type}\n`;
        }
    }


    function traverse(node, indent = 0) {
        if (visitedNodes.has(node.id)) return;
        visitedNodes.add(node.id);

        const isFunctionNode = node.type === 'function';
        if (isFunctionNode) {
            functionScopeStack.push(node.id);
            contractString += getNodeString(node, indent) + "{\n"; // Add opening brace for function
        } else {
            contractString += getNodeString(node, indent);
        }

        const nextIndent = isFunctionNode ? indent + 4 : indent;

        // Sort outgoing edges based on custom sort order
        const outgoingEdges = edges
            .filter(edge => edge.source === node.id)
            .sort((a, b) => sortOrder.indexOf(a.sourceHandle) - sortOrder.indexOf(b.sourceHandle));

        outgoingEdges.forEach(edge => {
            const nextNode = nodes.find(n => n.id === edge.target);
            if (nextNode) traverse(nextNode, nextIndent);
        });

        if (isFunctionNode && functionScopeStack.length && functionScopeStack[functionScopeStack.length - 1] === node.id) {
            contractString += `${' '.repeat(indent)}}\n`; // Closing brace for function
            functionScopeStack.pop();
        }
    }


    traverse(startNode, 0);
    contractString += ending;

    downloadContract(contractString, 'my_smart_contract.ride');
    // Return the constructed string wrapped in a Promise to simulate async operation
    return Promise.resolve(contractString);
}
export default createContract;