import mongoose from "mongoose";

export enum CardNumber {
    Six = 6,
    Seven = 7,
    Eight = 8,
    Nine = 9,
    Ten = 10,
    Jack = 11,
    Queen = 12,
    King = 13,
    Ace = 14
}

export enum CardType {
    Club,
    Diamond,
    Heart,
    Spade
}

export class Card {
    type: CardType;
    number: CardNumber;
    constructor(type: CardType, number: CardNumber) {
        this.type = type;
        this.number = number;
    }
}