/**
 * MessageController
 *
 * @description :: Server-side logic for managing Messages
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	send: function (req, res) {
		var myId = req.body.userId;
		var myName = req.body.userName;
		var toId = req.body.friendId;
		var circleId = req.body.circleId;
		var message = req.body.msg;

		var msgInfo = {circleId:circleId, fromId:myId, toId:toId, message:message, isRead:'1'};
		console.log(msgInfo);
		Message.create(msgInfo, function (err, msg) {
			// get count of all unread messages...
			var condition = {$or:[{"ownerId":toId}, {"friendId":toId}]};
			console.log (condition);
			UserCircle.find(condition, function (err, circles) {
				var count = 0;
				console.log ('--- circle count', circles.length);
				for (var i=0; i<circles.length; i++) {
					var circle = circles[i];
					if (circle.status == "invited") {
						count++;
					} else if (circle.status == "accepted") {
						if (circle.ownerId == toId) {
							count += circle.ownerUnread - 1 + 1;
						} else {
							count += circle.inviterUnread - 1 + 1;
						}
					}
				}

				Message.sendNotificationWithBadge(toId, 'message_sent', msg, myName + ": " + message, count + 1);
			});

			var socketId = sails.sockets.id(req.socket);
			sails.sockets.emit(socketId, 'message_sent', msg);
		});

		// Count Unread Message Count...
		UserCircle.findOne({id:circleId}, function (err, circle) {
			User.findOne({id:toId}, function (err, user) {
				if (circle.ownerId == toId) {
					circle.ownerUnread++;
				} else {
					circle.inviterUnread++;
				}
				console.log(circle);

				UserCircle.update({id:circle.id}, circle).exec(function (err, result){ console.log(err); console.log(result);});
				if (user.status == 'online') {
					sails.sockets.emit(user.session_id, 'circle_status', circle);
				}
			});
		});
	},
	messages: function(req, res) {
		var circleId = req.body.circleId;
		var createdDate = req.body.createdDate;

		var condition = {circleId:circleId};
		if (createdDate) {
			condition.createdAt = {'<' : createdDate};
		}

		console.log (condition);
		Message.find(condition).sort({createdAt:-1}).limit(20).exec(function (err, messages) {
			var socketId = sails.sockets.id(req.socket);
			sails.sockets.emit(socketId, 'message_fetched', {msg:messages});
		});
	}
};

