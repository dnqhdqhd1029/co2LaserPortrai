import React, { useEffect, useMemo, useRef, useState } from "react";
import { HMI2_DEFAULT, HMIState2, HPRESETS, HQTechLogo, LaserState2 } from "./hmi2";
import "../styles/portrait-hmi.css";
import "../styles/portrait-hmi-bold.css";
import "../styles/portrait-home-variants.css";

type CosParamKey = "power" | "duration" | "interval" | "onTime" | "offTime";
type FrxParamKey = "intensity" | "degree" | "density" | "pause";
type PortraitScreen = "home" | "cos" | "frx";

const COS = "#09377C";

function clampStep(cur: number, delta: number, min: number, max: number, step: number) {
  return Math.max(min, Math.min(max, Number((Math.round((cur + delta) / step) * step).toFixed(10))));
}

function Icon({ name }: { name: "back" | "sound" | "target" | "folder" | "save" | "camera" | "chevron" }) {
  const paths = {
    back: <><path d="M15 18l-6-6 6-6"/><path d="M9 12h10"/></>,
    sound: <><path d="M11 5L6 9H3v6h3l5 4V5z"/><path d="M15 9a4 4 0 010 6"/><path d="M18 6a8 8 0 010 12"/></>,
    target: <><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></>,
    folder: <><path d="M3 7h7l2 2h9v9H3z"/><path d="M3 7V5h7l2 2"/></>,
    save: <><path d="M5 3h12l2 2v16H5z"/><path d="M8 3v6h8V3M8 21v-7h8v7"/></>,
    camera: <><rect x="3" y="6" width="18" height="13" rx="3"/><circle cx="12" cy="12.5" r="3.5"/><path d="M8 6l1.5-2h5L16 6"/></>,
    chevron: <path d="M8 10l4 4 4-4"/>,
  };
  return <svg className="portrait-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function ModeWaveform({ type }: { type: "cw" | "pulse" | "continuous" | "single" | "repeat" }) {
  return <svg className="portrait-mode-waveform" viewBox="0 0 72 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {type === "cw" && <path d="M2 12C7 3 13 3 18 12s11 9 16 0 11-9 16 0 11 9 20 0"/>}
    {type === "pulse" && <path d="M2 16h12V5h16v11h18V5h16v11h6"/>}
    {type === "continuous" && <path d="M5 12h62"/>}
    {type === "single" && <path d="M3 16h20V5h20v11h26"/>}
    {type === "repeat" && <><path d="M2 16h8V5h11v11h9V5h11v11h7"/><path d="M53 7l9 5-9 5M62 12h7"/></>}
  </svg>;
}

export function PortraitOriginalModeMark({ mode }: { mode: "cos" | "frx" }) {
  if (mode === "cos") {
    return <div className="portrait-mode-mark portrait-mode-mark--cos"><div className="portrait-mode-mark__core"/><i/><i/><i/><i/><i/><i/></div>;
  }
  return <div className="portrait-mode-mark portrait-mode-mark--frx">{Array.from({ length: 16 }, (_, i) => <i key={i}/>)}</div>;
}

export type PortraitHomeVariant = "A" | "B" | "C" | "D";

function PortraitFlatModeIcon({ mode }: { mode: "cos" | "frx" }) {
  if (mode === "cos") return <svg className="portrait-home-flat-icon" viewBox="0 0 120 120" fill="none" aria-hidden="true">
    <circle cx="60" cy="60" r="20" fill="currentColor" opacity=".95"/>
    {[0,60,120,180,240,300].map(angle => <line key={angle} x1={60 + 30 * Math.cos((angle * Math.PI) / 180)} y1={60 + 30 * Math.sin((angle * Math.PI) / 180)} x2={60 + 52 * Math.cos((angle * Math.PI) / 180)} y2={60 + 52 * Math.sin((angle * Math.PI) / 180)} stroke="currentColor" strokeWidth="7" strokeLinecap="round" opacity=".9"/>)}
  </svg>;
  return <svg className="portrait-home-flat-icon" viewBox="0 0 120 120" fill="currentColor" aria-hidden="true">{Array.from({ length: 16 }, (_, i) => <circle key={i} cx={24 + (i % 4) * 24} cy={24 + Math.floor(i / 4) * 24} r="6"/>)}</svg>;
}

