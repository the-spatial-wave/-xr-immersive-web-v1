interface SceneCardProps {
  title: string
  subtitle: string
  badge: string
  thumbnail: string
  onEnter: () => void
}

export function SceneCard({ 
  title, 
  subtitle, 
  badge, 
  thumbnail, 
  onEnter 
}: SceneCardProps) {
  return (
    <div className="scene-card">
      <div 
        className="scene-thumbnail"
        style={{ 
          background: `linear-gradient(135deg, rgba(0,0,0,0.5), rgba(0,0,0,0.3)), url(${thumbnail})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="scene-badge">{badge}</div>
      </div>
      
      <div className="scene-content">
        <h3 className="scene-title">{title}</h3>
        <p className="scene-subtitle">{subtitle}</p>
        
        <button 
          className="scene-enter-btn"
          onClick={onEnter}
        >
          Enter
        </button>
      </div>
    </div>
  )
}