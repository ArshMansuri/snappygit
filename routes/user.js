const express = require('express');
const { signin, login, followAndUnFollow, logout, updatePassWord, updateProfile, ownerProfile, ownerFollowers, ownerFollowings, friendProfile, loadUser, searchUser, friFollowers, friFollowings, suggestionUsers, avatarUpdate } = require('../controller/user');
const router = express.Router();
const {isAuthor} = require('../config/auth')

router.route('/user/signin').post(signin);
router.route('/user/login').post(login);
router.route('/user/logout').get(logout);

router.route('/user/:id').get(isAuthor, followAndUnFollow);

router.route('/update/password').put(isAuthor, updatePassWord);

router.route('/update/profile').put(isAuthor, updateProfile);
router.route('/update/avatar').put(isAuthor, avatarUpdate);

router.route('/me/profile').get(isAuthor, ownerProfile);

router.route('/me').get(isAuthor, loadUser);

router.route('/me/follower').get(isAuthor, ownerFollowers);

router.route('/me/following').get(isAuthor, ownerFollowings);

router.route('/stranger/profile/:id').get(isAuthor, friendProfile);

router.route('/stranger/followers/:id').get(isAuthor, friFollowers);
router.route('/stranger/following/:id').get(isAuthor, friFollowings);

router.route('/search/:key').get(isAuthor, searchUser)

router.route('/me/suggestion').get(isAuthor, suggestionUsers)

module.exports = router