export function PortraitHomeDesign({ variant, onCOS, onFRX }: { variant: PortraitHomeVariant; onCOS: () => void; onFRX: () => void }) {
  if (variant === "A") return <PortraitModeSelection onCOS={onCOS} onFRX={onFRX}/>;
  const visualVariant = ({ B: "a", C: "b", D: "c" } as const)[variant];
  const modes = [
    { id: "cos" as const, title: "COS", description: "Continuous Laser", detail: "CW / Pulse Mode", action: onCOS },
    { id: "frx" as const, title: "FRX", description: "Fractional CO₂", detail: "Shape / Scan / Density", action: onFRX },
  ];
  return <main className={`portrait-screen portrait-home-design portrait-home-design--${visualVariant}`} data-portrait-screen={`home-${variant.toLowerCase()}`}>
    <div className="portrait-home-design__background" aria-hidden="true"/>
    <section className="portrait-home-design__modes" aria-label="Treatment modes">
      {modes.map(mode => <button key={mode.id} className={`portrait-home-option portrait-home-option--${mode.id}`} onClick={mode.action}>
        <div className="portrait-home-option__icon">{variant === "D" ? <PortraitOriginalModeMark mode={mode.id}/> : <PortraitFlatModeIcon mode={mode.id}/>}</div>
        <div className="portrait-home-option__copy"><b>{mode.title}</b><strong>{mode.description}</strong><small>{mode.detail}</small></div>
      </button>)}
    </section>
  </main>;
}

function PortraitSplash({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, 3000);
    return () => window.clearTimeout(timer);
  }, [onDone]);
  return <main className="portrait-screen portrait-splash-screen" data-portrait-screen="splash">
    <div className="portrait-splash-orbit portrait-splash-orbit--navy"/>
    <div className="portrait-splash-orbit portrait-splash-orbit--violet"/>
    <section className="portrait-splash-content">
      <div className="portrait-splash-logo">
        <HQTechLogo width={500} blueColor="#09377C" greenColor="#6D28D9"/>
      </div>
      <div className="portrait-splash-brand"><span>CO₂ LASER SYSTEM</span></div>
      <div className="portrait-splash-segments" aria-hidden="true">
        {Array.from({ length: 10 }, (_, index) => <i key={index} style={{ animationDelay: `${index * 90}ms` }}/>) }
      </div>
      <div className="portrait-splash-label">INITIALIZING</div>
    </section>
  </main>;
}

export function PortraitModeSelection({ onCOS, onFRX }: { onCOS: () => void; onFRX: () => void }) {
  return (
    <main className="portrait-screen portrait-mode-screen" data-portrait-screen="mode-selection">
      <section className="portrait-mode-list" aria-label="Treatment modes">
        <button className="portrait-mode-card portrait-mode-card--cos" onClick={onCOS}>
          <PortraitOriginalModeMark mode="cos"/>
          <span className="portrait-mode-card__copy"><b>COS</b><strong>Continuous Laser</strong><small>CW / Pulse Mode</small></span>
          <span className="portrait-mode-card__arrow">→</span>
        </button>
        <button className="portrait-mode-card portrait-mode-card--frx" onClick={onFRX}>
          <PortraitOriginalModeMark mode="frx"/>
          <span className="portrait-mode-card__copy"><b>FRX</b><strong>Fractional CO₂</strong><small>Shape / Scan / Density</small></span>
          <span className="portrait-mode-card__arrow">→</span>
        </button>
      </section>
    </main>
  );
}

function TopAction({ icon, label, active, onClick }: { icon: "folder" | "save" | "camera"; label: string; active?: boolean; onClick: () => void }) {
  return <button className="portrait-top-action" data-active={active} onClick={onClick} aria-label={label} title={label}><Icon name={icon}/><span>{label}</span></button>;
}

function LightModal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return <div className="portrait-modal-layer" role="dialog" aria-modal="true"><div className="portrait-modal"><header><h2>{title}</h2><button onClick={onClose} aria-label="Close">×</button></header>{children}</div></div>;
}

function ParameterValueCircle({ value, unit, label }: { value: string | number; unit: string; label: string }) {
  return <div className="portrait-value-circle">
    <div className="portrait-value-circle__content"><span>{label}</span><strong>{value}</strong><small>{unit}</small></div>
  </div>;
}

