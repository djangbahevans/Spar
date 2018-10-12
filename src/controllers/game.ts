import { Request, Response, Router } from "express";
import passport from "passport";
import { Game } from "../models/game";
import { User } from "../models/users";

const router: Router = Router()

router.post('/create', passport.authenticate('jwt', { session: false }),
    async (req: Request, res: Response) => {
        const { username } = req.user;
        const user: any = await User.findOne({ username });

        const game: any = new Game();
        game.players.push({
            username,
            isLead: false,
            playedCards: [],
            currentCards: []
        })
        user.games.push(game);
        await game.save();


        return res.send(game);
    });

router.post('/join/:id', passport.authenticate('jwt', { session: false }),
    async (req: Request, res: Response) => {
        let game: any = await Game.findById(req.params.id);
        if (!game) return res.status(404).send("Game with the indicated id does not exist");

        for (let i = 0; i < game.players.length; i++) {
            const player = game.players[i];
            if (player.username === req.user.username) {
                return res.status(401).send("Player already in this game");
            }
        }

        game.players.push({
            username: req.user.username,
            isLead: false,
            playedCards: [],
            currentCards: []
        });

        await game.save();
        return res.send(game);
    });

router.delete('/leave/:id', passport.authenticate('jwt', { session: false }),
    async (req: Request, res: Response) => {
        let game: any = await Game.findById(req.params.id);
        if (!game) return res.status(404).send("Game with the indicated id does not exist");

        let players = game.players.filter((player: any) => player.username !== req.user.username);
        game.players = players;
        await game.save()

        return res.send(game);
    });

export const GameController: Router = router;