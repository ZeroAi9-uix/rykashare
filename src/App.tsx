import { useMemo, useState } from 'react'
import {
  ArrowUpRight, Check, Copy, Disc3, Headphones, Link2, ListMusic,
  Music2, Share2, Sparkles, Users, Youtube, Play
} from 'lucide-react'

type Kind = 'watch' | 'playlist' | 'album' | 'channel' | 'room'
const kinds: { id: Kind; label: string; description: string; icon: typeof Music2; param: string }[] = [
  { id: 'watch', label: 'Song', description: 'Share a track', icon: Music2, param: 'v' },
  { id: 'playlist', label: 'Playlist', description: 'Share your collection', icon: ListMusic, param: 'id' },
  { id: 'album', label: 'Album', description: 'Share an album', icon: Disc3, param: 'id' },
  { id: 'channel', label: 'Creator', description: 'Share a creator channel', icon: Youtube, param: 'id' },
  { id: 'room', label: 'Listen Together', description: 'Invite friends to a room', icon: Users, param: 'id' },
]

function getKind(path: string): Kind {
  const p = path.replace(/\/+$/, '')
  if (p === '/playlist') return 'playlist'
  if (p === '/album') return 'album'
  if (p === '/channel') return 'channel'
  if (p === '/room') return 'room'
  return 'watch'
}

