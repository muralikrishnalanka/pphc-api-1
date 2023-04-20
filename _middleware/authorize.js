const jwt = require('express-jwt').expressjwt;
const { secret } = require('config.json');
const db = require('_helpers/db');

module.exports = authorize;

function authorize(roles = []) {
    
  if (!Array.isArray(roles)) {
    roles = [roles];
  }
  console.log("###Roles"+ JSON.stringify(roles))
  function authenticateJwt() {
    return jwt({ secret, algorithms: ['HS256'] });
  }


  return [
    authenticateJwt(),
    async (req, res, next) => {
      const account = await db.Account.findByPk(req.user.sub);

      if (!account || (roles.length && !roles.includes(account.role))) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      req.user.role = account.role;
      const refreshTokens = await account.getRefreshTokens();
      req.user.ownsToken = token => refreshTokens.map(t => t.token).includes(token);
      next();
    }
  ];
}
