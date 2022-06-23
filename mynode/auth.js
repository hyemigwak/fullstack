require('dotenv').config();
const jwt = require("jsonwebtoken");

const key = process.env.secret_key;
const options = {
    algorithm: "HS256",
    expiresIn: "30m",
    issuer: "issuer"
}

module.exports = {
    sign: async (user) => {
        const payload = {
            email: user.email,
            password: user.password
        };
          const token = jwt.sign(payload, key, options);
          return token;
    },

    verify: async (token) => {
        let decoded;
        try {
            decoded = jwt.verify(token, key);
            console.log(decoded,"decoded");
        } catch (err) {
            if (err.message === 'jwt expired') {
                return "jwt expired";

            } else {
                return "jwt not validate";
            }
        }
        return decoded
    }
};

