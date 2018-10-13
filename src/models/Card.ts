export enum CardNumber {
    Six="6",
    Seven="7",
    Eight="8",
    Nine="9",
    Ten="10",
    Jack="11",
    Queen="12",
    King="13",
    Ace="14"
}

export enum CardType {
    Club="Club",
    Diamond="Diamond",
    Heart="Heart",
    Spade="Spade"
}

export class Card {
    type: CardType;
    number: CardNumber;
    
    constructor(type: CardType, number: CardNumber) {
        this.type = type;
        this.number = number;
    }

    toString(): string {
        return this.number.toString() + ' of ' + this.type.toString();
    }

    inCards(arr: Card[]): boolean {
        let cardExists = false;
        for (let i = 0; i < arr.length; i++) {
            const card = arr[i];
            cardExists = card.number === this.number && card.type === this.type ? true : cardExists
        }
        return cardExists;
    }
}

export const deck = [
    new Card(CardType.Club, CardNumber.Six),
    new Card(CardType.Club, CardNumber.Seven),
    new Card(CardType.Club, CardNumber.Eight),
    new Card(CardType.Club, CardNumber.Nine),
    new Card(CardType.Club, CardNumber.Ten),
    new Card(CardType.Club, CardNumber.Jack),
    new Card(CardType.Club, CardNumber.Queen),
    new Card(CardType.Club, CardNumber.King),
    new Card(CardType.Club, CardNumber.Ace),
    new Card(CardType.Diamond, CardNumber.Six),
    new Card(CardType.Diamond, CardNumber.Seven),
    new Card(CardType.Diamond, CardNumber.Eight),
    new Card(CardType.Diamond, CardNumber.Nine),
    new Card(CardType.Diamond, CardNumber.Ten),
    new Card(CardType.Diamond, CardNumber.Jack),
    new Card(CardType.Diamond, CardNumber.Queen),
    new Card(CardType.Diamond, CardNumber.King),
    new Card(CardType.Diamond, CardNumber.Ace),
    new Card(CardType.Heart, CardNumber.Six),
    new Card(CardType.Heart, CardNumber.Seven),
    new Card(CardType.Heart, CardNumber.Eight),
    new Card(CardType.Heart, CardNumber.Nine),
    new Card(CardType.Heart, CardNumber.Ten),
    new Card(CardType.Heart, CardNumber.Jack),
    new Card(CardType.Heart, CardNumber.Queen),
    new Card(CardType.Heart, CardNumber.King),
    new Card(CardType.Heart, CardNumber.Ace),
    new Card(CardType.Spade, CardNumber.Six),
    new Card(CardType.Spade, CardNumber.Seven),
    new Card(CardType.Spade, CardNumber.Eight),
    new Card(CardType.Spade, CardNumber.Nine),
    new Card(CardType.Spade, CardNumber.Ten),
    new Card(CardType.Spade, CardNumber.Jack),
    new Card(CardType.Spade, CardNumber.Queen),
    new Card(CardType.Spade, CardNumber.King),
    new Card(CardType.Spade, CardNumber.Ace),
];