const imagemin = require('imagemin')
const imageminPngquant = require('imagemin-pngquant')
const glob = require('glob')

const start = async () => {
	console.log('compressing...')
	try {
		const files = glob.sync('./temp/*.png')
		const list = []
		const uncomp = []
		files.forEach(file => {
			if (!file.includes('produce_common_parts_header')) {
				list.push(file)
			} else {
				uncomp.push(file)
			}
		})
		await imagemin(list, {
			destination: './dist/image/',
			plugins: [
				imageminPngquant({
					quality: [0.5, 0.6]
				})
			]
		})
		await imagemin(uncomp, {
			destination: './dist/image/',
			plugins: [
				imageminPngquant({
					quality: [0.95, 1]
				})
			]
		})
	} catch (e) {
		console.log(e)
	}
}

module.exports = start