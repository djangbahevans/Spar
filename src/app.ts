import express from "express";
const app: express.Application = express();
import passport = require("passport");
import bodyParser = require("body-parser");
import { JwtStrategy } from "./config/passport";
import { AuthController, AccountController, GameController } from "./controllers";
import mongoose from 'mongoose';

const connString = 'mongodb://localhost/card_game';
mongoose.connect(connString, { useNewUrlParser: true }).then(() => {
    console.log('Connect to MongoDB')
}).catch((e) => {
    console.log('Something went terribly wrong', e)
    console.log('Aborting...')
    process.exit()
});

app.use(bodyParser.urlencoded( { extended: false }))
app.use(passport.initialize());
passport.use('jwt', JwtStrategy);

app.use('/auth', AuthController);
app.use('/account', AccountController);
app.use('/game', GameController);

const port: number = Number(process.env.PORT) || 8080;
app.listen(port, () => {
    console.log('Server is up');
});