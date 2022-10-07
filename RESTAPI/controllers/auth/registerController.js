import Joi from "joi";
import { RefreshToken, User } from "../../models";
import CustomErrorHandler from "../../services/customErrorHandler";
import bcrypt from 'bcrypt';
import JWTService from "../../services/JwtService";
import { REFRESH_SECRET } from "../../config";

const registerController = {
    async register(req, res, next) {
        // Checklist
        // validate the request,authorize the request,check if user already present in database,prepare model,store in database,
        // generate jwt token,send response

        // [+] : Validate the Request
        console.log("Data :", req.body);
        const registerSchema = Joi.object({
            name: Joi.string().min(3).max(30).required(),
            email: Joi.string().email().required(),
            password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}')).required(),
            repeat_password: Joi.ref('password')

        });

        const { error } = registerSchema.validate(req.body);
        if (error) {
            return next(error);
        }

        // [+] : Check if a user exist already in the database or not
        try {
            const exist = await User.exists({ email: req.body.email });
            if (exist) {
                return next(CustomErrorHandler.alreadyExist('This email is already taken'));
            }
        } catch (err) {
            return next(err);
        }

        // [+] : Hash Password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // [+] : Prepare the model
        const { name, email } = req.body;
        const user = new User({
            name,
            email,
            password: hashedPassword
        });

        // [+] Save User in database
        let accessToken;
        let refreshToken;
        try {
            const result = await user.save();
            console.log("result :", result);
            // [+] : Generate token
            accessToken = JWTService.sign({ _id: result._id, role: result.role });
            refreshToken = JWTService.sign({ _id: result._id, role: result.role }, '1y', REFRESH_SECRET);

            // [+] : Save Refresh Token into an Database.
            await RefreshToken.create({ token: refreshToken });
        } catch (err) {
            return next(err);
        }

        // [+] Send Token
        res.json({ aceessToken: accessToken, refreshToken: refreshToken });
    }
}

export default registerController;