import flash from "connect-flash";

export const flashMiddleware = (req, res, next) => {
    // Ensure flash messages are available in all views
    res.locals.errorMessage = req.flash("error") || [];
    res.locals.successMessage = req.flash("success") || [];
    next();
};
