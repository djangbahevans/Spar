import mongoose from "mongoose";

const GameSchema = new mongoose.Schema({
    players: [{
        username: {
            type: String,
            required: true
        },
        playedCards: [{
            type: mongoose.Schema.Types.Mixed
        }],
        currentCards: [{
            type: mongoose.Schema.Types.Mixed
        }]
    }],
    leadCard: {
        type: mongoose.Schema.Types.Mixed
    },
    lead: {
        type: String
    },
    currentCards: [{
        type: mongoose.Schema.Types.Mixed
    }]
})

export const Game = mongoose.model('games', GameSchema)