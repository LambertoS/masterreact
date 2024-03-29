/**
 *
 * @param address
 * @return {Promise<[{type: string, value: string, key: string}]|any>}
 */
export const getWavesAccountData = async (address) => {
    // Get the account data
    const responseData = await fetch(`https://nodes-testnet.wavesnodes.com/addresses/data/${address}`);
    if (!responseData.ok) {
        return [{key: "Fehler", type: "string", value: "Ein Fehler ist aufgetreten."}]
    } else {
        return await responseData.json()
    }
}

/**
 * Retrieves and analyzes the script associated with a given Waves blockchain address,
 * extracting and structuring callable functions and their invocation details.
 *
 * @param {string} address The blockchain address whose script is to be analyzed.
 * @return {Promise<Array>} A promise that resolves with an array of objects, each representing
 * a callable function found in the script. Each object includes the function's name,
 * parameters, and an array of invoked functions, with details about the invoked functions' names,
 * addresses, and parameters.
 */
export const getWavesScriptFunctions = async (address) => {
    try {
        // Get the script in base64
        const responseData = await fetch(`https://nodes-testnet.wavesnodes.com/addresses/scriptInfo/${address}`);
        const data = await responseData.json()
        const scriptBase64 = data.script

        // Decompile the script
        const requestOptions = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: scriptBase64
        };
        const responseUtilsScriptDecompile = await fetch(`https://nodes-testnet.wavesnodes.com/utils/script/decompile`, requestOptions);
        const responseUtilsScriptDecompileData = await responseUtilsScriptDecompile.json()
        const script = responseUtilsScriptDecompileData.script

        // 1. Capture and Map Variable Definitions
        const variableDefinitionRegex = /let\s+(\w+)\s*=\s*addressFromStringValue\("([^"]+)"\)/g;
        let variableMap = {};
        let variableMatch;
        while ((variableMatch = variableDefinitionRegex.exec(script)) !== null) {
            variableMap[variableMatch[1]] = variableMatch[2]; // Map variable name to its address value
        }

        const callableFunctionRegex = /@Callable\(i\)\s*func\s+([^(]+)\(([^)]*)\)\s*=\s*{([\s\S]*?)}(?:\n\s*@|$)/gm;
        const invokeFunctionRegex = /invoke\(([^,]+),\s*"([^"]+)",\s*\[([^\]]*)\]/g;

        let callableFunctions = [];
        let match;

        while ((match = callableFunctionRegex.exec(script)) !== null) {
            const functionName = match[1].trim();
            const params = match[2].trim().split(',').map(param => param.trim());
            const functionBody = match[3];

            let invokedFunctions = [];
            let invokeMatch;
            while ((invokeMatch = invokeFunctionRegex.exec(functionBody)) !== null) {
                const addressVariableName = invokeMatch[1].trim();
                const invokedFunctionName = invokeMatch[2].trim();
                const invokedFunctionParams = invokeMatch[3].trim().split(',').map(param => param.trim());
                // Resolve address variable name to its actual value, if present in the map
                const resolvedAddress = variableMap[addressVariableName] || addressVariableName;

                invokedFunctions.push({
                    function: invokedFunctionName,
                    address: resolvedAddress,
                    params: invokedFunctionParams
                });
            }

            callableFunctions.push({
                name: functionName,
                params: params,
                invokes: invokedFunctions
            });
        }

        // Check if all callable functions are present
        const scriptMetaData = await getWavesScriptMeta(address)

        let callableFunctionsMap = new Map(callableFunctions.map(func => [func.name, func]));

        // Iterate through the functions metadata to ensure all functions are accounted for
        Object.entries(scriptMetaData).forEach(([funcName, params]) => {
            if (!callableFunctionsMap.has(funcName)) {
                // If the function is not found, add it with parameters and default invokes
                let paramNames = params.map(param => param.name); // Extract parameter names
                callableFunctions.push({
                    name: funcName,
                    params: paramNames,
                    invokes: [{function: "unknown"}]
                });
            }
        });

        return callableFunctions
    } catch (e) {
        console.error("Error fetching account script: ", e)
        return []
    }
}

export const getWavesScriptMeta = async (address) => {
    const responseScriptMeta = await fetch(`https://nodes-testnet.wavesnodes.com/addresses/scriptInfo/${address}/meta`);
    const scriptMetaDataJson = await responseScriptMeta.json()

    if (scriptMetaDataJson.meta !== undefined)
        return scriptMetaDataJson.meta.callableFuncTypes
    else
        return null
}