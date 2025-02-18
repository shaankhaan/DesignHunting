// middlewares/ensureAuthenticated.js
module.exports = function ensureAuthenticated(req, res, next) {
    // Check if the user is logged in and is an admin
    if (req.session && req.session.user && req.session.user.isAdmin) {
      return next();
    }
    // If not authenticated as admin, redirect to the login page
    res.redirect("/login");
  };
  