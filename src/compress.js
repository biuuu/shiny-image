const imagemin = require('imagemin')
const imageminPngquant = require('imagemin-pngquant')

const start = async () => {
	console.log('compressing...')
	await imagemin(['./temp/*.png'], {
		destination: './dist/image/',
		plugins: [
			imageminPngquant({
				quality: [0.5, 0.6]
      })
		]
	})
}

module.exports = start