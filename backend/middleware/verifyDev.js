function verifyDev(req, res, next) {
    if (req.session?.role === 'dev') {
      return next();
    } else {
      return res.status(403).json({ error: 'Developer access only' });
    }
  }
  
  module.exports = verifyDev;
  