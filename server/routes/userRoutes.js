import express from "express";
import { auth } from "../middlewares/auth.js";
import { getPublishedCreations, getUserCreations, toggleLikeCreation, getUserData, updateUserPlan } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get('/get-user-data', auth, getUserData);
userRouter.post('/update-plan', auth, updateUserPlan);
userRouter.get('/get-user-creations', auth, getUserCreations);
userRouter.get('/get-published-creations', getPublishedCreations);
userRouter.post('/toggle-like-creation', auth, toggleLikeCreation);

export default userRouter;