/**
* UserCircle.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
		
	attributes: {
		ownerId: {
			type: 'string',
			required: true
		},
		friendId: {
			type: 'string',
			required: true,
		},
		status: {
			type: 'string',
			required:true,
		},
		ownerUnread: {
			type: 'string',
			required:true,
		},
		inviterUnread: {
			type: 'string',
			required:true,
		},
	}
};