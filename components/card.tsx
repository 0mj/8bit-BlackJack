import type { Card as CardType } from "@/lib/blackjack"

interface CardProps {
  card: CardType
  hidden?: boolean
}

export default function Card({ card, hidden = false }: CardProps) {
  const suit = card.getSuit().toLowerCase()
  const rank = card.getRank()

  const getSuitColor = () => {
    if (suit === "hearts" || suit === "diamonds") {
      return "text-red-600"
    }
    return "text-black"
  }

  const getSuitSymbol = () => {
    switch (suit) {
      case "hearts":
        return "♥"
      case "diamonds":
        return "♦"
      case "spades":
        return "♠"
      case "clubs":
        return "♣"
      default:
        return ""
    }
  }

  if (hidden) {
    return (
      <div className="w-24 h-36 bg-blue-900 rounded-md border-4 border-white relative overflow-hidden transform transition-transform hover:scale-105">
        <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-1 p-1">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="bg-blue-700 rounded-sm"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-24 h-36 bg-white rounded-md border-4 border-gray-200 relative transform transition-transform hover:scale-105">
      <div className="absolute top-1 left-2 font-pixel text-xl font-bold">
        <span className={getSuitColor()}>{rank}</span>
      </div>

      <div className="absolute bottom-1 right-2 font-pixel text-xl font-bold rotate-180">
        <span className={getSuitColor()}>{rank}</span>
      </div>

      <div className={`absolute inset-0 flex items-center justify-center text-4xl ${getSuitColor()}`}>
        <div className="font-pixel">{getSuitSymbol()}</div>
      </div>
    </div>
  )
}
