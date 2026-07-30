
const imageLoader = ({ src }) => {
  const development = process.env.NODE_ENV !== 'production'
  const assetPrefix = !development ? process.env.NEXT_PUBLIC_BASE_PATH : ''
  return `${assetPrefix}/${src}`
}

const assetPrefixer = (src) => {
  const development = process.env.NODE_ENV !== 'production'
  const assetPrefix = !development ? process.env.NEXT_PUBLIC_BASE_PATH : ''
  return `${assetPrefix}/${src}`
}

module.exports = {
  assetPrefixer,
  imageLoader
}
