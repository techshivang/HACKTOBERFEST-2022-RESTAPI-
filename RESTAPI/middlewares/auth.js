import CustomErrorHandler from "../services/customErrorHandler";
import JWTService from "../services/JwtService";

const auth = async (req, res, next) => {
    let authHeader = req.headers;
    console.log("Headers :", authHeader);
    if (!authHeader) {
        return next(CustomErrorHandler.unAuthorized());
    }
    const token = authHeader.authorization.split(" ")[1];
    console.log("Token :", token);
    try {
        const { _id, role } = await JWTService.verify(token);
        req.user = {};
        req.user._id = _id;
        req.user.role = role;
        console.log("request", req.user);
        next();
    } catch (err) {
        // console.log("error :", err);
        return next(CustomErrorHandler.unAuthorized("Unautorized !!"));
    }

};

export default auth;