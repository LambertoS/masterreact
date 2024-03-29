/**
 * Compiles script data to Base64 using the Waves blockchain node utility endpoint.
 * @param {string} scriptData - The script data to compile.
 * @returns {Promise<string>} A promise that resolves to the Base64 representation of the script.
 */
export const convertScriptToBase64 = async (scriptData) => {
    // Prepare the request options for the POST request.
    const requestOptions = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: scriptData
    };
    // Make a POST request to compile the script to Base64.
    const responseUtilsScriptCompile = await fetch(`https://nodes-testnet.wavesnodes.com/utils/script/compileCode`, requestOptions);
    return (await responseUtilsScriptCompile.json()).script
}