const os = require('os')

const logOsInfo = () => {
  // OS
  const osType = os.type()
  const osRelease = os.release()
  const osPlatform = os.platform()
  const osArchitecture = os.arch()
  const osCPU = os.cpus().length

  // RAM
  const freeRAM = os.freemem()
  const totalRAM = os.totalmem()
  const tMB = totalRAM / (1024 * 1024)
  const fFM = freeRAM / (1024 * 1024)

  console.log(`\nOS: ${osType}\nRelease: ${osRelease}\nPlatform: ${osPlatform}\nArchitecture: ${osArchitecture}\nCPUs: ${osCPU}`)
  console.log(`RAM: ${tMB} MB`)
  console.log(`RAM (free): ${fFM} MB`)
}

module.exports = {
  logOsInfo
}
