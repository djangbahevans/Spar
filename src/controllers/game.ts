import { Request, Response, Router } from "express";
import passport from "passport";
import { Game } from "../models/game";
import { User } from "../models/users";
import { deck, Card, CardType, CardNumber } from "../models/Card";
import shuffle from "../utilities/shuffle";

const router: Router = Router();

// @route   POST /game/create
// @desc    Creates a new game
// @access  Members
router.post('/create', passport.authenticate('jwt', { session: false }),
    async (req: Request, res: Response) => {
        const { username } = req.user;
        const user: any = await User.findOne({ username });

        const game: any = new Game({
            lead: username
        });
        game.players.push({
            username,
            playedCards: [],
            currentCards: []
        })
        await game.save();

        user.games.push(game);
        user.save();
        return res.send(game);
    });

// @route   POST /game/join/:id
// @desc    Join game
// @access  Members
router.post('/join/:id', passport.authenticate('jwt', { session: false }),
    async (req: Request, res: Response) => {
        let game: any = await Game.findById(req.params.id);
        if (!game) return res.status(404).send("Game with the indicated id does not exist");

        if (game.players.length > 7) return res.status(400).send("Maximum number of players reached");

        for (let i = 0; i < game.players.length; i++) {
            const player = game.players[i];
            if (player.username === req.user.username) {
                return res.status(400).send("Player already in this game");
            }
        }
        const { username } = req.user
        const user: any = await User.findOne({ username })
        user.games.push(game);
        user.save();

        game.players.push({
            username,
            playedCards: [],
            currentCards: []
        });

        await game.save();
        return res.send(game);
    });

// @route   DELETE /game/leave/:id
// @desc    Leave game
// @access  Members
router.delete('/leave/:id', passport.authenticate('jwt', { session: false }),
    async (req: Request, res: Response) => {
        let game: any = await Game.findById(req.params.id);
        if (!game) return res.status(404).send("Game with the indicated id does not exist");

        let players = game.players.filter((player: any) => player.username !== req.user.username);
        game.players = players;
        if (game.players.length === 0) { await game.remove() }
        else { await game.save(); }

        const user: any = await User.findOne({ username: req.user.username });
        const games = user.games.filter((game: any) => game._id !== req.params.id);
        if (games.length !== user.games.length) {
            user.games = games;
            user.save();
        } else {
            return res.status(400).send("You are not in this game");
        }

        return res.send(game);
    });

// @route   POST /game/shuffle/:id
// @desc    Shuffle and share cards
// @access  Members
router.post('/shuffle/:id', passport.authenticate('jwt', { session: false }),
    async (req: Request, res: Response) => {
        let shuffledDeck = shuffle(deck);
        const game: any = await Game.findById(req.params.id);
        for (let i = 0; i < game.players.length; i++) {
            game.players[i].currentCards = shuffledDeck.splice(0, 5);
            game.players[i].playedCards=[];
        }
        game.save();
        return res.send(game);
    });

router.post('/deal/:id', passport.authenticate('jwt', { session: false }),
    async (req: Request, res: Response) => {
        const { username } = req.user;
        const { type, number } = req.body;
        const card = new Card(<CardType>CardType[type], <CardNumber>CardNumber[number]);

        const game: any = await Game.findById(req.params.id);
        if (!game) return res.status(404).send("Game does not exist")
        let currPlayer = game.players.find((player: any) => username === player.username);

        // Test if player has card
        if (!(card.inCards(<Card[]>currPlayer.currentCards))) return res.status(400).send("Player does not have this card");

        // If player is not lead and lead has not played yet
        if (game.lead !== username && !game.leadCard) return res.status(400).send("Lead has not played yet")

        // Conditions for when a lead plays
        if (game.lead === username && !game.leadCard) {
            game.leadCard = card; // Set card to be lead
            // Remove card from currentCards and add to playedCards
            game.players = game.players.map((player: any) => {
                if (player.username !== username) return player;
                player.currentCards = player.currentCards
                    .filter((cCard: Card) => {
                        const keep = cCard.type !== card.type || cCard.number !== card.number;
                        if (!keep) player.playedCards.push(cCard) // Add card to playedCards
                        return keep;
                    });
                currPlayer=player;
                return player;
            });
            game.save();
            return res.send(currPlayer);
        }

        if (game.lead === username && game.leadCard) {
            return res.status(400).send("You have already played");
        }
            

        // If a player plays legally
        if (game.lead !== username && game.leadCard) {
            if (type !== game.leadCard.type) {
                // Check if user has same card type
                for (let i = 0; i < currPlayer.currentCards.length; i++) {
                    const card = currPlayer.currentCards[i];
                    if (card.type === game.leadCard.type) {
                        return res.status(400).send("You have to play similar cards if you them");
                    }
                }
            }
            // Remove card from currentCards and add to playedCards
            game.players = game.players.map((player: any) => {
                if (player.username !== username) return player;
                player.currentCards = player.currentCards
                    .filter((cCard: Card) => {
                        const keep = cCard.type !== card.type || cCard.number !== card.number;
                        if (!keep) player.playedCards.push(cCard) // Add card to playedCards
                        return keep;
                    });
                currPlayer = player;
                return player;
            });
        }
        game.save();
        return res.send(currPlayer);
    });

export const GameController: Router = router;