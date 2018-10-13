import { Router, Request, Response } from "express";
import passport from "passport";
import { validateUser, User } from "../models/users";
import bcrypt from "bcrypt";

const router: Router = Router()

router.get('/', passport.authenticate('jwt', { session: false }),
    async (req: Request, res: Response) => {
        const user = await User.findOne({ username: req.user.username });
        return res.send(user);
    });

// @route   POST /account/register
// @desc    Register user
// @access  Public
router.post('/register', async (req: Request, res: Response) => {
    const { username, email, name } = req.body
    let { password } = req.body

    let error: string = '';
    await validateUser(req.body).catch((err) => {
        error = err.details[0].message;
    });
    if (error) return res.status(400).send(error);

    let user: any = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send("User already registered.");

    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);

    user = new User({
        name,
        email,
        password,
        username
    });

    await user.save();
    const token = user.generateAuthToken();
    res
        .header('x-auth-token', token)
        .send({
            name, username, email
        })
});

// @route   DELETE /account/delete
// @desc    Delete account
// @access  Members
router.delete('/delete', passport.authenticate('jwt', { session: false }),
    async (req: Request, res: Response) => {
        const { email, password } = req.body
        const user: any = await User.findOne({ email: req.body.email });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.send("Password invalid");

        await User.deleteOne({ email })
        return res.send(user);
    });

export const AccountController: Router = router