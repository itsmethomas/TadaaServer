/**
* Message.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
	attributes: {
		circleId: {
			type: 'string',
			required: true
		},
		fromId: {
			type: 'string',
			required: true,
		},
		toId: {
			type: 'string',
			required: true
		},
		message: {
			type: 'string',
			required: true
		},
		isRead: {
			type: 'string',
			required: true
		},
	},
	sendPush: function (deviceToken, msg) {
		var apnagent = require('apnagent');
		agent = module.exports = new apnagent.Agent();

		var join = require('path').join;
		var pfx = join(__dirname, '../../certs/aps_pro.p12');

		agent.set('pfx file', pfx);
//		agent.enable('sandbox');

		agent.connect(function (err) {
		});

		agent.createMessage().device(deviceToken).alert(msg).send();
	},
	sendPushWithBadge: function (deviceToken, msg, badgeNumber) {
		var apnagent = require('apnagent');
		agent = module.exports = new apnagent.Agent();

		var join = require('path').join;
		var pfx = join(__dirname, '../../certs/aps_dev.p12');

		agent.set('pfx file', pfx);
		agent.enable('sandbox');

		agent.connect(function (err) {
		});

		agent.createMessage().device(deviceToken).badge(badgeNumber).alert(msg).send();
	},
	
	sendNotification: function (userId, msgHeader, msgDic, msgPlain) {
		User.find({id:userId}, function (err, users) {
			if (err) {
				console.log(err);
			} else {
				var user = users[0];
				if (user.status == 'online') {
					sails.sockets.emit(user.session_id, msgHeader, msgDic);
				} else {
					Message.sendPush(user.deviceToken, msgPlain);
				}
			}
		});
	},

	sendNotificationWithBadge: function (userId, msgHeader, msgDic, msgPlain, badgeNumber) {
		User.find({id:userId}, function (err, users) {
			if (err) {
				console.log(err);
			} else {
				var user = users[0];
				if (user.status == 'online') {
					sails.sockets.emit(user.session_id, msgHeader, msgDic);
				} else {
					Message.sendPushWithBadge(user.deviceToken, msgPlain, badgeNumber);
				}
			}
		});
	},

};

