/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	login: function (req, res) {
		//console.log(User.create(req.body).done);
		var fbId = req.body.fbId;
		var findQuery = '{"fbId":"' + fbId + '"}';

		var userInfo;
		var getUserPhotos = function () {
			UserPhotos.find({"userId":userInfo.id}, function(err, photos) {
				userInfo.photos = photos;
				getUserStatus();
			});
		}

		var getUserStatus = function () {
			UserCircle.find({$or:[{ownerId:userInfo.id}, {friendId:userInfo.id}]}, function(err, circles) {
				userInfo.circles = circles;
				res.end(JSON.stringify(userInfo));
			});
		}

		console.log(req.body);

		User.find ({"fbId":fbId}, function(err, users) {
			if (users.length > 0) {
				console.log(User.adapter.createIndex);
				userInfo = users[0];

				var ageDifMs = Date.now() - userInfo.birthDate.getTime();
				var ageDate = new Date(ageDifMs); // miliseconds from epoch
				userInfo.age = Math.abs(ageDate.getUTCFullYear() - 1970);

				getUserPhotos();
			} else {
				console.log(req.body);

				User.create(req.body, function(err, user) {
					console.log(err);
					userInfo = user;

					var newPhoto = {
						userId:user.id,
						fbPhotoId:user.id,
						photoUrl:user.photoUrl,
						thumbnailUrl:user.photoUrl
					};

					console.log(newPhoto);

					UserPhotos.create(newPhoto, function (err, photo) {
						console.log(err);
						getUserPhotos();
					});
					//User.createIndex({location:"2dsphere"});
				});
			}
		});
	  },
	fetchUserProfile: function (req, res) {
		  var userId = req.param('userId');
		  User.find ({"id":userId}, function(err, users) {
			if (users.length > 0) {
				res.end(JSON.stringify({success:"YES", userinfo:users[0]}));
			} else {
				res.end(JSON.stringify({success:"User does not exist."}));
			}
		});
	  },
	photos: function (req, res) {
		  var userId = req.param('userId');

		  UserPhotos.find({"userId":userId}, function(err, photos) {
			  if (err == null)
			  {
				  res.write('{"status":"ok", "photos":' + JSON.stringify(photos) + '}');
			  }
			  else
			  {
				  res.write('{"status":"error", "content":"' + err + '"}');
			  }
			  res.end();
		  });
	},
	explore: function (req, res) {
		var startDate = new Date();
		var endDate = new Date();
		startDate.setYear(startDate.getYear() - req.body.age[1]);
		endDate.setYear(endDate.getYear() - req.body.age[0]);

		console.log(req.body.location);
		var condition = {
			location:{
				$geoWithin:{
					$centerSphere:[
						[req.body.location[0][0],
						req.body.location[0][1]
						], req.body.location[1]
					]
				}
			},
			birthDate: {$gte:startDate, $lt:endDate}
		}

		if (req.body.gender != 'all') {
			condition.sex = req.body.gender;
		}

		console.log(req.body);
		console.log(condition);
		User.find(condition).exec(function(err, users) {
			if (err == null){
				res.write('{"status":"ok", "users":' + JSON.stringify(users) + '}');
			} else {
				res.write('{"status":"error", "content":"' + err + '"}');
			}
			res.end();
		});
	},
	savePhoto: function (req, res) {
		var reqJSON = req.body;
		var photos = reqJSON.photos;
		var userId = reqJSON.userId;
		
		UserPhotos.destroy({"userId":userId}, function (err, result) {
			for (var i=0; i<photos.length; i++)
			{
				var photoItem = photos[i];
				photoItem.userId = userId;
			}
			UserPhotos.create(photos, function(err, photos) {
				if (err == null)
				{
					res.write('{"status":"ok", "photos":' + JSON.stringify(photos) + '}');
				}
				else
				{
					res.write('{"status":"error", "content":"' + err + '"}');
				}
				res.end();
			});
		});
	},
	saveSettings: function (req, res) {
		var reqJSON = req.body;
		var userId = reqJSON.userId;
		User.findOne({id:userId}, function (err, user) {
			if (user) {
				user.settings = reqJSON.settings;
				User.update({id:user.id}, user).exec(function (err, result){
					res.end(JSON.stringify({status:"ok"}));
				});
			}
		});
	},
	saveProfilePhoto: function (req, res) {
		var userId = req.body.userId;
		var photoUrl = req.body.photoUrl;
		User.findOne({"id":userId}, function(err, user) {
			console.log(err);
			if (err) {
				res.end('{"err":"failed"}');
			} else {
				user.photoUrl = photoUrl;
				User.update({"id":user.id}, user).exec(function (err, result) {
					res.end('{"success":"yes"}');
				});
			}
		});
	},
	updateVideo: function (req, res) {
		if(req.method === 'GET')
			return res.json({'err':'GET not allowed'});						

		var userId = req.param('userId');
		var uploadFile = req.files.videoFile;

		// move to real upload folder...
		var fs = require('fs');
		var tmp_path = uploadFile.path;
		var target_path = './assets/videos/' + userId + '.mp4';

		fs.createReadStream(tmp_path).pipe(fs.createWriteStream(target_path).on("close", function() {
			fs.unlink(tmp_path, function(err) {
				if (err) throw err;
			});

			// update user video url
			User.find({"id":userId}, function(err, users) {
				console.log(err);
				if (err != null || users.length == 0)
				{
					res.end('{"err":"failed"}');
				}
				else
				{
					var userInfo = users[0];
					var protocol = req.connection.encrypted?'https':'http';
					var baseUrl = protocol + '://' + req.headers.host + '/';

					userInfo.videoUrl = baseUrl + "videos/" + userId + ".mp4";
					User.update({"id":userId}, userInfo).exec(function (err, result) {
						console.log(err);
						console.log(result);
						if (err == null)
						{
							res.end(JSON.stringify(result[0]));
						}
						else
						{
							res.end('{"err":"failed"}');
						}
					});
				}
			});
		}));
	}
};

