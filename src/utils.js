const path = require('path')
const axios = require('axios')
const fs = require('fs-extra')
const glob = require('glob')

const Glob = glob.Glob
glob.promise = function (pattern, options) {
  return new Promise(function (resolve, reject) {
    var g = new Glob(pattern, options)
    g.once('end', resolve)
    g.once('error', reject)
  })
}

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
    let timer = setTimeout(() => {
      reject('download image timeout.')
    }, 20 * 1000)
    writer.on('finish', () => {
      clearTimeout(timer)
      resolve()
    })
    writer.on('error', () => {
      clearTimeout(timer)
      reject()
    })
  })
}

exports.downloadImage = downloadImage
exports.glob = glob