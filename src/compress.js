const imagemin = require('imagemin')
const imageminPngquant = require('imagemin-pngquant')

const start = async () => {
	console.log('compressing...')
	try {
		await imagemin(['./temp/*.png'], {
			destination: './dist/image/',
			plugins: [
				imageminPngquant({
					quality: [0.7, 0.9]
				})
			]
		})
	} catch (e) {
		console.log(e)
	}
}

module.exports = start