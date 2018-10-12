import bcrypt from 'bcrypt';
import passport from "passport";
import { Request, Response, Router } from "express";
import { User } from "../models/users";

const router: Router = Router();

router.post('/login', async (req: Request, res: Response) => {
    const { username, password } = req.body;

    const user: any = await User.findOne({ username });
    if (!user) return res.send("Invalid username or password");

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.send("Invalid username or password");
    
    const token = user.generateAuthToken();
    res.send(token);
});

export const AuthController = router;