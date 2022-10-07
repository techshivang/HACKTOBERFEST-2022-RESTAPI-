class CustomErrorHandler extends Error {
    constructor(status, message) {
        super();
        this.status = status;
        this.message = message;
    }

    static alreadyExist(message) {
        return new CustomErrorHandler(409, message);
    }

    static unAuthorized(message = "email or password is wrong !!") {
        return new CustomErrorHandler(401, message);
    }

    static notFound(message = "User not Exist!!") {
        return new CustomErrorHandler(404, message);
    }

    static serverError(message = "Internal Server Error") {
        return new CustomErrorHandler(500, message);
    }
};

export default CustomErrorHandler;