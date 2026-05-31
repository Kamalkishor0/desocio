import { Router } from 'express';
import { createPost, deletePost, getAllPosts, getPostById } from '../controllers/post.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { uploadPostPhotos } from '../middlewares/upload.middleware';

const router = Router();

router.post('/', authMiddleware, uploadPostPhotos.array('photos', 6), createPost);
router.get('/', authMiddleware, getAllPosts);
router.get('/:id', authMiddleware, getPostById);
router.delete('/:id', authMiddleware, deletePost);

export default router;