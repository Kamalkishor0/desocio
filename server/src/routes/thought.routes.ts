import { Router } from "express";
import {
	commentOnThought,
	createThought,
	deleteThought,
	getAllThoughts,
	getCommentsForThought,
	getThoughtSavers,
	getThoughtSupporters,
	getThoughtById,
	saveThought,
	supportThought,
	unsaveThought,
	unsupportThought,
} from "../controllers/thought.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
//Will implement thought control mechanism later
router.post('/', authMiddleware, createThought);
router.get('/', authMiddleware, getAllThoughts);
router.get('/:id', authMiddleware, getThoughtById);
router.delete('/:id', authMiddleware, deleteThought);
router.post('/:id/support', authMiddleware, supportThought);
router.delete('/:id/support', authMiddleware, unsupportThought);
router.get('/:id/support', authMiddleware, getThoughtSupporters);
router.post('/:id/save', authMiddleware, saveThought);
router.delete('/:id/save', authMiddleware, unsaveThought);
router.get('/:id/save', authMiddleware, getThoughtSavers);
router.post('/:id/comments', authMiddleware, commentOnThought);
router.get('/:id/comments', authMiddleware, getCommentsForThought);

export default router;