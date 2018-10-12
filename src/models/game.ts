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
        }],
        isLead: {
            type: Boolean,
            required: true
        }
    }],
    leadCard: {
        type: mongoose.Schema.Types.Mixed
    },
    currentCards: [{
        type: mongoose.Schema.Types.Mixed
    }]
})

export const Game = mongoose.model('games', GameSchema)