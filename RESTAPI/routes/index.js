import express from "express";

const router = express.Router();
import { loginController, registerController, userController, refreshController, logoutController, productController } from '../controllers';
import admin from "../middlewares/admin";
import auth from "../middlewares/auth";

// Auth Routes
router.post('/register', registerController.register);
router.post('/login', loginController.login);
router.get('/me', auth, userController.me);
router.post('/refreshToken', refreshController.refresh);
router.post("/logout", auth, logoutController.logout);

// Products Routes
router.post("/products", [auth, admin], productController.store);
router.put("/products/:id", [auth, admin], productController.update);
router.delete("/products/:id", [auth, admin], productController.delete);
router.get("/products", productController.fetchProduct);
router.get("/products/:id", productController.fetchSingleProduct);

export default router;