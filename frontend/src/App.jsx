import { useState } from "react"
import axios from "axios"

const pixel = { fontFamily: "'Press Start 2P', cursive" }

function ScoreCircle({ score, label }) {
  const color = score >= 70 ? "#f9a8d4" : score >= 40 ? "#fbbf24" : "#f87171"
  const rank = score >= 70 ? "S RANK!" : score >= 40 ? "B RANK" : "D RANK"
  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox="0 0 120 120" className="w-36 h-36">
        <circle cx="60" cy="60" r="54" fill="none" stroke="#1a0010" strokeWidth="10" />
        <circle cx="60" cy="60" r="54" fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${(score / 100) * 339} 339`}
          strokeLinecap="square" transform="rotate(-90 60 60)" />
        <text x="60" y="52" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold" fontFamily="'Press Start 2P'">{score}%</text>
        <text x="60" y="72" textAnchor="middle" fill={color} fontSize="9" fontFamily="'Press Start 2P'">{rank}</text>
      </svg>
      <div className="text-pink-500 text-xs">{label}</div>
    </div>
  )
}

function PixelCard({ title, children }) {
  return (
    <div className="bg-black border-4 border-pink-400 p-6"
      style={{ boxShadow: "4px 4px 0px #ec4899, 8px 8px 0px #831843" }}>
      {title && <div className="text-pink-400 text-xs mb-4">◆ {title}</div>}
      {children}
    </div>
  )
}

function TagList({ items, color }) {
  if (!items || items.length === 0) return <p className="text-gray-600 text-xs">NONE FOUND</p>
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, i) => (
        <span key={i} className="text-xs px-2 py-1 border-2"
          style={{ borderColor: color, color: color, fontFamily: "'Press Start 2P', cursive" }}>
          {item}
        </span>
      ))}
    </div>
  )
}

function App() {
  const [file, setFile] = useState(null)
  const [jd, setJd] = useState("")
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [drag, setDrag] = useState(false)

  const handleSubmit = async () => {
    if (!file || !jd) return alert("Load your resume + job quest first!")
    const formData = new FormData()
    formData.append("file", file)
    formData.append("job_description", jd)
    setLoading(true)
    try {
      const res = await axios.post("http://localhost:8000/analyze", formData)
      setResult(res.data)
    } catch (e) {
      alert("Error! Backend chal raha hai?")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen p-6 flex flex-col items-center"
      style={{ background: "#0a0010", fontFamily: "'Press Start 2P', cursive" }}>

      {/* Header */}
      <div className="text-center mb-10 mt-6">
        <div className="text-pink-400 text-xs mb-3 tracking-widest">PLAYER 1 · READY</div>
        <h1 className="text-pink-300 text-2xl md:text-3xl leading-relaxed mb-4"
          style={{ textShadow: "3px 3px 0px #831843" }}>
          RESUME<br />ANALYZER
        </h1>
        <div className="text-pink-600 text-xs">▼ START YOUR QUEST ▼</div>
      </div>

      <div className="w-full max-w-2xl space-y-6">

        {/* Upload */}
        <PixelCard title="STAGE 1 · LOAD SAVE FILE">
          <div
            onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); setFile(e.dataTransfer.files[0]) }}
            className={`border-2 border-dashed p-8 text-center cursor-pointer transition-all ${drag ? "border-pink-300 bg-pink-900/20" : "border-pink-700"}`}
          >
            <div className="text-4xl mb-3">💾</div>
            <p className="text-pink-300 text-xs mb-4">DRAG & DROP PDF HERE</p>
            <label className="cursor-pointer">
              <span className="bg-pink-600 hover:bg-pink-500 text-white text-xs px-4 py-2"
                style={{ boxShadow: "3px 3px 0px #831843" }}>
                [ BROWSE ]
              </span>
              <input type="file" accept=".pdf" className="hidden"
                onChange={(e) => setFile(e.target.files[0])} />
            </label>
            {file && <p className="text-green-400 text-xs mt-4">✓ {file.name}</p>}
          </div>
        </PixelCard>

        {/* JD */}
        <PixelCard title="STAGE 2 · SELECT QUEST">
          <textarea
            placeholder="PASTE JOB DESCRIPTION HERE..."
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            rows={6}
            className="w-full bg-black text-pink-200 border-2 border-pink-700 p-3 resize-none outline-none focus:border-pink-400 text-xs leading-6"
            style={pixel}
          />
        </PixelCard>

        {/* Button */}
        <button onClick={handleSubmit} disabled={loading}
          className="w-full bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white py-4 text-sm transition-all"
          style={{ ...pixel, boxShadow: "4px 4px 0px #831843" }}>
          {loading ? "► ANALYZING..." : "► START QUEST"}
        </button>

        {/* Results */}
        {result && (
          <div className="space-y-6">

            {/* Scores */}
            <PixelCard title="QUEST RESULTS · SCORES">
              <div className="grid grid-cols-2 gap-6">
                <ScoreCircle score={result.score} label="KEYWORD MATCH" />
                <ScoreCircle score={result.ai_score} label="AI SCORE" />
              </div>
            </PixelCard>

            {/* Strengths */}
            <PixelCard title="POWER UPS · STRENGTHS">
              <TagList items={result.strengths || []} color="#86efac" />
            </PixelCard>

            {/* Missing Keywords */}
            <PixelCard title="MISSING ITEMS · KEYWORDS">
              <TagList items={result.missing_keywords || []} color="#f87171" />
            </PixelCard>

            {/* Improvements */}
            <PixelCard title="SIDE QUESTS · IMPROVEMENTS">
              <ul className="space-y-3">
                {(result.improvements || []).map((item, i) => (
                  <li key={i} className="text-pink-200 text-xs leading-6">► {item}</li>
                ))}
              </ul>
            </PixelCard>

            {/* Format */}
            <PixelCard title="FORMAT REVIEW">
              <p className="text-pink-200 text-xs leading-6">► {result.format_feedback}</p>
            </PixelCard>

            {/* Trends */}
            <PixelCard title="MARKET TRENDS · 2026">
              <p className="text-pink-200 text-xs leading-6">► {result.trend_analysis}</p>
            </PixelCard>

          </div>
        )}

        <div className="text-center text-pink-800 text-xs pb-6">
          © 2026 RESUME QUEST · INSERT COIN TO CONTINUE
        </div>
      </div>
    </div>
  )
}

export default App