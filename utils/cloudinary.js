const stream = require('stream');
const cloudinary = require('cloudinary');


cloudinary.config({
	cloud_name: 'dkuxfjcdo',
	api_key:    '317192139379355',
	api_secret: 'Ia98MnK-nKEvlCFOAmeTm5ALcvI'
});

const uploadImage = (file) =>
	new Promise(resolve => {
		const uploadStream = cloudinary.uploader.upload_stream(result => resolve(result));

		const s = new stream.PassThrough();
		s.end(file.buffer);
		s.pipe(uploadStream);
		s.on('end', uploadStream.end);
	});


module.exports = uploadImage;