function FrxShapeIcon({ shape }: { shape: HMIState2["frxShape"] }) {
  return <svg className="portrait-frx-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {shape === "Line" && <path d="M3 12h18"/>}
    {shape === "Triangle" && <path d="M12 3l9 18H3z"/>}
    {shape === "Square" && <rect x="3" y="3" width="18" height="18" rx="2"/>}
    {shape === "Oval" && <circle cx="12" cy="12" r="9"/>}
    {shape === "Rim" && <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/></>}
  </svg>;
}

function FrxScanIcon({ mode }: { mode: HMIState2["frxScanMode"] }) {
  if (mode === "Lining") return <svg className="portrait-frx-scan-icon" viewBox="0 0 32 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">{[3,7,11,15,19].map(y => <path key={y} d={`M2 ${y}h28`}/>)}</svg>;
  return <svg className="portrait-frx-scan-icon" viewBox="0 0 32 22" fill="currentColor" aria-hidden="true">{[[4,4],[15,7],[26,3],[9,17],[23,18],[3,13],[29,12],[14,13],[21,10]].map(([x,y], i) => <circle key={i} cx={x} cy={y} r="2.2"/>)}</svg>;
}

export function PortraitCOSControl({ state, update, onBack }: { state: HMIState2; update: (patch: Partial<HMIState2>) => void; onBack: () => void }) {
  const [activeParam, setActiveParam] = useState<CosParamKey>("power");
  const [aimOpen, setAimOpen] = useState(false);
  const aimRef = useRef<HTMLDivElement>(null);
  const [overlay, setOverlay] = useState<null | "call" | "save" | "camera">(null);
  const [presetId, setPresetId] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const locked = state.laserState === "lasering";

  const params = useMemo(() => ({
    power: { label: "Power", value: state.co2Power, unit: "W", min: 1, max: 60, step: 1, field: "co2Power" as const },
    duration: { label: "Duration", value: state.co2Duration.toFixed(1), unit: "ms", min: .1, max: 10, step: .1, field: "co2Duration" as const },
    interval: { label: "Interval", value: state.co2Interval, unit: "ms", min: 1, max: 100, step: 1, field: "co2Interval" as const },
    onTime: { label: "On Time", value: state.co2OnTime.toFixed(1), unit: "s", min: .1, max: 10, step: .1, field: "co2OnTime" as const },
    offTime: { label: "Off Time", value: state.co2OffTime.toFixed(1), unit: "s", min: .1, max: 10, step: .1, field: "co2OffTime" as const },
  }), [state]);
  const selected = params[activeParam];
  useEffect(() => {
    if (!aimOpen) return;
    const closeOnOutsidePress = (event: PointerEvent) => {
      if (!aimRef.current?.contains(event.target as Node)) setAimOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsidePress);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePress);
  }, [aimOpen]);
  const adjust = (direction: -1 | 1) => update({ [selected.field]: clampStep(Number(selected.value), selected.step * direction, selected.min, selected.max, selected.step) });
  const toggleLaser = () => {
    const next: Record<LaserState2, LaserState2> = { standby: "ready", ready: "lasering", lasering: "paused", paused: "lasering" };
    update({ laserState: next[state.laserState] });
  };
  const laserCopy: Record<LaserState2, [string, string]> = {
    standby: ["STANDBY", "Laser inactive"], ready: ["READY", "Footswitch enabled"],
    lasering: ["LASER EMISSION", "Treatment in progress"], paused: ["PAUSED", "Touch to resume"],
  };

  return <main className="portrait-screen portrait-cos-screen" data-portrait-screen="cos-control">
    <header className="portrait-control-header">
      <button className="portrait-back" onClick={onBack} aria-label="Back" title="Back"><Icon name="back"/><span>Back</span></button>
      <div className="portrait-header-mode-badge" aria-label="COS mode">COS</div>
      <div className="portrait-header-actions">
        <button className="portrait-status-button" data-active={state.soundOn} onClick={() => update({ soundOn: !state.soundOn })} aria-label="Sound" title="Sound"><Icon name="sound"/><span>Sound</span></button>
        <div className="portrait-aim-wrap" ref={aimRef}>
          <button className="portrait-status-button portrait-status-button--aim" data-active={state.aimingLevel > 0} onClick={() => setAimOpen(v => !v)} aria-label={`Aiming ${state.aimingLevel || "OFF"}`} title="Aiming"><Icon name="target"/><span>{state.aimingLevel || "OFF"}</span><Icon name="chevron"/></button>
          {aimOpen && <div className="portrait-aim-popover">
            <div className="portrait-aim-bars" role="group" aria-label="Aiming level">
              {([1,2,3,4,5] as const).map(level => <button key={level} aria-label={`Aiming level ${level}`} title={`Level ${level}`} data-active={level <= state.aimingLevel} onClick={() => { update({ aimingLevel: level }); setAimOpen(false); }}><i/></button>)}
            </div>
            <button className="portrait-aim-off" data-active={state.aimingLevel === 0} onClick={() => { update({ aimingLevel: 0 }); setAimOpen(false); }}>OFF</button>
          </div>}
        </div>
        <TopAction icon="camera" label="Camera" active={overlay === "camera"} onClick={() => setOverlay("camera")}/>
      </div>
    </header>

    <div className="portrait-control-body">
      <section className="portrait-mode-panel">
        <div className="portrait-section-heading"><span/><div><strong>LASER MODE</strong></div></div>
        <div className="portrait-segment portrait-segment--two">{(["CW", "Pulse"] as const).map(mode => <button key={mode} data-active={state.co2LaserMode === mode} onClick={() => update({ co2LaserMode: mode })}><ModeWaveform type={mode === "CW" ? "cw" : "pulse"}/><span>{mode}</span></button>)}</div>
        <div className="portrait-section-heading portrait-section-heading--compact"><span/><div><strong>PULSE MODE</strong></div></div>
        <div className="portrait-segment portrait-segment--three">{(["Continuous", "Single", "Repeat"] as const).map(mode => <button key={mode} data-active={state.co2PulseMode === mode} onClick={() => update({ co2PulseMode: mode })}><ModeWaveform type={mode === "Continuous" ? "continuous" : mode === "Single" ? "single" : "repeat"}/><span>{mode}</span></button>)}</div>
      </section>

      <section className="portrait-parameter-panel">
        <div className="portrait-section-heading"><span/><div><strong>PARAMETERS</strong></div></div>
        <div className="portrait-param-tabs">{(Object.keys(params) as CosParamKey[]).map(key => <button key={key} data-active={activeParam === key} onClick={() => setActiveParam(key)}><span>{params[key].label}</span><strong>{params[key].value}<small>{params[key].unit}</small></strong></button>)}</div>
        <div className="portrait-adjuster">
          <button className="portrait-round-control" disabled={locked} onClick={() => adjust(-1)}>−</button>
          <ParameterValueCircle value={selected.value} unit={selected.unit} label={selected.label}/>
          <button className="portrait-round-control" disabled={locked} onClick={() => adjust(1)}>+</button>
        </div>
      </section>
    </div>

    <footer className="portrait-laser-footer">
      <button className="portrait-laser-button" data-state={state.laserState} onClick={toggleLaser}><span>{laserCopy[state.laserState][0]}</span></button>
    </footer>

    {overlay === "call" && <LightModal title="Call Preset" onClose={() => setOverlay(null)}><div className="portrait-preset-list">{HPRESETS.map(p => <button key={p.id} data-active={presetId === p.id} onClick={() => setPresetId(p.id)}><span><strong>{p.name}</strong><small>{p.desc}</small></span><b>{p.power} W</b></button>)}</div><button className="portrait-modal-primary" disabled={!presetId} onClick={() => { const p = HPRESETS.find(x => x.id === presetId); if (p) update({ co2Power: p.power, co2Duration: p.duration, co2Interval: p.interval }); setOverlay(null); }}>Apply preset</button></LightModal>}
    {overlay === "save" && <LightModal title="Save Current Settings" onClose={() => setOverlay(null)}><div className="portrait-save-summary">{Object.values(params).slice(0,3).map(p => <div key={p.label}><span>{p.label}</span><strong>{p.value} {p.unit}</strong></div>)}</div><button className="portrait-modal-primary" onClick={() => setSaved(true)}>{saved ? "Saved" : "Save settings"}</button></LightModal>}
    {overlay === "camera" && <LightModal title="Calibration Work" onClose={() => setOverlay(null)}><div className="portrait-calibration"><Icon name="camera"/><strong>Calibration workspace</strong><p>Camera and calibration controls are ready.</p></div><button className="portrait-modal-primary" onClick={() => setOverlay(null)}>Done</button></LightModal>}
  </main>;
}

