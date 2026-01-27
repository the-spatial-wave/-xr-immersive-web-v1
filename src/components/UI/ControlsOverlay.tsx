import './ControlsOverlay.css'

export function ControlsOverlay() {
  return (
    <div className="controls-overlay">
      <div className="control-item">
        <span className="control-icon">🖱️</span>
        <span className="control-text">
          <strong>Drag</strong> = Rotate
        </span>
      </div>
      
      <div className="control-separator">•</div>
      
      <div className="control-item">
        <span className="control-icon">🔄</span>
        <span className="control-text">
          <strong>Wheel</strong> = Zoom
        </span>
      </div>
      
      <div className="control-separator">•</div>
      
      <div className="control-item">
        <span className="control-icon">⌨️</span>
        <span className="control-text">
          <strong>Space</strong> = Toggle modes
        </span>
      </div>
      
      <div className="control-separator">•</div>
      
      <div className="control-item">
        <span className="control-text">
          <strong>1 · 2 · 3</strong> = Choose scene
        </span>
      </div>
    </div>
  )
}