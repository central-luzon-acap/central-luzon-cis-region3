require('dotenv').config()
const generateApiDocs = require('./generate-docs')

const main = () => {
  try {
    generateApiDocs()
    console.log('Creating the API docs...')
  } catch (err) {
    console.log(err.message)
    process.exit(1)
  }
}

main()
