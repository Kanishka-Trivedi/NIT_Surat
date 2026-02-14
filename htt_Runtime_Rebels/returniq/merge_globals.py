
import os

new_css_additions = """
/* =========================================
   NEW LANDING PAGE STYLES (Restored)
   ========================================= */

:root {
  /* Renamed variables to avoid conflicts with Dashboard */
  --landing-bg: #020617;
  --landing-fg: #f8fafc;

  /* New variables required for Landing Page */
  --primary-glow: rgba(99, 102, 241, 0.4);
  --secondary-new: #06b6d4;
  --secondary-glow: rgba(6, 182, 212, 0.4);
  --accent: #8b5cf6;
  --accent-glow: rgba(139, 92, 246, 0.4);

  /* Surfaces */
  --glass-border: rgba(255, 255, 255, 0.08);
  --glass-surface: rgba(255, 255, 255, 0.03);
  --glass-highlight: rgba(255, 255, 255, 0.1);
}

@layer utilities {
  .glass-panel {
    background: var(--glass-surface);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid var(--glass-border);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  }

  .glass-card {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%);
    backdrop-filter: blur(10px);
    border: 1px solid var(--glass-border);
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .glass-card:hover {
    border-color: var(--glass-highlight);
    box-shadow: 0 0 20px var(--primary-glow);
    transform: translateY(-2px);
  }

  .text-gradient {
    background: linear-gradient(135deg, #22d3ee 0%, #818cf8 50%, #c084fc 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .text-gradient-gold {
    background: linear-gradient(135deg, #fcd34d 0%, #f59e0b 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .button-glow {
    position: relative;
    overflow: hidden;
  }

  .button-glow::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 60%);
    transform: scale(0);
    transition: transform 0.6s ease-out;
    pointer-events: none;
  }

  .button-glow:hover::after {
    transform: scale(1);
    transition: 0s;
  }
}

/* Animations */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 10px var(--primary-glow); }
  50% { box-shadow: 0 0 25px var(--primary-glow); }
}

@keyframes shine {
  0% { transform: translateX(-100%) skewX(-15deg); }
  100% { transform: translateX(200%) skewX(-15deg); }
}

.animate-float { animation: float 6s ease-in-out infinite; }
.animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
"""

try:
    with open('old_globals_utf8.css', 'r', encoding='utf-8') as f:
        old_content = f.read()
    
    combined_content = old_content + "\n\n" + new_css_additions
    
    with open('src/app/globals.css', 'w', encoding='utf-8') as f:
        f.write(combined_content)
        
    print("Successfully merged globals.css")
except Exception as e:
    print(f"Error: {e}")
