// src/routes/residentRoutes.ts

import { Router } from "express";
import ResidentController from "./residentController";
import AuthMiddleware from "src/middlewares/Auth";

const router = Router();
const residentController = new ResidentController();

router.post(
  "/",
  AuthMiddleware.isAuthenticatedUser,
  residentController.createResident
);
router.put(
  "/:residentId",
  AuthMiddleware.isAuthenticatedUser,
  residentController.updateResident
);
router.get(
  "/:residentId",
  AuthMiddleware.isAuthenticatedUser,
  residentController.getResident
);
router.get(
  "/:homeId/all",
  AuthMiddleware.isAuthenticatedUser,
  residentController.getResidents
);

export default router;
