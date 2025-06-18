export class Card {
  private suit: number
  private num: number

  constructor(s: number, n: number) {
    this.suit = s
    this.num = n
  }

  getNumber(): number {
    return this.num
  }

  getRank(): string | number {
    if (this.num >= 2 && this.num <= 10) return this.num
    if (this.num === 11) return "J"
    if (this.num === 12) return "Q"
    if (this.num === 13) return "K"
    if (this.num === 1) return "A"
    return ""
  }

  getSuit(): string {
    let st = ""
    switch (this.suit) {
      case 1:
        st = "Hearts"
        break
      case 2:
        st = "Diamonds"
        break
      case 3:
        st = "Spades"
        break
      case 4:
        st = "Clubs"
        break
      default:
        st = "None"
    }
    return st
  }

  getValue(): number {
    if (this.num >= 11 && this.num <= 13) {
      return 10
    } else if (this.num == 1) {
      return 11
    } else {
      return this.num
    }
  }
}

export function deal(): Card {
  const suit = Math.floor(Math.random() * 4) + 1
  const num = Math.floor(Math.random() * 13) + 1
  return new Card(suit, num)
}

export class Hand {
  private cards: Card[]

  constructor(initialCards?: Card[]) {
    if (initialCards) {
      this.cards = initialCards
    } else {
      this.cards = [deal(), deal()]
    }
  }

  getHand(): Card[] {
    return this.cards
  }

  score(): number {
    let sum = 0
    let aceCount = 0

    for (let i = 0; i < this.cards.length; i++) {
      if (this.cards[i].getValue() === 11) aceCount++
      sum += this.cards[i].getValue()
    }

    if (sum > 21 && aceCount > 0) {
      let j = 0
      while (j < aceCount) {
        sum -= 10
        if (sum <= 21) return sum
        j++
      }
    }

    return sum
  }

  printHand(): string {
    let myhand = ""

    for (let i = 0; i < this.cards.length; i++) {
      if (i !== this.cards.length - 1) myhand += this.cards[i].getRank() + " of " + this.cards[i].getSuit() + ", "
      else myhand += this.cards[i].getRank() + " of " + this.cards[i].getSuit() + "."
    }

    return myhand
  }

  hitMe(): Card {
    const newcard = deal()
    this.cards.push(newcard)
    return newcard
  }
}

export function playAsDealer(): Hand {
  const newHand = new Hand()

  if (newHand.score() < 17) {
    newHand.hitMe()
  }

  return newHand
}

export function declareWinner(userHand: Hand, dealerHand: Hand): string {
  const usrScore = userHand.score()
  const dlrScore = dealerHand.score()

  if (usrScore > 21) {
    if (dlrScore > 21) return "You tied!"
    else return "You lose!"
  } else if (dlrScore > 21) {
    return "You win!"
  } else if (usrScore > dlrScore) return "You win!"
  else if (usrScore == dlrScore) return "You tied!"
  else return "You lose!"
}
