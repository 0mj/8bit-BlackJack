interface DealerProps {
  expression: "neutral" | "happy" | "angry"
}

export default function Dealer({ expression = "neutral" }: DealerProps) {
  return (
    <div className="w-24 h-24 relative">
      {/* Dealer's head - 8-bit style */}
      <div className="w-16 h-16 bg-[#FFD700] rounded-md mx-auto relative">
        {/* Eyes */}
        <div className="absolute top-4 left-3 w-2 h-2 bg-black"></div>
        <div className="absolute top-4 right-3 w-2 h-2 bg-black"></div>

        {/* Mouth - changes based on expression */}
        {expression === "neutral" && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-black"></div>
        )}

        {expression === "happy" && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-6 h-2 border-b-2 border-black rounded-b-md"></div>
        )}

        {expression === "angry" && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-6 h-2 border-t-2 border-black rounded-t-md"></div>
        )}

        {/* Hat */}
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-20 h-4 bg-black"></div>
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-12 h-4 bg-black"></div>
      </div>

      {/* Dealer's body */}
      <div className="w-20 h-8 bg-black mx-auto mt-1 rounded-t-md"></div>
    </div>
  )
}
