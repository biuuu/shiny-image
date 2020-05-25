const glob = require('glob')
const info = require('../image-info.json')
const sharp = require('sharp')
const fs = require('fs-extra')

const Glob = glob.Glob
glob.promise = function (pattern, options) {
  return new Promise(function (resolve, reject) {
    var g = new Glob(pattern, options)
    g.once('end', resolve)
    g.once('error', reject)
  })   
}

const infoName = () => {
  for (let name in info) {
    let key = name.replace('images/ui/', '').replace(/\//g, '_')
    info[key] = info[name]
  }
}

infoName()

const removePixel = (data, imageInfo, rectInfo) => {
  let len1 = rectInfo.height + rectInfo.top
  let len2 = rectInfo.width + rectInfo.left
  for (let i = rectInfo.top; i < len1; i++) {
    for (let j = rectInfo.left; j < len2; j++) {
      let index = (i * imageInfo.width + j + 1) * 4
      data[index] = 255
      data[index + 1] = 255
      data[index + 2] = 255
      data[index + 3] = 0
    }
  }
}

const start = async () => {
  await fs.emptyDir('./dist/')
  await fs.emptyDir('./temp/')
  const files = await glob.promise('./images/*/*.png')
  const imageMap = new Map()
  for (let file of files) {
    let rs = file.match(/images\/(.+)\/(.+\.png)/)
    const name1 = rs[1]
    const name2 = rs[2]
    if (!imageMap.has(name1)) {
      imageMap.set(name1, [])
    }
    imageMap.get(name1).push(name2)
  }

  for (let [key, list] of imageMap) {
    let frames = info[key].frames
    let paramsOver = []
    const imageBuffer = await sharp(`./origin/${key}.webp`).raw().toBuffer({ resolveWithObject: true })
    for (let name of list) {
      let frame = frames[name].frame
      let { x: left, y: top, w: width, h: height } = frame
      let inputOver = `./images/${key}/${name}`
      if (frames[name].rotated) {
        [ width, height] = [height, width]
        inputOver = await sharp(inputOver).rotate(90).toBuffer()
      }
      removePixel(imageBuffer.data, imageBuffer.info, { left, top, width, height } )
      paramsOver.push({
        input: inputOver,
        top: frame.y,
        left: frame.x,
        blend: 'over'
      })
    }

    // draw image
    await sharp(imageBuffer.data, {
      raw: {
        width: imageBuffer.info.width,
        height: imageBuffer.info.height,
        channels: imageBuffer.info.channels
      }
    })
    .composite(paramsOver)
    .png()
    .toFile(`./dist/${key}.png`)
  }
}

start()