import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "../models/users";

var opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('JWT'),
    secretOrKey: 'secret',
}

export const JwtStrategy = new Strategy(opts, async (jwt_payload, done) => {
    const user = await User.findOne({ username: jwt_payload.username });
    if (!user) return done(null, false);
    
    return done(null, user);
});