import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    const token=req.cookies.jwt;
    if(!token) return res.status(401).send("You are Unauthorized");

    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
        if(err) return res.status(403).send("Invalid Token");
        req.userId=payload.userId;
        next();
    });
};