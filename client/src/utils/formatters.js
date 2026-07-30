/**
 * Generate a list of objects containing an "id" and "label" keys
 * @param {Object[]} provinceArray - Array of province names having at least an "id" and "name" key-object pairs
 * @param {String} nameField - Key name to extract as "label" from the Object array if a "name" field is not available
 *    [{ id: 0, name: "province-name", "extra-key": "some extra value" },... ]
 * @returns {Object[]} Array containing [{ id, label },... ] objects
 */
const formatSelectOptions = (itemArray, nameField = 'label') =>
  itemArray.map((item, id) => ({ id, label: item[nameField] }))

export {
  formatSelectOptions
}
