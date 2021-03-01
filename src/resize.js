const { downloadImage } = require('./utils')
const sharp = require('sharp')
const fs = require('fs-extra')

const start = async () => {
  await fs.ensureDir(`./dist/resize/`)
  await fs.emptyDir(`./dist/resize/`)
  const txt = await fs.readFile('./src/1.txt', 'utf8')
  const list = txt.split(/\r?\n/).map(str => str.trim()).filter(str => {
    if (/https?:\/\//.test(str)) {
      return true
    }
  })
  console.log(list)
  let i = 1
  for (let url of list) {
    await downloadImage(url, 'dist', `${i}.png`)
    await sharp(`./dist/${i}.png`)
    .resize({ width: 60 })
    .toFile(`./dist/resize/${i}.png`)
    i++
  }
}
start()