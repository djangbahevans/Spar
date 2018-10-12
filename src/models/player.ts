import mongoose from "mongoose";

const PlayerSchema = new mongoose.Schema({
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
});

export const Player = mongoose.model('players', PlayerSchema)