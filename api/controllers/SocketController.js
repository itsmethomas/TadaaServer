/**
 * SocketController
 *
 * @description :: Server-side logic for managing Sockets
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	// socket signin
	signin: function(req, res) {
		var userId = req.body.userId;
		console.log('---------- Socket Signin Request');
		User.find({id:userId}, function (err, users) {
			if (users.length > 0) {
				var user = users[0];
				user.session_id = sails.sockets.id(req.socket);
				user.status = 'online';
				User.update({id:user.id}, user).exec(function (err, result) {
					if (err) {
						console.log('------------ Register Session Error');
						console.log(err);
					}
				});
			} else {
				console.log('Invalid Signin Request');
			}
		});
	},
	updateStatus: function (req, res) {
		var userId = req.body.userId;
		var status = req.body.status;
		console.log('---------- Socket status update');
		User.find({id:userId}, function (err, users) {
			if (users.length > 0) {
				var user = users[0];
				user.session_id = sails.sockets.id(req.socket);
				user.status = status;
				User.update({id:user.id}, user).exec(function (err, result) {
					if (err) {
						console.log('------------ Status Update Error');
						console.log(err);
					}
				});
			} else {
				console.log('Invalid Signin Request');
			}
		});
	},
	updateReads: function (req, res) {
		  var circleId = req.body.circleId;
		  var userId = req.body.userId;
		  UserCircle.findOne({id:circleId}, function (err, circle) {
			  if (circle.ownerId == userId) {
				  circle.ownerUnread = 0;
			  } else {
				  circle.inviterUnread = 0;
			  }
			  UserCircle.update({id:circle.id}, circle).exec(function (err, res){});
		  });
	  },
	allStatus: function (req, res) {
		  var userId = req.body.userId;
		  var condition = {$and:[{$or:[{"ownerId":userId}, {"friendId":userId}]}, {$or:[{"status":"accepted"}, {"status":"invited"}]}]};
		  UserCircle.find(condition, function (err, circles) {
			  var session_id = sails.sockets.id(req.socket);
			  sails.sockets.emit(session_id, 'all_status', {circles:circles});
		  });
	  }
};

