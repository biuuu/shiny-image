const info = require('../image-info.json')
const { downloadImage } = require('./utils')
const sharp = require('sharp')
const fs = require('fs-extra')

const imageList = [
'images/ui/common/parts_buttons.json_image',
'images/ui/start_and_common/parts.json_image',
'images/ui/my_page/parts.json_image',
'images/ui/present_box/parts.json_image',
'images/ui/mission/parts.json_image',
'images/ui/idol_portal/parts.json_image',
'images/ui/fes/parts.json_image',
'images/ui/produce_top/parts.json_image',
'images/ui/beginner_mission/parts.json_image',
'images/ui/produce_action/parts_wing.json_image',
'images/ui/produce_common/parts_header.json_image',
'images/ui/produce_common/parts_pyramid.json_image',
'images/ui/produce_trend/parts.json_image',
'images/ui/produce_action/gradation/parts.json_image',
'images/ui/produce_action/parts.json_image',
'images/ui/produce_event/parts_event.json_image',
'images/ui/produce_ability/parts.json_image',
'images/ui/produce_block/parts.json_image']

const extract = async (name, frames) => {
  for (let key in frames) {
    let { x: left, y: top, w: width, h: height } = frames[key].frame
    if (frames[key].rotated) {
      width = frames[key].frame.h
      height = frames[key].frame.w
    }
    await fs.ensureDir(`./origin/${name.replace('.webp', '')}/`)
    let temp =  sharp(`./origin/${name}`).extract({ left, top, width, height })
    if (frames[key].rotated) {
      temp = temp.rotate(-90)
    }
    await temp.png()
    .toFile(`./origin/${name.replace('.webp', '')}/${key}`)
    .catch(err => {
      console.error(err)
    })
  }
}

const start = async () => {
  await fs.emptyDir('./origin/')
  for (let name of imageList) {
    let key = name.replace(/\.json_image$/, '')
    if (info[key]) {
      let url = `https://shinycolors.enza.fun${info[key].url}`
      let imageName = key.replace('images/ui/', '').replace(/\//g, '_') + '.webp'
      console.log('download', imageName)
      await downloadImage(url, './origin/', imageName)
      await extract(imageName, info[key].frames)
    }
  }
}

start()