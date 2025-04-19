function verifyDev(req, res, next) {
    if (!req.session.user || req.session.user.role !== 'dev') {
      return res.status(403).json({ error: 'Developer access only' });
    }
    next();
  }
  
module.exports = verifyDev;
  