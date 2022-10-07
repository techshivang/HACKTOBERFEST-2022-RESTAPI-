import Joi from "joi";
import { RefreshToken, User } from "../../models";
import CustomErrorHandler from "../../services/customErrorHandler";
import bcrypt from 'bcrypt';
import JWTService from "../../services/JwtService";
import { REFRESH_SECRET } from "../../config";

const loginController = {
    async login(req, res, next) {
        // [+] : Validate the Request
        console.log("Data :", req.body);
        const loginSchema = Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}')).required(),
        });
        const { error } = loginSchema.validate(req.body);
        if (error) {
            return next(error);
        }
        // [+] : Check if a email exist in the database or not
        let user;
        try {
            user = await User.findOne({ email: req.body.email });
            if (!user) {
                return next(CustomErrorHandler.unAuthorized());
            }
        } catch (err) {
            return next(err);
        }

        // [+] : compare the password
        const match = await bcrypt.compare(req.body.password, user.password);
        if (!match) {
            return next(CustomErrorHandler.unAuthorized());
        }

        // [+] : Genearte Token
        let accessToken;
        let refreshToken;
        try {
            accessToken = JWTService.sign({ _id: user._id, role: user.role });
            refreshToken = JWTService.sign({ _id: user._id, role: user.role }, '1y', REFRESH_SECRET);
            // [+] : Save Refresh Token into an Database.
            await RefreshToken.create({ token: refreshToken });
        } catch (err) {
            return next(err);
        }

        // [+] send Token
        res.json({ accessToken: accessToken, refreshToken: refreshToken });

    }
}

export default loginController;