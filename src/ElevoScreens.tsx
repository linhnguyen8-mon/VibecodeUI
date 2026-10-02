import { useState } from "react";
import { ArrowLeft, ArrowRightLeft, Bell, BookOpen, Check, ChevronDown, ChevronRight, CircleHelp, Flame, Gem, Headphones, Heart, Home, LockKeyhole, Mic, MoreHorizontal, Play, Plus, Search, Settings, Sparkles, Volume2, X } from "lucide-react";
import type { DesignAsset } from "./types";
import type { CSSProperties } from "react";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function ElevoScreen({ asset, buttonStyle }: { asset: DesignAsset; buttonStyle: CSSProperties }) {
  const [selected, setSelected] = useState("People");
  const [checked, setChecked] = useState<string[]>(["Friend/Family Recommendation", "Advertisement"]);
  const [tab, setTab] = useState("Examples");
  const [text, setText] = useState("");
  const [notice, setNotice] = useState("");
  const [swapped, setSwapped] = useState(false);
  return <article className="elevo-screen-card">
    <header className="elevo-screen-caption"><strong>{asset.name}</strong><a href={`https://www.figma.com/design/IknnI7byXmy4Xqm7DXoKup/Elevo-AI-UI-Kit?node-id=${asset.figmaNodeIds[0]?.replace(":", "-")}`} target="_blank" rel="noreferrer" aria-label={`Mở ${asset.name} trong Figma`}><ArrowRightLeft size={15} /></a></header>
    <div className="elevo-phone" data-screen={asset.screenKey} style={buttonStyle}>
      <div className="elevo-status"><b>{asset.screenKey === "home-roadmap" ? "10:27" : "9:41"}</b><span>▮▮▮ ◉ ▰</span></div>
      {asset.screenKey === "home-roadmap" && <>
        <div className="el-home-heading"><div><h2>Hello</h2><button onClick={() => setSwapped(!swapped)}><span>{swapped ? "🇹🇷" : "🇬🇧"}</span> {swapped ? "Turkish" : "English"}⌄</button></div><div className="el-resources"><span><Gem size={19} />147/356</span><button aria-label="Notifications"><Bell size={22} /></button></div></div>
        <div className="el-unit"><span className="el-book"><BookOpen size={25} /></span><div><small>This 12, Unit 6</small><b>Hidden Cliff</b></div><button aria-label="Unit menu"><MoreHorizontal size={20} /></button></div>
        <div className="el-section-title"><div><b>Section 3</b><small>3/4 Complete</small></div><button aria-label="Section details"><MoreHorizontal size={20} /></button></div>
        <div className="el-lesson-map">{["In the Mountains", "In the Meadow", "In the Valley", "In the Bicycle Park"].map((name, i) => <button key={name} className={`el-lesson ${i === 0 ? "active" : ""}`} onClick={() => setNotice(name)}><span className="el-lesson-icon">{i === 3 ? <LockKeyhole size={18} /> : i === 0 ? <BookOpen size={20} /> : <Check size={18} />}</span><span><b>{name}</b><small>{i === 0 ? "Continue learning" : i === 3 ? "Complete previous lessons" : "Completed"}</small></span><ChevronRight size={18} /></button>)}</div>
        {notice && <span className="el-notice" role="status">{notice}</span>}
        <nav className="el-bottom-nav">{[[Home,"Home"],[Search,"Explore"],[Sparkles,"Practice"],[BookOpen,"Library"],[Settings,"Profile"]].map(([Icon,label])=>{const I=Icon as typeof Home;return <button key={String(label)} onClick={()=>setNotice(String(label))}><I size={20}/><small>{String(label)}</small></button>})}<button className="el-nav-plus" aria-label="Start learning"><Plus size={25}/></button></nav>
      </>}
      {(asset.screenKey === "practice-question" || asset.screenKey === "practice-feedback") && <>
        <div className="el-practice-top"><button aria-label="Back"><ArrowLeft size={21}/></button><div className="el-progress"><i/></div><span><Heart size={19} fill="#ff6d72"/>5</span></div>
        <h2 className="el-question-title">{asset.screenKey === "practice-feedback" ? "Doğru Seçenekleri Seçin" : "Select the Correct Options"}</h2>
        <div className="el-park-art" aria-label="Park illustration"><div className="el-sun"/><div className="el-cloud">☁</div><div className="el-tree tree-one"/><div className="el-tree tree-two"/><div className="el-path"/><div className="el-bench"/></div>
        <p className="el-question-copy">{asset.screenKey === "practice-feedback" ? "Park tamamen kalabalıktı" : "The park was completely crowded"}</p>
        <div className="el-audio-row"><button aria-label="Play pronunciation"><Volume2 size={20}/></button><button aria-label="Hint"><CircleHelp size={20}/></button></div>
        <div className="el-answers">{(asset.screenKey === "practice-feedback" ? ["Elma", "İnsanlar", "Oyuncaklar", "Bulutlar"] : ["Cars", "People", "Toys", "Clouds"]).map(answer=><button key={answer} className={`${selected===answer?"selected":""} ${asset.screenKey === "practice-feedback" && answer === "İnsanlar"?"wrong":""}`} onClick={()=>setSelected(answer)}>{answer}{selected===answer&&<Check size={17}/>}</button>)}</div>
        {asset.screenKey === "practice-feedback" ? <div className="el-feedback"><span>✕</span><b>İnsanlar Hata Yapar</b><small>Doğru Cevap: "Elma"</small><button className="el-cta" onClick={()=>setNotice("Reminder saved")}>Bana daha sonra hatırlat</button></div> : <button className="el-cta" onClick={()=>setNotice(`Selected: ${selected}`)}>Check</button>}
        {notice && <span className="el-toast" role="status">{notice}</span>}
      </>}
      {asset.screenKey === "streak" && <>
        <div className="el-streak-top"><button aria-label="Close"><X size={22}/></button></div><div className="el-flame"><Flame size={102} fill="#ffbe24" strokeWidth={1.5}/><span>25</span></div><h1>25 Day’s</h1><h2>Series Completed</h2><p>You're getting smarter day by day...</p><div className="el-week">{days.map((day,i)=><div key={day}><small>{day}</small><span className={i < 5 ? "done" : ""}>{i < 5 ? <Check size={18}/> : ""}</span></div>)}</div><button className="el-cta" onClick={()=>setNotice("Keep going!")}>Keep going</button>{notice&&<span className="el-toast" role="status">{notice}</span>}
      </>}
      {(asset.screenKey === "translator-input" || asset.screenKey === "translator-result") && <>
        <div className="el-translator-head"><button aria-label="Back"><ArrowLeft size={21}/></button><b>Translate Now</b><button aria-label="More options"><MoreHorizontal size={20}/></button></div>
        <div className="el-language-pair"><button>{swapped?"Kurdish":"English"}<ChevronDown size={15}/></button><button className="el-swap" aria-label="Swap languages" onClick={()=>setSwapped(!swapped)}><ArrowRightLeft size={19}/></button><button>{swapped?"English":"Kurdish"}<ChevronDown size={15}/></button></div>
        {asset.screenKey === "translator-input" ? <div className="el-input-area"><div className="el-input-label"><b>{swapped?"Kurdish":"English"}</b><button onClick={()=>setText("Hello")}>Paste</button></div><textarea aria-label="Enter your text" placeholder="Enter your text" value={text} onChange={e=>setText(e.target.value)}/><div className="el-input-controls"><button>GPT-4o-mini⌄</button><span/><button aria-label="Camera"><span>▧</span></button><button aria-label="Microphone"><Mic size={20}/></button></div></div> : <div className="el-result-content"><div className="el-translation"><small>{swapped?"Kurdish":"English"}<button aria-label="Play source"><Volume2 size={17}/></button></small><b>Hello</b></div><div className="el-translation result"><small>{swapped?"English":"Kurdish"}<button aria-label="Play translation"><Volume2 size={17}/></button></small><b>Silav</b><span>/silɑːv/</span><p>A common greeting in Kurdish, used to say hello.</p><div className="el-reactions"><button aria-label="Helpful">♡</button><button aria-label="Not helpful">♧</button><button>Show variant</button></div></div><div className="el-result-tabs">{["Examples","Synonyms","Dictionary","Tone"].map(t=><button className={tab===t?"active":""} key={t} onClick={()=>setTab(t)}>{t}</button>)}</div><div className="el-definition"><small>NOUN</small><p><b>{tab === "Examples" ? "Hello" : tab}</b> — a greeting used when meeting someone.</p><span>Usage note · Common expression</span></div></div>}
        <nav className="el-tool-rail">{[[Sparkles,"AI"],[Search,"Search"],[Mic,"Voice"],[BookOpen,"Library"]].map(([Icon,label])=>{const I=Icon as typeof Home;return <button key={String(label)} onClick={()=>setNotice(String(label))}><I size={19}/></button>})}<button aria-label="Clear" onClick={()=>setText("")}><X size={18}/></button></nav>{notice&&<span className="el-notice" role="status">{notice}</span>}
      </>}
      {asset.screenKey === "survey-source" && <>
        <div className="el-survey-head"><button aria-label="Back"><ArrowLeft size={21}/></button><div className="el-progress"><i/></div><button aria-label="Close"><X size={21}/></button></div><div className="el-survey-content"><h1>Where did you hear about us?</h1><p>You can choose more than one</p>{["Friend/Family Recommendation","Advertisement","Social Media","Search Engine","YouTube","App Store","Other"].map(label=>{const active=checked.includes(label);return <button className={`el-survey-option ${active?"active":""}`} key={label} onClick={()=>setChecked(prev=>active?prev.filter(v=>v!==label):[...prev,label])}><span>{active&&<Check size={14}/>}</span>{label}</button>})}</div><button className="el-cta" onClick={()=>setNotice("Thanks for sharing!")}>Continue</button>{notice&&<span className="el-toast" role="status">{notice}</span>}
      </>}
    </div>
  </article>;
}
