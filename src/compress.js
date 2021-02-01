const imagemin = require('imagemin')
const imageminPngquant = require('imagemin-pngquant')
const glob = require('glob')

const filterImages = [
	'common_parts_filter',
	'produce_common_parts_header'
]

const needFilter = (name) => {
	let result = false
	for (let keyword of filterImages) {
		if (name.includes(keyword)) {
			result = true
			break
		}
	}
	return result
}

const start = async () => {
	console.log('compressing...')
	try {
		const files = glob.sync('./temp/*.png')
		const list = []
		const uncomp = []
		files.forEach(file => {
			if (!needFilter(file)) {
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