export function PortraitFRXControl({ state, update, onBack }: { state: HMIState2; update: (patch: Partial<HMIState2>) => void; onBack: () => void }) {
  const [activeParam, setActiveParam] = useState<FrxParamKey>("intensity");
  const [aimOpen, setAimOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [sizeLocked, setSizeLocked] = useState(false);
  const aimRef = useRef<HTMLDivElement>(null);
  const locked = state.laserState === "lasering";
  const params = useMemo(() => ({
    intensity: { label: "Intensity", value: state.frxIntensity, unit: "", min: 1, max: 60, step: 1, field: "frxIntensity" as const },
    degree: { label: "Degree", value: state.frxDegree, unit: "", min: 1, max: 10, step: 1, field: "frxDegree" as const },
    density: { label: "Density", value: state.frxDensity.toFixed(1), unit: "mm", min: .1, max: 5, step: .1, field: "frxDensity" as const },
    pause: { label: "Pause", value: state.frxPauseTime.toFixed(1), unit: "sec", min: .1, max: 5, step: .1, field: "frxPauseTime" as const },
  }), [state]);
  const selected = params[activeParam];
  useEffect(() => {
    if (!aimOpen) return;
    const closeOnOutsidePress = (event: PointerEvent) => {
      if (!aimRef.current?.contains(event.target as Node)) setAimOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsidePress);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePress);
  }, [aimOpen]);
  const adjust = (direction: -1 | 1) => update({ [selected.field]: clampStep(Number(selected.value), selected.step * direction, selected.min, selected.max, selected.step) });
  const adjustSize = (field: "frxWidth" | "frxLength", direction: -1 | 1) => {
    if (!sizeLocked && !locked) update({ [field]: clampStep(state[field], direction, 5, 40, 1) });
  };
  const toggleLaser = () => {
    const next: Record<LaserState2, LaserState2> = { standby: "ready", ready: "lasering", lasering: "paused", paused: "lasering" };
    update({ laserState: next[state.laserState] });
  };
  const laserCopy: Record<LaserState2, string> = { standby: "STANDBY", ready: "READY", lasering: "LASER EMISSION", paused: "PAUSED" };
  const shapes: HMIState2["frxShape"][] = ["Line", "Triangle", "Square", "Oval", "Rim"];

  return <main className="portrait-screen portrait-frx-screen" data-portrait-screen="frx-control">
    <header className="portrait-control-header">
      <button className="portrait-back" onClick={onBack} aria-label="Back" title="Back"><Icon name="back"/><span>Back</span></button>
      <div className="portrait-header-mode-badge" aria-label="FRX mode">FRX</div>
      <div className="portrait-header-actions">
        <button className="portrait-status-button" data-active={state.soundOn} onClick={() => update({ soundOn: !state.soundOn })} aria-label="Sound" title="Sound"><Icon name="sound"/><span>Sound</span></button>
        <div className="portrait-aim-wrap" ref={aimRef}>
          <button className="portrait-status-button portrait-status-button--aim" data-active={state.aimingLevel > 0} onClick={() => setAimOpen(v => !v)} aria-label={`Aiming ${state.aimingLevel || "OFF"}`} title="Aiming"><Icon name="target"/><span>{state.aimingLevel || "OFF"}</span><Icon name="chevron"/></button>
          {aimOpen && <div className="portrait-aim-popover">
            <div className="portrait-aim-bars" role="group" aria-label="Aiming level">
              {([1,2,3,4,5] as const).map(level => <button key={level} aria-label={`Aiming level ${level}`} data-active={level <= state.aimingLevel} onClick={() => { update({ aimingLevel: level }); setAimOpen(false); }}><i/></button>)}
            </div>
            <button className="portrait-aim-off" data-active={state.aimingLevel === 0} onClick={() => { update({ aimingLevel: 0 }); setAimOpen(false); }}>OFF</button>
          </div>}
        </div>
        <TopAction icon="camera" label="Camera" active={cameraOpen} onClick={() => setCameraOpen(true)}/>
      </div>
    </header>

    <div className="portrait-control-body portrait-frx-body">
      <section className="portrait-mode-panel portrait-frx-mode-panel">
        <div className="portrait-section-heading"><span/><div><strong>SHAPE</strong></div></div>
        <div className="portrait-frx-shapes">{shapes.map(shape => <button key={shape} data-active={state.frxShape === shape} onClick={() => update({ frxShape: shape })}><FrxShapeIcon shape={shape}/><span>{shape}</span></button>)}</div>
        <div className="portrait-frx-secondary">
          <div>
            <div className="portrait-section-heading portrait-section-heading--compact"><span/><div><strong>SCAN MODE</strong></div></div>
            <div className="portrait-frx-scans">{(["Lining", "Random"] as const).map(mode => <button key={mode} data-active={state.frxScanMode === mode} onClick={() => update({ frxScanMode: mode })}><FrxScanIcon mode={mode}/><span>{mode}</span></button>)}</div>
          </div>
          <div>
            <div className="portrait-section-heading portrait-section-heading--compact portrait-frx-size-heading"><span/><div><strong>SIZE</strong></div><button data-active={sizeLocked} onClick={() => setSizeLocked(value => !value)} aria-label={sizeLocked ? "Unlock width and length" : "Lock width and length"}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="10" width="16" height="11" rx="2"/><path d={sizeLocked ? "M8 10V7a4 4 0 0 1 8 0v3" : "M8 10V7a4 4 0 0 1 7.4-2.1"}/></svg>
            </button></div>
            <div className="portrait-frx-sizes">{(["frxWidth", "frxLength"] as const).map(field => <div key={field}><span>{field === "frxWidth" ? "WIDTH" : "LENGTH"}</span><div><button disabled={sizeLocked || locked} onClick={() => adjustSize(field, -1)}>−</button><strong>{state[field]}<small>mm</small></strong><button disabled={sizeLocked || locked} onClick={() => adjustSize(field, 1)}>+</button></div></div>)}</div>
          </div>
        </div>
      </section>

      <section className="portrait-parameter-panel portrait-frx-parameter-panel">
        <div className="portrait-section-heading"><span/><div><strong>PARAMETERS</strong></div></div>
        <div className="portrait-param-tabs portrait-frx-param-tabs">{(Object.keys(params) as FrxParamKey[]).map(key => <button key={key} data-active={activeParam === key} onClick={() => setActiveParam(key)}><span>{params[key].label}</span><strong>{params[key].value}{params[key].unit && <small>{params[key].unit}</small>}</strong></button>)}</div>
        <div className="portrait-adjuster portrait-frx-adjuster">
          <button className="portrait-round-control" disabled={locked} onClick={() => adjust(-1)}>−</button>
          <ParameterValueCircle value={selected.value} unit={selected.unit} label={selected.label}/>
          <button className="portrait-round-control" disabled={locked} onClick={() => adjust(1)}>+</button>
        </div>
      </section>
    </div>

    <footer className="portrait-laser-footer"><button className="portrait-laser-button" data-state={state.laserState} onClick={toggleLaser}><span>{laserCopy[state.laserState]}</span></button></footer>
    {cameraOpen && <LightModal title="Calibration Work" onClose={() => setCameraOpen(false)}><div className="portrait-calibration"><Icon name="camera"/><strong>Calibration workspace</strong></div><button className="portrait-modal-primary" onClick={() => setCameraOpen(false)}>Done</button></LightModal>}
  </main>;
}

export function PortraitHMIRoot({ onStateChange }: { onStateChange?: (s: HMIState2) => void } = {}) {
  const [screen, setScreen] = useState<PortraitScreen>("splash");
  const [state, setState] = useState<HMIState2>({ ...HMI2_DEFAULT, screen: "splash" });
  const update = (patch: Partial<HMIState2>) => setState(previous => ({ ...previous, ...patch }));
  useEffect(() => onStateChange?.(state), [state, onStateChange]);
  const openCOS = () => { update({ screen: "cos", laserState: "standby" }); setScreen("cos"); };
  const openFRX = () => { update({ screen: "frx", laserState: "standby" }); setScreen("frx"); };
  const goHome = () => { update({ screen: "home", laserState: "standby" }); setScreen("home"); };
  return <div className="portrait-hmi-root hmi-root" data-screen-frame="true">
    {screen === "splash"
      ? <PortraitSplash onDone={goHome}/>
      : screen === "home"
      ? <PortraitModeSelection onCOS={openCOS} onFRX={openFRX}/>
      : screen === "cos"
        ? <PortraitCOSControl state={state} update={update} onBack={goHome}/>
        : <PortraitFRXControl state={state} update={update} onBack={goHome}/>
    }
  </div>;
}
