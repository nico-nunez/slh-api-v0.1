const isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        req.session.redirectedFrom = req.originalUrl
        req.flash('error', 'Must be logged in.');
        return res.redirect('/users/login');
    }
    next();
}


module.exports = {
    isLoggedIn,
}