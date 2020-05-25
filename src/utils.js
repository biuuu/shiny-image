const path = require('path')
const axios = require('axios')
const fs = require('fs-extra')

const fetchImage = async (url, times = 0) => {
  try {
    return axios({
      url,
      method: 'GET',
      responseType: 'stream'
    })
  } catch (e) {
    if (times < 3) {
      return fetchImage(url, times + 1)
    } else {
      throw e
    }
  }
}

const downloadImage = async function (url, dir, name) {
  const filePath = path.resolve(dir, name)
  await fs.ensureDir(dir)
  const writer = fs.createWriteStream(filePath)
  const response = await fetchImage(url)
  
  response.data.pipe(writer)

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve)
    writer.on('error', reject)
  })
}

exports.downloadImage = downloadImage