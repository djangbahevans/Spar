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
        const games = user.games.filter((id: any) => id.toString() != req.params.id);
        user.games = games;
        user.save();

        return res.send(game);
    });

// @route   POST /game/shuffle/:id
// @desc    Shuffle and share cards
// @access  Members
router.post('/shuffle/:id', passport.authenticate('jwt', { session: false }),
    async (req: Request, res: Response) => {
        let shuffledDeck = shuffle(JSON.parse(JSON.stringify(deck)));
        
        const game: any = await Game.findById(req.params.id);
        for (let i = 0; i < game.players.length; i++) {
            game.players[i].currentCards = [];
            for (let j = 0; j < 5; j++) {
                const n: number = Math.round(Math.random() * shuffledDeck.length)
                game.players[i].currentCards.push(shuffledDeck.splice(n, 1)[0]);
            }
            game.players[i].playedCards=[];
        }
        game.currentCards = [];
        game.leadCard = undefined;
        game.save();
        return res.send(game);
    });

// @route   POST /deal/:id
// @desc    Deal card
// @access  Members
router.post('/deal/:id', passport.authenticate('jwt', { session: false }),
    async (req: Request, res: Response) => {
        const { username } = req.user;
        const { type, number } = req.body;
        const card = new Card(<CardType>CardType[type], <CardNumber>CardNumber[number]);

        const game: any = await Game.findById(req.params.id);
        if (!game) return res.status(404).send("Game does not exist")
        
        if (game.currentCards.find((card: any) => card.username === username))
            return res.status(400).send("You have already played")
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
                    .filter((cCard: Card) =>  cCard.type !== card.type || cCard.number !== card.number);
                player.playedCards.push(card)
                currPlayer=player;
                return player;
            });
            game.currentCards.push({
                username,
                card
            });
            // Check/set game state
            if (game.players.length === game.currentCards.length) {// Everybody's played
                let { leadCard, lead } = game;
                for (let i = 0; i < game.currentCards.length; i++) {
                    const playedCard = game.currentCards[i];
                    if (parseInt(playedCard.number) > parseInt(leadCard.number)) {
                        leadCard = playedCard
                        lead = playedCard.username
                    }
                }
                game.leadCard = leadCard;
                game.lead = lead;
            }
            game.save();
            return res.send(currPlayer);
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
                    .filter((cCard: Card) => cCard.type !== card.type || cCard.number !== card.number);
                player.playedCards.push(card) // Add card to playedCards
                currPlayer = player;
                return player;
            });
            game.currentCards.push({
                username,
                card
            });
        }

        // After everything
        if (game.players.length === game.currentCards.length) {// Everybody's played
            let { leadCard, lead } = game;
            for (let i = 0; i < game.currentCards.length; i++) {
                const playedCard = game.currentCards[i];
                if (leadCard.type === playedCard.type && parseInt(playedCard.card.number) > parseInt(leadCard.number)) {
                    lead = playedCard.username;
                }
            }
            game.lead = lead;
            game.leadCard = undefined;
        }
        game.currentCards = [];
        game.save();
        return res.send(currPlayer);
    });

export const GameController: Router = router;