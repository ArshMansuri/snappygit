const express = require('express');
const { createPost, deletePost,likeAndUnlike, updatePost, pushComment, deleteCommetUser, getFollowingUserPost, getAllComment, getAllLike, getAllLikedPost, alreadyLikeOrUnlike, getOwnerPost, getAllLikeId, getSinglePost, getExplorePost} = require('../controller/post');
const {isAuthor} = require('../config/auth');
const router = express.Router();

router.route('/user/upload').post(isAuthor, createPost)

router.route('/user/post/:id').get(isAuthor, likeAndUnlike)
    .delete(isAuthor, deletePost)
    .put(isAuthor, updatePost)
    .post(isAuthor, pushComment)

router.route('/explore/posts/:skip').get(isAuthor, getExplorePost)

router.route('/user/comment/:id').get(isAuthor, getAllComment).delete(isAuthor, deleteCommetUser)
router.route('/user/like/:id').get(isAuthor, getAllLike)

router.route('/users/posts').get(isAuthor, getFollowingUserPost);
router.route('/liked/posts').get(isAuthor, getAllLikedPost)
router.route('/post/:postId').get(isAuthor, getSinglePost)

router.route('/likeIds/post/:id').get(isAuthor, getAllLikeId)



module.exports = router