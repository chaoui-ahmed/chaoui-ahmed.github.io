import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"

export default function Component() {
  const StarRating = ({ filled, total = 5 }: { filled: number; total?: number }) => {
    return (
      <div className="flex gap-1">
        {Array.from({ length: total }, (_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < filled ? "fill-[#e2af00] text-[#e2af00]" : "fill-[#65ddfe] text-[#65ddfe]"}`}
          />
        ))}
      </div>
    )
  }

  const GameCard = ({
    title = "THE STARS",
    character,
    showButtons = false,
    showStars = false,
    starCount = 0,
    showLightsaber = false,
    isLarge = false,
    showCreateLobby = false,
    showJoinLobby = false,
    className = "",
  }: {
    title?: string
    character?: string
    showButtons?: boolean
    showStars?: boolean
    starCount?: number
    showLightsaber?: boolean
    isLarge?: boolean
    showCreateLobby?: boolean
    showJoinLobby?: boolean
    className?: string
  }) => {
    return (
      <Card className={`bg-[#071b3f] border-2 border-[#e2af00] ${isLarge ? "w-80 h-64" : "w-64 h-48"} ${className}`}>
        <CardContent className="p-4 h-full flex flex-col">
          <div className="text-center mb-2">
            <div className="bg-[#e2af00] text-[#071b3f] px-3 py-1 rounded text-sm font-bold inline-block">{title}</div>
          </div>

          {character && (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-20 h-20 bg-[#444444] rounded-lg flex items-center justify-center">
                <span className="text-white text-xs">{character}</span>
              </div>
            </div>
          )}

          {showLightsaber && (
            <div className="flex-1 flex items-center justify-center">
              <div className="relative">
                <div className="w-1 h-16 bg-[#65ddfe] rounded-full"></div>
                <div className="w-1 h-16 bg-[#e2af00] rounded-full absolute top-0 left-4"></div>
              </div>
            </div>
          )}

          {showStars && (
            <div className="flex justify-center mb-2">
              <StarRating filled={starCount} />
            </div>
          )}

          {showButtons && (
            <div className="space-y-2">
              <div className="text-center text-white text-xs mb-2">CHOOSE YOUR PATH</div>
              <Button className="w-full bg-[#e2af00] hover:bg-[#e3b700] text-[#071b3f] text-xs py-1">AI</Button>
              <Button className="w-full bg-[#e2af00] hover:bg-[#e3b700] text-[#071b3f] text-xs py-1">PUZZLE</Button>
              <Button className="w-full bg-[#e2af00] hover:bg-[#e3b700] text-[#071b3f] text-xs py-1">DUO</Button>
            </div>
          )}

          {showCreateLobby && (
            <div className="space-y-2">
              <div className="text-center text-white text-xs mb-2">CREATE A LOBBY</div>
              <Button className="w-full bg-[#e2af00] hover:bg-[#e3b700] text-[#071b3f] text-xs py-1">
                SOLO 6 vs 1
              </Button>
              <Button className="w-full bg-[#e2af00] hover:bg-[#e3b700] text-[#071b3f] text-xs py-1">ALLIANCE</Button>
            </div>
          )}

          {showJoinLobby && (
            <div className="space-y-2">
              <div className="text-center text-white text-xs mb-2">JOIN A LOBBY</div>
              <Button className="w-full bg-[#e2af00] hover:bg-[#e3b700] text-[#071b3f] text-xs py-1">JOIN</Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  const ConnectorLine = ({ className = "" }: { className?: string }) => {
    return <div className={`w-px h-12 bg-[#e2af00] ${className}`}></div>
  }

  const HorizontalLine = ({ className = "" }: { className?: string }) => {
    return <div className={`h-px w-12 bg-[#e2af00] ${className}`}></div>
  }

  const ScoreCard = () => {
    return (
      <Card className="bg-[#071b3f] border-2 border-[#e2af00] w-48 h-32">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-2">
            <div className="bg-[#e2af00] text-[#071b3f] px-2 py-1 rounded text-xs font-bold">Rebel Alliance</div>
            <div className="bg-[#444444] text-[#071b3f] px-2 py-1 rounded text-xs font-bold">Empire</div>
          </div>
          <div className="bg-[#d9d9d9] h-16 rounded mb-2"></div>
          <div className="flex gap-1">
            <div className="bg-[#e2af00] h-4 w-8 rounded"></div>
            <div className="bg-[#e2af00] h-4 w-8 rounded"></div>
            <div className="bg-[#e2af00] h-4 w-8 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-[#444444] p-8 overflow-auto">
      <div className="max-w-7xl mx-auto">
        {/* Top Level */}
        <div className="flex justify-center mb-8">
          <GameCard character="Millennium Falcon" />
        </div>

        <div className="flex justify-center mb-8">
          <ConnectorLine />
        </div>

        {/* Second Level */}
        <div className="flex justify-center mb-8">
          <GameCard showButtons={true} />
        </div>

        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-4">
            <HorizontalLine className="w-32" />
            <ConnectorLine />
            <HorizontalLine className="w-32" />
          </div>
        </div>

        {/* Third Level - Character Selection */}
        <div className="flex justify-center gap-8 mb-8">
          <GameCard character="Obi-Wan" showButtons={true} />
          <GameCard showLightsaber={true} showButtons={true} />
          <GameCard character="R2-D2 & C-3PO" showButtons={true} />
        </div>

        <div className="flex justify-center gap-8 mb-8">
          <ConnectorLine />
          <ConnectorLine />
          <ConnectorLine />
        </div>

        {/* Fourth Level - Game Screens */}
        <div className="flex justify-center gap-8 mb-8">
          <ScoreCard />
          <GameCard showStars={true} starCount={4} character="Luke" isLarge={true} />
          <GameCard character="R2-D2 & C-3PO" showButtons={true} />
        </div>

        <div className="flex justify-center gap-8 mb-8">
          <div className="w-48"></div>
          <ConnectorLine />
          <ConnectorLine />
        </div>

        {/* Fifth Level */}
        <div className="flex justify-center gap-8 mb-8">
          <div className="w-48"></div>
          <GameCard showStars={true} starCount={3} character="Luke" isLarge={true} />
          <GameCard character="R2-D2 & C-3PO" showCreateLobby={true} />
        </div>

        <div className="flex justify-center gap-8 mb-8">
          <div className="w-48"></div>
          <ConnectorLine />
          <ConnectorLine />
        </div>

        {/* Sixth Level */}
        <div className="flex justify-center gap-8 mb-8">
          <div className="w-48"></div>
          <GameCard showStars={true} starCount={2} character="Luke" isLarge={true} />
          <div className="flex flex-col gap-4">
            <GameCard title="THE STARS" className="w-48 h-24" />
            <GameCard showJoinLobby={true} character="C-3PO" />
          </div>
        </div>

        <div className="flex justify-center gap-8 mb-8">
          <ConnectorLine />
          <ConnectorLine />
          <ConnectorLine />
        </div>

        {/* Bottom Level */}
        <div className="flex justify-center gap-8">
          <ScoreCard />
          <Card className="bg-[#071b3f] border-2 border-[#e2af00] w-64 h-32">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="bg-[#e2af00] text-[#071b3f] px-2 py-1 rounded text-xs font-bold">THE STARS</div>
              </div>
              <div className="bg-[#d9d9d9] h-16 rounded mb-2"></div>
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-1 h-8 bg-[#65ddfe] rounded-full"></div>
                  <div className="w-1 h-8 bg-[#e2af00] rounded-full absolute top-0 left-2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#071b3f] border-2 border-[#e2af00] w-64 h-32">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="bg-[#e2af00] text-[#071b3f] px-2 py-1 rounded text-xs font-bold">THE STARS</div>
              </div>
              <div className="bg-[#d9d9d9] h-16 rounded mb-2"></div>
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-1 h-8 bg-[#65ddfe] rounded-full"></div>
                  <div className="w-1 h-8 bg-[#e2af00] rounded-full absolute top-0 left-2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
