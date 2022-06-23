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
        //header에는 type, 알고리즘 종류
        // payload 유저정보
        // signature 개인키로 서명한 전자 서명
          const token = jwt.sign(payload, key, options);
          return token;
    },

    verify: async (token) => {
        let decoded;
        try {
            decoded = jwt.verify(token, key);
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

