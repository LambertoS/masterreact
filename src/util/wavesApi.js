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