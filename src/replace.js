const glob = require('glob')
const info = require('../image-info.json')
const sharp = require('sharp')
const fs = require('fs-extra')
const md5 = require('md5-file')
const CSV = require('papaparse')
const compress = require('./compress')

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
    let key = name.replace('images/ui/', '').replace('images/tips/', '').replace(/\//g, '_')
    info[key] = info[name]
  }
}

infoName()

const SPECIAL = ['grad_text_week.png', 'wing_text_week.png', 'text_week_remaining.png']

const removePixel = (data, imageInfo, rectInfo) => {
  let len1 = rectInfo.height + rectInfo.top
  let len2 = rectInfo.width + rectInfo.left
  for (let i = rectInfo.top; i < len1; i++) {
    for (let j = rectInfo.left; j < len2; j++) {
      let index = (i * imageInfo.width + j + 1) * 4
      data[index] = 0
      data[index + 1] = 0
      data[index + 2] = 0
      data[index + 3] = 0
    }
  }
}

const start = async () => {
  await fs.emptyDir('./dist/')
  await fs.emptyDir('./temp/')
  const files = await glob.promise('./images/*/*.{png,jpg}')
  const imageMap = new Map()
  for (let file of files) {
    let rs = file.match(/images\/(.+)\/(.+\.(png|jpg))/)
    const name1 = rs[1]
    const name2 = rs[2]
    if (!imageMap.has(name1)) {
      imageMap.set(name1, [])
    }
    imageMap.get(name1).push(name2)
  }

  const imageMd5 = {}
  const csvList = []
  for (let [key, list] of imageMap) {
    if (key === 'tips') {
      for (let name of list) {
        const filePath = `./images/tips/${name}`
        const fileName = name.replace(/\.jpg$/, '')
        let md5Value = await md5(filePath)
        imageMd5[fileName] = md5Value
        await fs.copy(filePath, `./dist/image/tips/${name}`)
        csvList.push({
          name: info[fileName].name + info[fileName].ext,
          url: `tips/${name}`,
          version: info[fileName].v
        })
      }
    } else {
      let frames = info[key].frames
      let paramsOver = []
      const imageBuffer = await sharp(`./origin/${key}.png`).raw().toBuffer({ resolveWithObject: true })
      for (let name of list) {
        if (!frames[name]) continue
        let frame = frames[name].frame
        let { x: left, y: top, w: width, h: height } = frame
        if (SPECIAL.includes(name)) {
          left -= 2
        }
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
      .toFile(`./temp/${key}.png`)

      console.log('save:', key)

      let md5Value = await md5(`./temp/${key}.png`)
      imageMd5[key] = md5Value
      csvList.push({
        name: info[key].name + '.json_image',
        url: key + '.png',
        version: info[key].v
      })
    }
  }
  await compress()
  await fs.outputJSON(`./dist/image-md5.json`, imageMd5)
  await fs.outputFile('./dist/image.csv', CSV.unparse(csvList))
  await fs.copy('./icon-info.json', './dist/icon-info.json')
  await fs.copy('./idol-info.json', './dist/idol-info.json')
}

start()