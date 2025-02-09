import flash from "connect-flash";

export const flashMiddleware = (req, res, next) => {
    res.locals.errorMessage = req.flash("error"); // Pass flash message to views
    next();
};
