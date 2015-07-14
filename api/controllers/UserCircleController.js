/**
 * UserCircleController
 *
 * @description :: Server-side logic for managing Usercircles
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	createCircle: function (req, res) {
		var ownerId = req.param('userId');
		var ownerName = req.param('ownerName');
		var friendId = req.param('friendId');
		var status = req.param('status');

		var jsonObj = {ownerId:ownerId, friendId:friendId, status:status, ownerUnread:0, inviterUnread:0};
		console.log(jsonObj);
		User.find ({"id":friendId}, function(err, users) {
			if (users.length > 0) {
				var friendInfo = users[0];
				UserCircle.create(jsonObj, function(err, circle) {
					if (err) {
						res.end(JSON.stringify({success:error}));
					}else {
						res.end(JSON.stringify({success:"YES", circle:circle, friendInfo:friendInfo}));
					}
				});

				// if friend is online or away, send socket event.
				if (friendInfo.status == 'online' || friendInfo.status == 'away') {
					console.log(friendInfo);
					sails.sockets.emit(friendInfo.session_id, 'circle_invited', {ownerName:ownerName, ownerId:ownerId});
				} else { // else send push notification
					Message.sendPush(friendInfo.deviceToken, 'You received an invitation from ' + ownerName);
				}
			} else {
				res.end(JSON.stringify({success:"Friend does not exist."}));
			}
		});
	  },
	myCircles: function (req, res) {
		  var ownerId = req.param('userId');
		  UserCircle.find({friendId:ownerId}, function(err, circles) {
				res.end(JSON.stringify(circles));
			});
	  },
	getCircleForFriend: function (req, res) {
		  var myUserId = req.param('userId');
		  var friendId = req.param('friendId');

		  console.log(req.param);

		  console.log([{ownerId:myUserId, friendId:friendId, status:'accepted'},
			  {friendId:myUserId, ownerId:friendId, status:'accepted'}]);
		  UserCircle.find({$or:[{ownerId:myUserId, friendId:friendId, status:'accepted'},
			  {friendId:myUserId, ownerId:friendId, status:'accepted'}]},
			  function(err, circles) {
				res.end(JSON.stringify(circles));
			});
	  },
	swapCircle: function (req, res) {
		  var userId = req.body.userId;
		  var userName = req.body.userName;
		  var circleId = req.body.circleId;
		  var friendId = req.body.friendId;

		  UserCircle.findOne({id:circleId}, function (err, cc) {
			  if (err) {
				  res.end(JSON.stringify({failed:"Circle does not exist."}));
			  } else {
				  cc.status = 'expired';
				  UserCircle.update({id:cc.id}, cc).exec(function (err, result) {});
				  var jsonObj = {ownerId:userId, friendId:friendId, status:'invited', ownerUnread:0, inviterUnread:0};
				  User.find ({"id":friendId}, function(err, users) {
					if (users.length > 0) {
						var friendInfo = users[0];
						UserCircle.create(jsonObj, function(err, circle) {
							if (err) {
								res.end(JSON.stringify({success:error}));
							}else {
								res.end(JSON.stringify({success:"YES", circle:circle, friendInfo:friendInfo}));
							}
						});

						// if friend is online or away, send socket event.
						if (friendInfo.status == 'online' || friendInfo.status == 'away') {
							sails.sockets.emit(friendInfo.session_id, 'circle_invited', {ownerName:userName, ownerId:userId});
						} else { // else send push notification
							Message.sendPush(friendInfo.deviceToken, 'You received an invitation from ' + userName);
						}
					} else {
						res.end(JSON.stringify({success:"Friend does not exist."}));
					}
				});
			  }
		  });
	  },
	updateCircleStatus: function (req, res) {
		  var circleId = req.param('circleId');
		  var status = req.param('status');
		  var friendName = req.param('friendName');

		  UserCircle.find({id:circleId}, function(err, circles) {
			  if (circles.length > 0) {
				  var circle = circles[0];
				  circle.createdAt = circle.updatedAt;
				  circle.status = status;
				  UserCircle.update({id:circle.id}, circle).exec(function (err, result) {
							console.log(err);
							console.log(result);
							if (err == null)
							{
								res.end(JSON.stringify(result[0]));
							}
							else
							{
								res.end('{"status":"failed"}');
							}
						});
			  } else {
				  res.end(JSON.stringify({success:"Circle does not exist."}));
			  }

			  if (status == 'accepted') {
				  Message.sendNotification(circle.ownerId, 'circle', {type:'statusUpdated', circleId:circleId, status:status},
					  'You and ' + friendName + ' like each other! You now have 24 hours to chat');
			  } else {
				  Message.sendNotification(circle.ownerId, 'circle', {type:'statusUpdated', circleId:circleId, status:status},
					  friendName + ' rejected your invitation');
			  }
		  });
	  },
};