export default function App() {
  const initialKind = getKind(window.location.pathname)
  const [kind, setKind] = useState<Kind>(initialKind)
  const [contentId, setContentId] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get(initialKind === 'watch' ? 'v' : 'id') ?? ''
  })
  const [copied, setCopied] = useState(false)
  const [notice, setNotice] = useState('')

  const selected = kinds.find(k => k.id === kind)!
  const shareUrl = useMemo(() => {
    const base = window.location.origin
    const param = kind === 'watch' ? 'v' : 'id'
    return `${base}/${kind === 'watch' ? 'watch' : kind}${contentId.trim() ? `?${param}=${encodeURIComponent(contentId.trim())}` : ''}`
  }, [kind, contentId])

  function chooseKind(next: Kind) {
    setKind(next)
    setNotice('')
    const url = new URL(window.location.href)
    url.pathname = next === 'watch' ? '/watch' : `/${next}`
    url.search = ''
    window.history.replaceState({}, '', url)
  }

  function buildShareUrl() {
    if (!contentId.trim()) {
      setNotice(`Add a ${kind === 'watch' ? 'song' : selected.label.toLowerCase()} ID first.`)
      return
    }
    const url = new URL(window.location.href)
    url.pathname = kind === 'watch' ? '/watch' : `/${kind}`
    url.search = `${kind === 'watch' ? 'v' : 'id'}=${encodeURIComponent(contentId.trim())}`
    window.history.replaceState({}, '', url)
    setNotice('Share link ready.')
  }

  async function copyLink() {
    if (!contentId.trim()) {
      setNotice(`Add a ${kind === 'watch' ? 'song' : selected.label.toLowerCase()} ID first.`)
      return
    }
    buildShareUrl()
    const url = shareUrl
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setNotice('Link copied to clipboard.')
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setNotice('Clipboard access was blocked. Select and copy the link below.')
    }
  }

  async function shareLink() {
    if (!contentId.trim()) {
      setNotice(`Add a ${kind === 'watch' ? 'song' : selected.label.toLowerCase()} ID first.`)
      return
    }
    buildShareUrl()
    if (navigator.share) {
      try {
        await navigator.share({ title: `RYKA · ${selected.label}`, text: `Check this out on RYKA`, url: shareUrl })
      } catch {
        // User cancellation is normal; keep the page unchanged.
      }
    } else {
      await copyLink()
    }
  }

  const appUrl = contentId.trim()
    ? `ryka://share/${kind === 'watch' ? 'watch' : kind}?${kind === 'watch' ? 'v' : 'id'}=${encodeURIComponent(contentId.trim())}`
    : 'ryka://'

  return (
    <main className="page-shell">
      <nav className="topbar">
        <a className="brand" href="/" aria-label="RYKA home">
          <img
            src="/icon.png"
            alt="RYKA Logo"
            className="brand-custom-logo"
          />
          <span>RYKA<span className="brand-dot">.</span></span>
        </a>
        <div className="nav-pill"><span className="live-dot" /> MUSIC SHARING, REIMAGINED</div>
        <a className="top-link" href="#create">Create a link <ArrowUpRight size={15} /></a>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><Sparkles size={14} /> YOUR SOUND. YOUR UNIVERSE.</div>
          <h1>Good music<br />moves <span>with you.</span></h1>
          <p className="hero-subtitle">More than music. A feeling, a memory, a vibe — all yours to share with the world.</p>
          <a className="hero-cta" href="#create">Make a share link <ArrowUpRight size={17} /></a>
          <div className="social-proof"><div className="avatar-stack"><i>R</i><i>Y</i><i>K</i><i>A</i></div><span>For the ones who feel every beat.</span></div>
        </div>
        <div className="hero-art" aria-label="Decorative music player artwork">
          <div className="orbit orbit-one" /><div className="orbit orbit-two" />
          <div className="disc"><div className="disc-grooves" /><div className="disc-label"><Headphones size={34} /><span>RYKA</span></div></div>
          <div className="float-card float-top"><span className="mini-eq"><b /><b /><b /><b /></span><span><strong>On repeat</strong><small>Your current vibe</small></span><Play size={16} fill="currentColor" /></div>
          <div className="float-card float-bottom"><span className="pulse-icon"><Users size={17} /></span><span><strong>Listen together</strong><small>Same song, same moment.</small></span><span className="online-dot" /></div>
          <div className="spark spark-a">✳</div><div className="spark spark-b">✦</div>
        </div>
      </section>

      <section className="share-section" id="create">
        <div className="section-heading">
          <div><div className="eyebrow">THE SHARE STUDIO</div><h2>What are we sharing?</h2></div>
          <span className="step-count">01 <span>/</span> 02</span>
        </div>
        <div className="type-grid">
          {kinds.map(item => {
            const Icon = item.icon
            return <button key={item.id} className={`type-card ${kind === item.id ? 'selected' : ''}`} onClick={() => chooseKind(item.id)}>
              <span className="type-icon"><Icon size={21} /></span>
              <span className="type-text"><strong>{item.label}</strong><small>{item.description}</small></span>
            </button>
          })}
        </div>

        <div className="builder">
          <div className="builder-top"><span className="builder-icon"><Link2 size={18} /></span><div><strong>Build your link</strong><p>Paste the ID from your RYKA content.</p></div><span className="secure-tag"><span /> LINK BUILDER</span></div>
          <label className="input-label" htmlFor="content-id">{kind === 'watch' ? 'SONG ID' : `${selected.label.toUpperCase()} ID`}</label>
          <div className="input-row">
            <input id="content-id" value={contentId} onChange={e => { setContentId(e.target.value); setNotice('') }} onKeyDown={e => { if (e.key === 'Enter') buildShareUrl() }} placeholder={kind === 'watch' ? 'e.g. dQw4w9WgXcQ' : `Paste your ${selected.label.toLowerCase()} ID`} />
            <button className="generate-button" onClick={buildShareUrl}>Generate link <ArrowUpRight size={16} /></button>
          </div>
          <p className="helper-text">This creates a share URL. Live title, cover art and playback require connecting your music metadata source.</p>
          <div className="result-box">
            <div className="result-label"><span>YOUR SHARE LINK</span><span className="ready-status"><i /> {contentId.trim() ? 'PREVIEW' : 'WAITING FOR ID'}</span></div>
            <div className="result-url">{shareUrl}</div>
            <div className="result-actions">
              <button className="copy-button" onClick={copyLink}>{copied ? <Check size={16} /> : <Copy size={16} />}{copied ? 'Copied!' : 'Copy link'}</button>
              <button className="share-button" onClick={shareLink}><Share2 size={16} /> Share</button>
            </div>
            {notice && <div className={`notice ${notice.includes('first') ? 'notice-warn' : ''}`} role="status">{notice}</div>}
          </div>
        </div>
      </section>

      <section className="preview-section">
        <div className="preview-copy"><div className="eyebrow">MADE TO TRAVEL</div><h2>Your link.<br /><span>Your people.</span></h2><p>From your favourite tracks to unforgettable playlists, share the sounds that feel like you. One link brings your music closer to everyone who matters.</p><a className="text-link" href={appUrl} onClick={e => { if (!contentId.trim()) { e.preventDefault(); setNotice('Add an ID to create an app link.'); document.getElementById('create')?.scrollIntoView({ behavior: 'smooth' }) } }}>Open in RYKA <ArrowUpRight size={16} /></a></div>
        <div className="phone-wrap">
          <div className="phone">
            <div className="phone-notch" />

            <div className="phone-content">
              <div className="phone-brand">
                <img
                  src="/icon.png"
                  alt="RYKA Logo"
                  className="phone-custom-logo"
                />
                <span>RYKA</span>
                <span className="phone-menu">•••</span>
              </div>

              <div className="cover-art">
                <div className="cover-ring" />
                <div className="cover-center">
                  <Headphones size={40} />
                </div>
                <span className="cover-caption">
                  YOUR NEXT
                  <br />
                  FAVOURITE
                </span>
              </div>

              <div className="phone-track">
                <small>SHARED WITH YOU</small>
                <strong>
                  {contentId.trim()
                    ? `${selected.label} link`
                    : 'A little more feeling'}
                </strong>
                <span>
                  {contentId.trim()
                    ? `ID: ${contentId.trim()}`
                    : 'A RYKA listening moment'}
                </span>
              </div>

              <button
                className="phone-play"
                onClick={() =>
                  document.getElementById('create')?.scrollIntoView({
                    behavior: 'smooth',
                  })
                }
              >
                <Play size={16} fill="currentColor" />
                Open in RYKA
              </button>

              <div className="phone-footer">
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>

          <div className="phone-glow" />
        </div>
      </section>

      <footer className="footer"><a className="brand" href="/"><img
        src="/icon.png"
        alt="RYKA Logo"
        className="brand-custom-logo"
      /><span>RYKA<span className="brand-dot">.</span></span></a><span>YOUR SOUND. YOUR UNIVERSE.</span><span>© {new Date().getFullYear()} RYKA Share</span></footer>
    </main>
  )
}