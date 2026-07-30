
/**
 * Returns data wrapped in a simple Object format for storing lists of uniform data to a single Firestore document
 */
class SimpleDataFormat {
  // Common data to contain an array of uniform Object {}
  data = []

  // Data title or name
  title = ''

  // Brief data description
  description = ''

  // Name of updater
  udpated_by = '-'

  // Date created
  date_created = new Date().toLocaleDateString('en-GB').split('/').reverse().join('')

  // Other user-defined descriptive data information in key-value text pairs
  meta = {}

  /**
   * Initialize a SimpleDataFormat object with values
   * @param {String} title - Data title or name
   * @param {String} description - Brief data description
   * @param {String} udpated_by - Name of updater
   * @param {String} date_created - (Optional) Date created in String or Firestore Timestamp format
   * @param {Object} meta - (Optional) Other user-defined descriptive data information in key-value text pairs
   */
  constructor ({ title, description, udpated_by, date_created, meta }) {
    this.title = title || '-'
    this.description = description || '-'
    this.udpated_by = udpated_by || '-'

    if (date_created) {
      this.date_created = date_created
    }

    if (meta) {
      this.meta = meta
    }
  }

  /**
   * Set other descriptive data information in this.meta
   * @param {Object} keyValuePairs - Object containing simple plain text key-value pairs
   */
  setMeta (keyValuePairs) {
    for (const key in keyValuePairs) {
      this.meta[key] = keyValuePairs[key]
    }
  }

  /**
   * Sets the main data list
   * @param {Object[]} data - Object array containing uniform (common-elements) data
   */
  setData (data) {
    this.data = data
  }

  /**
   * Returns the list of raw user-supplied main data
   * @returns {Object[]} Raw user-suplied main data
   */
  getData () {
    return this.data
  }

  /**
   * Returns a formatted Object containing the main data and other descriptive information
   * @returns {Object} Formatted Object containing the main data and other descriptive information
   */
  getFormattedData () {
    const object = {
      data: this.data,
      title: this.title,
      description: this.description,
      udpated_by: this.udpated_by,
      date_created: this.date_created
    }

    if (Object.keys(this.meta).length > 0) {
      object.meta = this.meta
    }

    return object
  }
}

module.exports = SimpleDataFormat
