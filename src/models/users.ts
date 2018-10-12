import mongoose from "mongoose";
import jwt from 'jsonwebtoken';
import Joi from 'joi';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    games: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'games'
    }]
});

const validateUser = async (user: { name: string, email: string, password: string, username: string }) => {
    const shema = {
        name: Joi.string().max(50).min(2).required(),
        username: Joi.string().min(5).max(255).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(5).max(40).required()
    };

    return await Joi.validate(user, shema);
};

UserSchema.methods.generateAuthToken = function() {
    const token = jwt.sign(
        {
            _id: this._id,
            name: this.name,
            email: this.email,
            username: this.username
        },
        'secret'
    );
    return token;
}

export const User = mongoose.model('user', UserSchema);
export { validateUser };