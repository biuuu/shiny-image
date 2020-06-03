const info = require('../image-info.json')
const imageList = require('../image-list.json')
const { downloadImage } = require('./utils')
const sharp = require('sharp')
const fs = require('fs-extra')
const { glob } = require('./utils')

const extract = async (name, frames) => {
  for (let key in frames) {
    let { x: left, y: top, w: width, h: height } = frames[key].frame
    if (frames[key].rotated) {
      width = frames[key].frame.h
      height = frames[key].frame.w
    }
    await fs.ensureDir(`./origin/${name.replace('.png', '')}/`)
    let temp =  sharp(`./origin/${name}`).extract({ left, top, width, height })
    if (frames[key].rotated) {
      temp = temp.rotate(-90)
    }
    await temp.png()
    .toFile(`./origin/${name.replace('.png', '')}/${key}`)
    .catch(err => {
      console.error(err)
    })
  }
}

const start = async () => {
  await fs.ensureDir('./origin/')
  for (let name of imageList) {
    let key = name.replace(/\.json_image$/, '')
    if (info[key]) {
      let url = `https://shinycolors.enza.fun${info[key].url}`
      let imageName = key.replace('images/ui/', '').replace(/\//g, '_') + '.png'
      console.log('download', imageName)
      await downloadImage(url, './origin/', imageName)
      await extract(imageName, info[key].frames)
    }
  }
}

const downloadTipsImage = async () => {
  await fs.ensureDir('./origin/tips/')
  for (let key in info) {
    if (key.startsWith('images/tips/') && !key.includes('/game_event/')) {
      let url = `https://shinycolors.enza.fun${info[key].url}`
      let imageName = key.replace('images/tips/', '').replace(/\//g, '_') + info[key].ext
      const tips = await glob.promise('*.*', { cwd: './origin/tips/' })
      if (tips.includes(imageName)) {
        console.info('skip', imageName)
      } else {
        console.log('download', imageName)
        try {
          await downloadImage(url, './origin/tips/', imageName)
        } catch (e) {
          console.error(e)
        }
      }
    }
  }
}

if (process.argv[2] === '-T') {
  downloadTipsImage()
} else {
  start()
}