import { cn } from "@/lib/utils"
import { ShipWheel } from "lucide-react"

export default function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <ShipWheel className="h-7 w-7 text-primary" />
      <h1 className="text-xl font-bold tracking-tighter text-foreground">
        Fleetly
      </h1>
    </div>
  )
}
