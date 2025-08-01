"use client"

interface BackgroundVideoProps {
  src: string
  alt: string
  className?: string
  isVideo?: boolean
}

export function BackgroundVideo({ src, alt, className = "", isVideo = false }: BackgroundVideoProps) {
  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = src
    link.download = alt.replace(/\s+/g, "-").toLowerCase() + (isVideo ? ".mp4" : ".gif")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className={`absolute inset-0 group ${className}`}>
      {isVideo ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          style={{
            filter: "blur(1px) brightness(0.7)",
          }}
        >
          <source src={src} type="video/mp4" />
          {/* Fallback for browsers that don't support video */}
          <img
            src="/placeholder.svg?height=1080&width=1920"
            alt={alt}
            className="w-full h-full object-cover"
            style={{
              filter: "blur(1px) brightness(0.7)",
              animation: "subtle-float 20s ease-in-out infinite",
            }}
          />
        </video>
      ) : (
        <img
          src={src || "/placeholder.svg"}
          alt={alt}
          className="w-full h-full object-cover"
          style={{
            filter: "blur(1px) brightness(0.7)",
            animation: "subtle-float 20s ease-in-out infinite",
          }}
        />
      )}

      {/* Download button overlay */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button
          onClick={handleDownload}
          className="bg-black/50 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm hover:bg-black/70 transition-colors duration-200 flex items-center space-x-2"
          title={`Download ${alt}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span>Download</span>
        </button>
      </div>

      <style jsx>{`
        @keyframes subtle-float {
          0%, 100% { transform: scale(1) translateY(0px); }
          50% { transform: scale(1.05) translateY(-10px); }
        }
      `}</style>
    </div>
  )
}
