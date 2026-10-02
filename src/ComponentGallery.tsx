import { useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { ArrowUpRight, BatteryFull, Bell, Home, LayoutGrid, LockKeyhole, Mail, MessageCircle, MoreHorizontal, Search, Send, ShieldCheck, Signal, Square, TrendingUp, User, Wifi, X } from "lucide-react";
import type { ButtonSize, DesignSystem, PreviewCategory } from "./types";
import { buttonSizeOrder, getButtonSize } from "./lib/button";
import { getTypography, typeRoles } from "./lib/typography";
import { brandScales, functionalScales, neutralScaleForSystem, tokenValue } from "./lib/tokens";
import { gradientPresetStyle } from "./lib/gradient";
import { ElevoScreen } from "./ElevoScreens";
import { getSpacingAliases, getSpacingScale, semanticSpacingColors } from "./lib/spacing";
import "./component-gallery.css";

const variants = ["Primary", "Secondary", "Outline", "Soft", "Ghost", "Success", "Warning", "Info"];
const states = ["Default", "Hover", "Active", "Focus", "Disabled"];
const tabLabels = ["Tổng quan", "Giao dịch", "Báo cáo"];
const navItems = [
  { label: "Trang chủ", Icon: Home },
  { label: "Khám phá", Icon: Search },
  { label: "Trò chuyện", Icon: MessageCircle },
];

function Section({ title, meta, children }: { title: string; meta: string; children: ReactNode }) {
  return <section className="eg-section"><header><h3>{title}</h3><span>{meta}</span></header>{children}</section>;
}

function GalleryButton({ children, variant = "primary", className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string }) {
  return <button type="button" {...props} className={`eg-button eg-${variant} ${className}`}>{children}</button>;
}

function ElevoComponentAssets({ onAction }: { onAction: (message: string) => void }) {
  const [choice, setChoice] = useState("Cars");
  const [checked, setChecked] = useState(true);
  return <div className="elevo-assets-board">
    <div className="elevo-assets-group elevo-input-states"><h4>Input states</h4><label><span>Email Address</span><input placeholder="Email Address" /></label><label className="is-focused"><span>Focused</span><input defaultValue="jane@elevo.com" /></label><label><span>Filled</span><input defaultValue="jane@elevo.com" /></label><label className="is-invalid"><span>Invalid</span><input defaultValue="jane@elevo.com" aria-invalid="true" /><small>Enter a valid email address</small></label></div>
    <div className="elevo-assets-group"><h4>Buttons</h4><GalleryButton onClick={() => onAction("Check")}>Check</GalleryButton><GalleryButton variant="outline">Let's Get a Fresh Start</GalleryButton><GalleryButton>Let's Get a Fresh Start</GalleryButton><GalleryButton disabled>Let's Get a Fresh Start</GalleryButton><GalleryButton variant="correct" onClick={() => onAction("Continue next")}>Continue Next</GalleryButton><GalleryButton variant="wrong">Remind me later</GalleryButton></div>
    <div className="elevo-assets-group"><h4>Language & options</h4><button className="elevo-language-option" onClick={() => setChoice("English (USA)")}><span>🇺🇸</span>English (USA)<i>{choice === "English (USA)" ? "●" : "○"}</i></button><button className="elevo-language-option selected" onClick={() => setChoice("English (UK)")}><span>🇬🇧</span>English (UK)<i>{choice === "English (UK)" ? "●" : "○"}</i></button><div className="elevo-answer-options">{["Cars", "People", "Toys", "Clouds"].map(option=><button key={option} className={`${choice===option?"selected":""} ${option==="People"?"correct":""}`} onClick={()=>setChoice(option)}>{option}</button>)}</div></div>
    <div className="elevo-assets-group"><h4>Selection & helper</h4><label className="elevo-toggle"><span>Toggle</span><input type="checkbox" checked={checked} onChange={event=>setChecked(event.target.checked)}/><i /></label><button className="elevo-tooltip-demo" title="Helpful hint">Get hint <span>?</span></button><div className="elevo-feedback-state"><span>🎉</span><b>Nice...</b><small>Great work, keep going!</small></div><div className="elevo-feedback-state is-wrong"><span>♡</span><b>Oops... No Worry</b><small>There's always another try.</small></div><span className="elevo-state-chip">Unexpectedly</span><span className="elevo-state-chip is-good">Correct answer</span></div>
    <div className="elevo-assets-group elevo-performance"><h4>Performance</h4><div><strong>Daily progress</strong><span>Year: All</span><i><b /></i></div></div>
  </div>;
}

function SpacingPreview({ ds, variant }: { ds: DesignSystem; variant: "form-shell" | "form" | "modal" }) {
  const aliases = getSpacingAliases(ds);
  const scale = getSpacingScale(ds);
  const entries = [
    ["Page margin", "pageMargin"], ["Container padding", "containerPadding"], ["Section gap", "sectionGap"],
    ["Component gap", "componentGap"], ["Card padding", "cardPadding"], ["Element gap", "elementGap"],
  ] as const;
  const shownEntries = variant === "form-shell" ? entries.slice(0, 2) : variant === "form" ? entries.slice(2) : entries;
  return <div className={`eg-spacing-markers eg-spacing-markers-${variant}`} aria-label="Semantic spacing measurements">{shownEntries.map(([label, key]) => {
    const value = scale[aliases[key]];
    return <span className={`eg-spacing-marker eg-spacing-marker-${key}`} key={key} title={`${label}: ${aliases[key]} · ${value}px`} style={{ "--spacing-marker-color": semanticSpacingColors[key], "--spacing-marker-size": `${value}px` } as CSSProperties}><span>{aliases[key]}</span><small>{value}px</small></span>;
  })}</div>;
}

export function ComponentGallery({ ds, buttonSize, onButtonSizeChange, previewCategory, onPreviewCategoryChange }: { ds: DesignSystem; buttonSize: ButtonSize; onButtonSizeChange: (size: ButtonSize) => void; previewCategory: PreviewCategory; onPreviewCategoryChange: (category: PreviewCategory) => void }) {
  const isElevoPreset = ds.id === "ds-learning-bright";
  const buttonVariants = isElevoPreset ? ["Primary", "Secondary", "Outline", "Correct", "Wrong"] : ds.tokens.some(token => token.name === "color.brand.tertiary") ? ["Primary", "Secondary", "Tertiary", ...variants.slice(2)] : variants;
  const buttonMetrics = getButtonSize(ds, buttonSize);
  // Elevo's M button keeps the 52px touch target and raised treatment specified by its linked Figma component sheet; other presets use shared button size tokens.
  const useFigmaButtonMetrics = isElevoPreset && buttonSize === "M";
  const elevoButtonStyle = {
    "--el-button-height": `${useFigmaButtonMetrics ? 52 : buttonMetrics.height}px`,
    "--el-button-font-size": `${useFigmaButtonMetrics ? tokenValue(ds, "typography.button.font-size", "16px") : `${buttonMetrics.fontSize}px`}`,
    "--el-button-font-weight": `${useFigmaButtonMetrics ? tokenValue(ds, "typography.button.font-weight", "800") : buttonMetrics.fontWeight}`,
    "--el-button-padding-x": `${useFigmaButtonMetrics ? tokenValue(ds, "spacing.button.padding-x", "24px") : `${buttonMetrics.paddingX}px`}`,
    "--el-button-padding-y": `${useFigmaButtonMetrics ? tokenValue(ds, "spacing.button.padding-y", "14px") : `${buttonMetrics.paddingY}px`}`,
  } as CSSProperties;
  const typography = getTypography(ds);
  const [notice, setNotice] = useState("");
  const [copiedColor, setCopiedColor] = useState("");
  const [tabs, setTabs] = useState([0, 0, 0, 0]);
  const [navSelection, setNavSelection] = useState([0, 0, 0, 0]);
  const [plan, setPlan] = useState("starter");
  const [remember, setRemember] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [card, setCard] = useState("1234 1234 1234 1234");
  const [cvc, setCvc] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const primary = tokenValue(ds, "color.brand.primary");
  const secondary = tokenValue(ds, "color.brand.secondary");
  const brandPalettes = [...brandScales(ds), { brand: "neutral", shades: neutralScaleForSystem(ds) }];
  const colorScales = [...brandPalettes, ...functionalScales(ds)];
  const savedProfiles = ds.foundations.background?.profiles;
  const backgroundProfiles = savedProfiles ?? {
    light: { page: "#FFFFFF", surface: "#FFFFFF", tertiary: "#F8FAFC", soft: "#F1F5F9", elevated: "#FFFFFF", gradientStart: primary, gradientEnd: secondary, gradientAngle: 135, surfaceLevels: 2 as const },
    soft: { page: "#F1F5F9", surface: "#FFFFFF", tertiary: "#FFFFFF", soft: "#F8FAFC", elevated: "#FFFFFF", gradientStart: primary, gradientEnd: secondary, gradientAngle: 135, surfaceLevels: 2 as const },
    gradient: { page: "#FAF8F2", surface: "#FFFFFF", tertiary: "#FFFFFF", soft: "#F8FAFC", elevated: "#FFFFFF", gradientStart: primary, gradientEnd: secondary, gradientAngle: 135, gradientPreset: "linear" as const, surfaceLevels: 2 as const },
  };
  const demoStyle = (profile: typeof backgroundProfiles.light) => ({
    "--demo-page": profile.page,
    "--demo-surface": profile.surface,
    "--demo-tertiary": profile.tertiary,
    "--demo-soft": profile.surfaceLevels === 1 ? profile.tertiary : profile.soft,
    "--demo-elevated": profile.elevated,
    "--demo-gradient-start": profile.gradientStart,
    "--demo-gradient-end": profile.gradientEnd,
    "--demo-gradient-angle": `${profile.gradientAngle}deg`,
    "--demo-aura-base": profile.page,
    ...gradientPresetStyle(profile.gradientPreset ?? "linear", profile.gradientStart, profile.gradientEnd, profile.gradientAngle, profile.page),
  } as CSSProperties);
  const copyColor = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const input = document.createElement("textarea");
      input.value = value;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    setCopiedColor(value);
    window.setTimeout(() => setCopiedColor(current => current === value ? "" : current), 1600);
  };
  const confirm = () => { dialog.current?.close(); setNotice(`Đã chọn gói ${plan === "starter" ? "Starter" : "Pro"}.`); };
  return <div className={`elevo-gallery ${isElevoPreset ? "elevo-learning-gallery" : ""}`} aria-label={`${ds.name} component gallery`} style={{ "--button-height": `${useFigmaButtonMetrics ? "52px" : `${buttonMetrics.height}px`}`, "--button-font-size": useFigmaButtonMetrics ? tokenValue(ds, "typography.button.font-size", "16px") : `${buttonMetrics.fontSize}px`, "--button-font-weight": useFigmaButtonMetrics ? tokenValue(ds, "typography.button.font-weight", "800") : `${buttonMetrics.fontWeight}`, "--button-shadow": tokenValue(ds, "shadow.button.primary", "0 4px 0 #3E8CB2"), "--button-correct": tokenValue(ds, "color.button.correct", "#34C759"), "--button-correct-text": tokenValue(ds, "color.button.correct.text", "#F0FFF4"), "--button-correct-shadow": tokenValue(ds, "shadow.button.correct", "0 4px 0 #217E38"), "--button-incorrect": tokenValue(ds, "color.button.incorrect", "#E04A4A"), "--button-incorrect-text": tokenValue(ds, "color.button.incorrect.text", "#FFF0F0"), "--button-incorrect-shadow": tokenValue(ds, "shadow.button.incorrect", "0 4px 0 #A51C1C"), "--button-radius": tokenValue(ds, "radius.button", "16px"), "--button-padding-x": useFigmaButtonMetrics ? tokenValue(ds, "spacing.button.padding-x", "24px") : `${buttonMetrics.paddingX}px`, "--button-padding-y": useFigmaButtonMetrics ? tokenValue(ds, "spacing.button.padding-y", "14px") : `${buttonMetrics.paddingY}px` } as CSSProperties}>
    {previewCategory === "foundation" && <>
    <Section title="0. Background modes" meta="Page / Surface">
      <div className="eg-background-modes">
        {(["light", "soft", "gradient"] as const).map(mode => <article key={mode} className={`eg-background-demo eg-background-demo-${mode} ${mode === "gradient" && backgroundProfiles.gradient.gradientPreset !== "linear" ? `aura-gradient-demo gradient-preset-${backgroundProfiles.gradient.gradientPreset}` : ""}`} style={demoStyle(backgroundProfiles[mode])}>
          <span>{mode[0].toUpperCase() + mode.slice(1)}</span>
          <div className="eg-background-surface"><strong>Nền phụ 1</strong><div className="eg-background-mini-grid"><span>Nền phụ 2</span><span>Nền phụ 2</span><span>Elevated</span></div><small>Surface tint trên canvas {mode}</small></div>
        </article>)}
      </div>
    </Section>
    <Section title="1. Brand, Neutral & Functional color scales" meta="50–950 · representative color at 600">
      <div className="eg-brand-scales" aria-label="Brand, neutral, and functional color scales">
        {colorScales.map(({ brand, shades }) => <div className="eg-brand-scale" key={brand}>
          <strong>{brand}</strong>
          <div>{shades.map(({ step, value }) => <button type="button" key={step} title={`Copy ${value}`} aria-label={`Copy ${brand} ${step}, ${value}`} onClick={() => void copyColor(value)}><span style={{ background: value }} /><small>{step}</small></button>)}</div>
        </div>)}
        <output className="eg-color-copy-notice" aria-live="polite">{copiedColor ? `Đã copy ${copiedColor}` : "Click vào ô màu để copy mã HEX"}</output>
      </div>
    </Section>
    <Section title="Thang Typography" meta={`${ds.foundations.fontFamily} · ${typography.ratio.toFixed(3)}`}><div className="eg-type-scale">{typeRoles.map((role, index) => {
      const style = typography.roles[role];
      const samples = ["Thiết kế có hệ thống", "Xây dựng giao diện nhất quán", "Nền tảng thị giác vững chắc", "Phân cấp rõ ràng, dễ quét", "Một font family duy nhất, phân cấp bằng size, weight và line-height.", "NHÃN TRƯỜNG NHẬP LIỆU", "Chú thích phụ · cập nhật 28 ms"];
      return <div className={`eg-type-${index}`} key={role}><span>{role}<small>{style.size}/{style.lineHeight} · {style.weight}</small></span><p style={{ fontSize: style.size, lineHeight: style.lineHeight, fontWeight: style.weight }}>{samples[index]}</p></div>;
    })}</div></Section>
    <Section title="Elevation & Shadows" meta="5 levels"><div className="eg-elevations">{[["L0 · Flat", "Element phẳng", "Nền / divider / item không nổi"], ["L1 · Low", "Card mặc định", "Card và vùng nội dung tương tác"], ["L2 · Medium", "Hover / Selected", "Nhấn mạnh tương tác hoặc được chọn"], ["L3 · High", "Dropdown / Popover", "Menu ngữ cảnh và nội dung phụ"], ["L4 · Overlay", "Modal / Dialog", "Lớp phủ toàn cục, cần nổi bật"]].map(([level, label, detail], index) => <article key={level}><div className={`eg-elevation-${index}`}>{level}</div><strong>{label}</strong><small>{detail}</small></article>)}</div></Section>
    </>}
    {previewCategory === "component" && <>
    {isElevoPreset && <Section title="0. Elevo component assets" meta="Reusable states">
      <ElevoComponentAssets onAction={setNotice} />
    </Section>}
    <Section title="1. Actions & Buttons" meta="Atoms / States">
      <div className="eg-size-bar"><span>Size</span><div className="eg-segment" aria-label="Button size">{buttonSizeOrder.map(value => <button key={value} aria-pressed={buttonSize === value} onClick={() => onButtonSizeChange(value)}>{value}</button>)}</div><code>{getButtonSize(ds, buttonSize).height}px · default / hover / active / focus / disabled</code></div>
      <div className="eg-matrix-scroll"><table className="eg-matrix"><thead><tr><th>Variant</th>{states.map(state => <th key={state}>{state}</th>)}</tr></thead><tbody>{buttonVariants.map(variant => <tr key={variant}><th scope="row">{variant}</th>{states.map(state => <td key={state}><GalleryButton variant={variant.toLowerCase()} className={`eg-state-${state.toLowerCase()}`} disabled={state === "Disabled"} aria-label={`${variant} ${state}`} onClick={() => setNotice(`${variant} · ${state}`)}>{variant === "Soft" ? "Ghost" : variant}</GalleryButton></td>)}</tr>)}</tbody></table></div>
      <div className="eg-caption">Icon placement / placeholders</div>
      <div className="eg-row"><GalleryButton onClick={() => setNotice("Icon trái")}><Square />Icon trái</GalleryButton><GalleryButton onClick={() => setNotice("Icon phải")}>Icon phải<Square /></GalleryButton><GalleryButton variant="outline" onClick={() => setNotice("Outline + icon")}><Square />Outline + icon</GalleryButton><GalleryButton aria-label="Filled icon button" title="Filled icon button" onClick={() => setNotice("Filled icon")}><Square /></GalleryButton><GalleryButton variant="outline" aria-label="Outline icon button" title="Outline icon button" onClick={() => setNotice("Outline icon")}><Square /></GalleryButton></div>
      <output className="eg-notice" aria-live="polite">{notice}</output>
    </Section>

    <Section title="2. Badges & Status" meta="Atoms"><div className="eg-row eg-badges"><span className="eg-badge eg-primary">Default</span><span className="eg-badge eg-secondary">Secondary</span><span className="eg-badge eg-outline">Outline</span><span className="eg-badge eg-success-soft">• Success</span><span className="eg-badge eg-warning-soft">Warning</span><span className="eg-badge eg-danger-soft">Destructive</span></div></Section>

    <Section title="3. Inputs" meta="Forms">
      <div className="eg-form-canvas" aria-label="Form background token hierarchy">
      <span className="eg-layer-label">Page · background.page</span>
      <SpacingPreview ds={ds} variant="form-shell" />
      <form ref={form} className="eg-form" onSubmit={event => { event.preventDefault(); setSubmitted(true); if (/^\d{16}$/.test(card.replace(/\s/g, "")) && agreed) dialog.current?.showModal(); }}>
        <span className="eg-layer-label">Surface · surface.default</span>
        <h4>Nâng cấp gói đăng ký</h4><p>Bạn đang dùng gói Free. Nâng lên gói Pro để mở khóa toàn bộ tính năng.</p><SpacingPreview ds={ds} variant="form" />
        <div className="eg-form-pair"><label>Name<input name="name" defaultValue="Nguyễn An" required autoComplete="off" /></label><label>Email<span className="eg-input-icon"><Mail /><input name="email" type="email" placeholder="ban@calmfinance.vn" required /></span></label></div>
        <fieldset className={`eg-card-fields ${/^\d{3,4}$/.test(cvc) ? "" : "eg-fields-invalid"}`}><legend>Card Number</legend><div><input aria-label="Card number" inputMode="numeric" value={card} onChange={e => setCard(e.target.value)} aria-invalid={submitted && !/^\d{16}$/.test(card.replace(/\s/g, ""))} /><input aria-label="Expiry date" placeholder="MM/YY" required pattern="(0[1-9]|1[0-2])/[0-9]{2}" /><input aria-label="CVC" placeholder="CVC" inputMode="numeric" required pattern="[0-9]{3,4}" value={cvc} onChange={e => setCvc(e.target.value)} aria-invalid={!/^\d{3,4}$/.test(cvc)} aria-describedby={!/^\d{3,4}$/.test(cvc) ? "eg-cvc-error" : undefined} /></div>{!/^\d{3,4}$/.test(cvc) && <small id="eg-cvc-error">Mã CVV không hợp lệ</small>}{submitted && !/^\d{16}$/.test(card.replace(/\s/g, "")) && <small role="alert">Số thẻ phải có 16 chữ số.</small>}</fieldset>
        <label>Color<select defaultValue=""><option value="" disabled>Chọn màu chủ đạo</option><option>Blue</option><option>Green</option><option>Teal</option></select></label>
        <fieldset className="eg-plan"><legend>Plan</legend><p>Chọn gói phù hợp nhất với nhu cầu của bạn.</p><div>{["starter", "pro"].map(value => <label key={value} className={plan === value ? "selected" : ""}><input type="radio" name="subscription-plan" value={value} checked={plan === value} onChange={() => setPlan(value)} /><span><strong>{value === "starter" ? "Starter plan" : "Pro plan"}</strong><small>{value === "starter" ? "Phù hợp cho cá nhân bắt đầu." : "Dành riêng nâng cao, nhiều dung lượng hơn."}</small></span></label>)}</div></fieldset>
        <label>Notes<textarea placeholder="Nhập ghi chú tại đây..." rows={2} /></label>
        <label className="eg-switch-label"><span><strong>Ghi nhớ đăng nhập</strong><small>Giữ phiên trong 30 ngày</small></span><input className="eg-switch" type="checkbox" role="switch" checked={remember} onChange={e => setRemember(e.target.checked)} /></label>
        <label className="eg-check"><input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} />Tôi đồng ý với điều khoản và điều kiện</label>
        <label className="eg-check"><input type="checkbox" defaultChecked />Cho phép gửi email cho tôi</label>
        {submitted && !agreed && <small className="eg-error" role="alert">Vui lòng đồng ý với điều khoản và điều kiện.</small>}
        <div className="eg-form-actions eg-upgrade-actions"><GalleryButton variant="outline" onClick={() => { form.current?.reset(); setPlan("starter"); setRemember(true); setAgreed(false); setSubmitted(false); setCvc(""); setCard("1234 1234 1234 1234"); }}>Hủy</GalleryButton><div className="eg-upgrade-action-group"><GalleryButton variant="soft" onClick={() => setNotice("Đã lưu bản nháp.")}>Lưu nháp</GalleryButton><GalleryButton type="submit">Nâng cấp gói</GalleryButton></div></div>
      </form>
      </div>
      <article className="eg-dialog-specimen"><span className="eg-avatar">S</span><h4>Nâng cấp gói đăng ký</h4><p>Bạn đang dùng gói Free. Nâng lên gói Pro để mở khóa toàn bộ tính năng.</p><SpacingPreview ds={ds} variant="modal" /><div className="eg-form-actions"><GalleryButton variant="outline" onClick={() => setNotice("Đã hủy nâng cấp.")}>Hủy</GalleryButton><GalleryButton onClick={() => dialog.current?.showModal()}>Nâng cấp gói</GalleryButton></div></article>
      <dialog ref={dialog} className="eg-dialog" aria-labelledby="upgrade-heading" onClick={e => { if (e.target === e.currentTarget) e.currentTarget.close(); }}><button className="eg-close" aria-label="Đóng" onClick={() => dialog.current?.close()}><X size={18} /></button><span className="eg-avatar">S</span><h4 id="upgrade-heading">Nâng cấp gói đăng ký</h4><p>Xác nhận chọn gói {plan === "starter" ? "Starter" : "Pro"} cho bản xem trước.</p><SpacingPreview ds={ds} variant="modal" /><div className="eg-form-actions"><GalleryButton variant="outline" onClick={() => dialog.current?.close()}>Hủy</GalleryButton><GalleryButton onClick={confirm}>Xác nhận</GalleryButton></div></dialog>
    </Section>

    <Section title="5. Data Display" meta="Cards & Metrics"><div className="eg-metrics"><article><span>Số dư khả dụng</span><strong className="eg-balance">$124,592.00</strong><small className="eg-growth"><TrendingUp size={13} />+8.4% tháng này</small></article><article><div className="eg-payment"><span className="eg-avatar">S</span><div><strong>Stripe Payout</strong><small>14:20 · Hôm nay</small></div><b>+$4,250</b></div><div className="eg-row eg-payment-tags"><span>Đã duyệt</span><span>Thành công</span><span>Ngân hàng</span></div></article></div></Section>

    <Section title="6. Navigation & Tabs" meta="Molecules">
      <div className="eg-navbar-samples">
        {(["Pill · icon + text", "Pill · icon only", "Normal · icon + text"] as const).map((variant, index) => <div className="eg-navbar-row" key={variant}>
          <span>{variant}</span>
          <nav className={`eg-navbar ${index < 2 ? "eg-navbar-pill" : "eg-navbar-normal"} ${index === 1 ? "eg-navbar-icons" : ""}`} aria-label={variant}>
            {navItems.map(({ label, Icon }, itemIndex) => <button key={label} className={navSelection[index] === itemIndex ? "selected" : ""} aria-label={label} aria-current={navSelection[index] === itemIndex ? "page" : undefined} title={label} onClick={() => setNavSelection(previous => previous.map((value, i) => i === index ? itemIndex : value))}><Icon aria-hidden="true" size={index === 1 ? 19 : 16} />{index !== 1 && <span>{label}</span>}</button>)}
          </nav>
        </div>)}
      </div>
      <div className="eg-caption">Tabs</div>
      <div className="eg-tabs-samples">{["Pill", "+Icon", "Only icon", "Line"].map((style, index) => <div className="eg-tabs-row" key={style}><span>{style}</span><div className={`eg-tabs eg-tabs-${index}`} role="group" aria-label={`${style} tabs`}>{tabLabels.map((label, n) => <button key={label} aria-label={label} aria-pressed={tabs[index] === n} title={label} onClick={() => setTabs(previous => previous.map((value, i) => i === index ? n : value))}>{(index === 1 || index === 2) && <span className="eg-tab-dot" />}{index !== 2 && label}</button>)}</div></div>)}</div>
    </Section>

    {ds.id === "ds-learning-bright" && <Section title="8. Elevo screen assets" meta="375 × 812 px · Figma">
      <div className="elevo-screen-assets">{ds.designAssets?.filter(asset => asset.screenKey).map(asset => <ElevoScreen asset={asset} buttonStyle={elevoButtonStyle} key={asset.id} />)}</div>
    </Section>}
    {ds.id !== "ds-learning-bright" && <Section title="7. Templates ứng dụng mobile" meta="375 × 816 px"><div className="eg-phones">{["Mobile login", "Home", "Settings", "Content", "Chat / Bot"].map((title, i) => <div key={title}><MobileScreen screen={i} /><div className="eg-phone-caption">{title}</div></div>)}</div></Section>}
    </>}
    <div className="preview-category-float" role="tablist" aria-label="Preview category">
      <button type="button" role="tab" aria-selected={previewCategory === "foundation"} onClick={() => onPreviewCategoryChange("foundation")}>Foundation</button>
      <button type="button" role="tab" aria-selected={previewCategory === "component"} onClick={() => onPreviewCategoryChange("component")}>Component</button>
    </div>
  </div>;
}

