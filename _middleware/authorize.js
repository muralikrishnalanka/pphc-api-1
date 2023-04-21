const jwt = require('express-jwt').expressjwt;
const { secret } = require('config.json');
const db = require('_helpers/db');
const { json } = require('body-parser');
//const flatted = require('flatted');

const CircularJSON = require('circular-json');


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

     // console.log(flatted(req));
      console.log('req user'+ JSON.stringify(req.auth))
      const account = await db.Account.findByPk(req.auth.id);
      var isaccount= false
      if(account){
         isaccount = true
      }

      if (!account || (roles.length && !roles.includes(account.role))) {
        return res.status(401).json({ message: 'Unauthorized inAutorizemethod'+ isaccount +JSON.stringify(req.auth.id)});
      }

      req.auth.role = account.role;
      const refreshTokens = await account.getRefreshTokens();
      req.auth.ownsToken = token => refreshTokens.map(t => t.token).includes(token);
      next();
    }
  ];
}
