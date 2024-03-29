/**
 * Converts a JSON object into a flat key-value pair representation, suitable for blockchain transactions.
 * @param {Object} jsonObject - The JSON object to convert.
 * @returns {Promise<Object>} A promise that resolves to a key-value representation of the JSON object.
 */
export const convertJsonToKeyValue = async (jsonObject) => {
    return new Promise((resolve) => {
        const filtered = []; // todo type & name
        const startingPoint = jsonObject.document ? jsonObject.document : jsonObject;

        flattenJsonToPathValuePairs(startingPoint, "", filtered);
        resolve(filtered);
    });
}

/**
 * Flattens a nested JSON object into a map of path-value pairs.
 * Each key in the resulting map is a string representing the path to the value in the original JSON object.
 *
 * @param {Object} jsonObject - The JSON object to flatten.
 * @param {string} prefixReadable - Accumulator for the current path, used in recursive calls.
 * @param {Object} arr - An accumulator object where the path-value pairs are stored.
 */
const flattenJsonToPathValuePairs = (jsonObject, prefixReadable, arr) => {
    for (const key in jsonObject) {
        const preReadable = prefixReadable.length > 0 ? prefixReadable + "." + key : key;
        if (typeof jsonObject[key] === 'object' && jsonObject[key] !== null) {
            flattenJsonToPathValuePairs(jsonObject[key], preReadable, arr);
        } else {
            if (jsonObject[key] !== null && jsonObject[key].toString().length > 0) {
                arr[preReadable] = jsonObject[key];
            }
        }
    }
}