function MobileScreen({ screen }: { screen: number }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [dark, setDark] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [action, setAction] = useState("");
  return <article className={`eg-phone ${dark ? "eg-phone-dark" : ""}`} aria-label={`Màn hình mobile ${screen + 1}, 375 × 816 px`}>
    <div className="eg-phone-status" aria-label="Thanh trạng thái"><strong>9:41</strong><span><Signal size={16} fill="currentColor" /><Wifi size={16} /><BatteryFull size={21} /></span></div>
    <div className="eg-phone-content">
    {screen === 0 && <div className="eg-login"><span className="eg-app-icon"><LayoutGrid /></span><h4>{loggedIn ? "Chào Nguyễn An!" : "Chào mừng trở lại"}</h4><p>{loggedIn ? "Bạn đã đăng nhập bản xem trước." : "Đăng nhập để tiếp tục quản lý tài chính."}</p><form onSubmit={e => { e.preventDefault(); setLoggedIn(true); }}><label className="eg-input-icon"><Mail /><input aria-label="Login email" placeholder="nguyen.an@gmail.com" type="email" required /></label><label className="eg-input-icon"><LockKeyhole /><input aria-label="Login password" type="password" placeholder="••••••••" required /></label><GalleryButton type="submit">Đăng nhập</GalleryButton></form><small>Hoặc</small><GalleryButton variant="outline" onClick={() => setLoggedIn(true)}>Tiếp tục với Google</GalleryButton><p>Chưa có tài khoản? <button className="eg-text-button" onClick={() => setAction("Đăng ký tài khoản")}>Đăng ký</button></p>{action && <small role="status">{action}</small>}</div>}
    {screen === 1 && <><div className="eg-phone-top"><strong>Nguyễn An</strong><Bell size={16} /></div><div className="eg-account"><small>Tổng số dư</small><h4>$124,592.00</h4><div>{["Chuyển tiền", "Nạp", "Rút"].map(label => <button key={label} onClick={() => setAction(label)}>{label}</button>)}</div></div><div className="eg-phone-top"><strong>Giao dịch gần đây</strong><small>Xem tất cả</small></div>{[["Grab", "Di chuyển", "-$12.40"], ["Highlands", "Ăn uống", "-$5.80"], ["Stripe", "Thu nhập", "+$4,250"]].map(([name, detail, amount]) => <div className="eg-phone-transaction" key={name}><span className="eg-avatar">{name[0]}</span><span><strong>{name}</strong><small>{detail}</small></span><b>{amount}</b></div>)}{action && <p role="status">{action}: chọn tài khoản giao dịch.</p>}<nav className="eg-phone-nav">{[Home, Search, TrendingUp, User].map((Icon, i) => <button key={i} aria-label={["Trang chủ", "Tìm kiếm", "Báo cáo", "Hồ sơ"][i]} onClick={() => setAction(["Trang chủ", "Tìm kiếm", "Báo cáo", "Hồ sơ"][i])}><Icon size={16} /></button>)}</nav></>}
    {screen === 2 && <><h4>Cài đặt</h4><div className="eg-profile"><span className="eg-avatar">NA</span><div><strong>Nguyễn An</strong><small>Gói Pro · Đã xác thực</small></div></div><section className="eg-settings-card"><div className="eg-caption">Tài khoản</div>{[[User, "Hồ sơ cá nhân"], [ShieldCheck, "Bảo mật & Mật khẩu"], [Bell, "Thông báo"]].map(([Icon, label]) => { const ItemIcon = Icon as typeof User; return <button className="eg-setting-item" key={String(label)} onClick={() => setAction(String(label))}><ItemIcon size={15} />{String(label)}<ArrowUpRight size={12} /></button>; })}</section><section className="eg-settings-card"><div className="eg-caption">Tùy chọn</div><label className="eg-switch-label">Xác thực 2 lớp<input type="checkbox" role="switch" className="eg-switch" defaultChecked /></label><label className="eg-switch-label">Chế độ tối<input type="checkbox" role="switch" className="eg-switch" checked={dark} onChange={e => setDark(e.target.checked)} /></label></section>{action && <p role="status">{action}</p>}</>}
    {screen === 3 && <><div className="eg-content-art"><TrendingUp size={64} strokeWidth={1} /></div><small className="eg-category">Đầu tư · 6 phút đọc</small><h4>5 nguyên tắc quản lý dòng tiền cho người mới bắt đầu</h4><div className="eg-author"><span className="eg-avatar">L</span><small>Lê Minh · 28 Thg 9, 2026</small></div><p>Dòng tiền là nền tảng của mọi kế hoạch tài chính. Theo dõi, phân bổ đều đặn và duy trì các khoản dự phòng vững vàng.</p><blockquote>“Đừng tiết kiệm những gì còn lại sau khi chi tiêu, hãy chi tiêu những gì còn lại sau khi tiết kiệm.”</blockquote><p>Bắt đầu bằng quy tắc 50/30/20 và duy trì thói quen mỗi ngày.</p></>}
    {screen === 4 && <><div className="eg-chat-head"><span className="eg-avatar"><MessageCircle size={16} /></span><div><strong>Trợ lý tài chính</strong><small>• Đang hoạt động</small></div><MoreHorizontal size={16} /></div><div className="eg-chat-messages"><p className="eg-chat-user">Làm sao để bắt đầu tiết kiệm?</p><p className="eg-chat-response">Hãy bắt đầu với quy tắc 50/30/20: 50% nhu cầu thiết yếu, 30% mong muốn, 20% tiết kiệm và đầu tư.</p><div className="eg-chat-suggestions">{["Quy tắc 50/30/20?", "Quỹ dự phòng", "Bắt đầu đầu tư", "Lập kế hoạch tháng"].map(label => <button className="eg-chat-suggestion" key={label} onClick={() => setMessages(previous => [...previous, label])}>{label}</button>)}</div>{messages.map((text, i) => <p className="eg-chat-user" key={i}>{text}</p>)}</div><form className="eg-chat-input" onSubmit={e => { e.preventDefault(); if (message.trim()) { setMessages(previous => [...previous, message.trim()]); setMessage(""); } }}><input aria-label="Tin nhắn" placeholder="Nhập câu hỏi..." value={message} onChange={e => setMessage(e.target.value)} /><GalleryButton type="submit" aria-label="Gửi tin nhắn"><Send size={14} /></GalleryButton></form></>}
    </div>
    <div className="eg-phone-controls" aria-label="Thanh điều khiển"><span /></div>
  </article>;
}
