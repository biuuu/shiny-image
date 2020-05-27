const info = require('../image-info.json')
const sharp = require('sharp')
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

const infoName = () => {
  for (let name in info) {
    let key = name.replace('images/ui/', '').replace(/\//g, '_')
    info[key] = info[name]
  }
}

infoName()

const extract = async (name) => {
  let frames = info[name].frames
  for (let key in frames) {
    let { x: left, y: top, w: width, h: height } = frames[key].frame
    if (frames[key].rotated) {
      width = frames[key].frame.h
      height = frames[key].frame.w
    }
    await fs.ensureDir(`./dist/${name}/`)
    let temp =  sharp(`./temp/${name}.png`).extract({ left, top, width, height })
    if (frames[key].rotated) {
      temp = temp.rotate(-90)
    }
    await temp.png()
    .toFile(`./dist/${name}/${key}`)
    .catch(err => {
      console.error(err)
    })
  }
}

extract('produce_block_parts')