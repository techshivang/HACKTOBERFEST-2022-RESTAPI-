import { User } from "../../models";
import CustomErrorHandler from "../../services/customErrorHandler";

const userController = {
    async me(req, res, next) {
        try {
            const user = await User.findOne({ __id: req.user.__id }).select('-password -createdAt -updatedAt -__v');
            if (!user) {
                return next(CustomErrorHandler.notFound());
            }
            res.json(user);
        } catch (err) {
            return next(err);
        }
    }
}

export default userController;