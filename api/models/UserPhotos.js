/**
* UserPhotos.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
		
	attributes: {
		userId: {
			type: 'string',
			required: true
		},
		fbPhotoId: {
			type: 'string',
			required: true,
		},
		photoUrl: {
			type: 'string',
			required: true,
		},
		thumbnailUrl: {
			type: 'string',
			required: true,
		}
	}
};