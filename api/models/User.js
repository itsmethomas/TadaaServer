/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
		
	attributes: {
		userName: {
			type: 'string',
			required: true
		},
		fbId: {
			type: 'string',
			required: true,
		},
		email: {
			type: 'email', // Email type will get validated by the ORM
			required: true
		},
		deviceToken: {
			type: 'string',
			required:true,
		},
		photoUrl: {
			type: 'string'
		},
		videoUrl: {
			type: 'string'
		},
		birthDate: {
			type: 'date'
		},
		sex: {
			type: 'string'
		},
		region: {
			type: 'string'
		},
		loc_lat: {
			type: 'string'
		},
		loc_lng: {
			type: 'string'
		},
		session_id: {
			type: 'string'
		},
		status: {
			type: 'string'
		}
	}
};