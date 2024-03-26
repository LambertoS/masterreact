/**
 * Converts a json object to a Key Value Pair Array
 * @param {any} jsonObject -
 * @param {Function} callback - function to call when the object was converted
 * @todo type of jsonObject
 */
export const convertJsonToKeyValue = (jsonObject, callback) => {
    const filtered = []; // todo type & name
    // Check if jsonObject.document exists, otherwise start with jsonObject
    const startingPoint = jsonObject.document ? jsonObject.document : jsonObject;

    recursive(startingPoint, "", filtered);
    callback(filtered);
}

/**
 * todo description
 * @param jsonObject
 * @param prefixReadable
 * @param arr
 * @todo type of jsonObject
 */
const recursive = (jsonObject, prefixReadable, arr) => {
    for (const key in jsonObject) {
        const preReadable = prefixReadable.length > 0 ? prefixReadable + "." + key : key;
        if (typeof jsonObject[key] === 'object' && jsonObject[key] !== null) {
            recursive(jsonObject[key], preReadable, arr);
        } else {
            if (jsonObject[key] !== null && jsonObject[key].toString().length > 0) {
                arr[preReadable] = jsonObject[key];
            }
        }
    }
}