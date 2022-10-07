import Joi from "joi";
import { RefreshToken, User } from "../../models";
import CustomErrorHandler from "../../services/customErrorHandler";
import bcrypt from 'bcrypt';
import JWTService from "../../services/JwtService";
import { REFRESH_SECRET } from "../../config";


const logoutController = {

    async logout(req, res, next) {
        // [+] : Validate the Request
        console.log("Data :", req.body);
        const refreshTokenSchema = Joi.object({
            refreshToken: Joi.string().required(),
        });
        const { error } = refreshTokenSchema.validate(req.body);
        if (error) {
            return next(error);
        }
        try {
            await RefreshToken.deleteOne({ token: req.body.refresh_token });
        } catch (err) {
            return next(new Error('Something went wrong in the database'));
        }

        res.json({ status: 1 });
    }
};

export default logoutController;