"use client"

interface BackgroundVideoProps {
  src: string
  className?: string
}

export function BackgroundVideo({ src, className = "" }: BackgroundVideoProps) {
  return (
    <div className={`absolute inset-0 ${className}`}>
      <img
        src={src || "/placeholder.svg"}
        alt="Background"
        className="w-full h-full object-cover"
        style={{
          filter: "blur(1px) brightness(0.7)",
          animation: "subtle-float 20s ease-in-out infinite",
        }}
      />
      <style jsx>{`
        @keyframes subtle-float {
          0%, 100% { transform: scale(1) translateY(0px); }
          50% { transform: scale(1.05) translateY(-10px); }
        }
      `}</style>
    </div>
  )
}
