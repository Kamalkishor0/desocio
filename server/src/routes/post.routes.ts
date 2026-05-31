import { Router } from 'express';
import { createPost, deletePost, getAllPosts, getPostById, reactToPost, getReactOfPost, commentOnPost, getCommentsForPost, deleteComment } from '../controllers/post.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { uploadPostPhotos } from '../middlewares/upload.middleware';

const router = Router();

router.post('/', authMiddleware, uploadPostPhotos.array('photos', 6), createPost);
router.get('/', authMiddleware, getAllPosts);
router.get('/:id', authMiddleware, getPostById);
router.delete('/:id', authMiddleware, deletePost);
router.post('/:id/react', authMiddleware, reactToPost);
router.get('/:id/react', authMiddleware, getReactOfPost);
router.post('/:id/comment', authMiddleware, commentOnPost);
router.get('/:id/comments', authMiddleware, getCommentsForPost);
router.delete('/comment/:commentId', authMiddleware, deleteComment);
//implement share mechanism later
export default router;