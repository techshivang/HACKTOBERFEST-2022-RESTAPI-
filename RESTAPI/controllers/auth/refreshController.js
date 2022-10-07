import Joi from "joi";
import { RefreshToken, User } from "../../models";
import CustomErrorHandler from "../../services/customErrorHandler";
import JWTService from "../../services/JwtService";
import { REFRESH_SECRET } from "../../config";

const refreshController = {
    async refresh(req, res, next) {
        // [+] : Validate the Request
        console.log("Data :", req.body);
        const refreshTokenSchema = Joi.object({
            refreshToken: Joi.string().required(),
        });
        const { error } = refreshTokenSchema.validate(req.body);
        if (error) {
            return next(error);
        }
        // [+] : Check if a  exist in the database or not
        let refreshToken;
        try {
            refreshToken = await RefreshToken.findOne({ token: req.body.refreshToken });
            if (!refreshToken) {
                return next(CustomErrorHandler.unAuthorized('Invalid refresh Token !!'));
            }

            // [+] : Validate refresh Token
            let userID;
            try {
                const { _id } = await JWTService.verify(req.body.refreshToken, REFRESH_SECRET);
                userID = _id;
            } catch (err) {
                return next(err);
            }

            // console.log("USER ID :", userID);

            // [+] : Verify whether this user is exist in our database or not.
            let user;
            try {
                user = await User.findOne({ __id: userID });
                if (!user) {
                    return next(CustomErrorHandler.unAuthorized('No records found !!'));
                }
            } catch (err) {
                return next(err);
            }

            // [+] : Generate the New refresh and access Token
            // [+] : Genearte Token

            let newaccessToken;
            let newrefreshToken;
            try {
                newaccessToken = JWTService.sign({ _id: user._id, role: user.role });
                newrefreshToken = JWTService.sign({ _id: user._id, role: user.role }, '1y', REFRESH_SECRET);
                // [+] : Save Refresh Token into an Database.
                await RefreshToken.create({ token: newrefreshToken });
                res.json({ accessToken: newaccessToken, refreshToken: newrefreshToken });
            } catch (err) {
                return next(err);
            }

        } catch (err) {
            return next('Something went wrong ' + err.message);
        }

    }
}

export default refreshController;