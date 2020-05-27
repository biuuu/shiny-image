const imagemin = require('imagemin')
const fs = require('fs-extra')
const imageminPngquant = require('imagemin-pngquant')

const start = async () => {
  await fs.emptyDir('./temp/')
	await imagemin(['./dist/*.png'], {
		destination: './temp/',
		plugins: [
			imageminPngquant({
				quality: [0.5, 0.6]
      })
		]
	})
}

start()