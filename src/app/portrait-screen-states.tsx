import React, { useState } from "react";
import { HMI2_DEFAULT, HMIState2 } from "./hmi2";
import { CosParamKey, PortraitCOSControl, PortraitSplash } from "./portrait-hmi";

const noop = () => undefined;
const noopUpdate = (_patch: Partial<HMIState2>) => undefined;

type StateItem = {
  id: string;
  name: string;
  description: string;
  state?: Partial<HMIState2>;
  activeParam?: CosParamKey;
  splash?: boolean;
};

const STATES: StateItem[] = [
  { id: "SCR-001", name: "Splash", description: "시스템 시작 및 초기화", splash: true },
  { id: "COS-001", name: "COS · Standby", description: "기본 대기 상태", state: { laserState: "standby" } },
  { id: "COS-002", name: "COS · CW", description: "Continuous Wave 선택", state: { co2LaserMode: "CW" } },
  { id: "COS-003", name: "COS · Pulse", description: "Pulse / Repeat 선택", state: { co2LaserMode: "Pulse", co2PulseMode: "Repeat" } },
  { id: "COS-004", name: "COS · Ready", description: "풋스위치 활성 준비", state: { laserState: "ready" } },
  { id: "COS-005", name: "COS · Emission", description: "레이저 조사 중", state: { laserState: "lasering" } },
  { id: "COS-006", name: "COS · Paused", description: "조사 일시 정지", state: { laserState: "paused" } },
  { id: "COS-007", name: "COS · Sound Off", description: "사운드 비활성 상태", state: { soundOn: false } },
  { id: "COS-008", name: "Pulse · Continuous", description: "Continuous 버튼 선택", state: { co2LaserMode: "Pulse", co2PulseMode: "Continuous" } },
  { id: "COS-009", name: "Pulse · Single", description: "Single 버튼 선택", state: { co2LaserMode: "Pulse", co2PulseMode: "Single" } },
  { id: "COS-010", name: "Pulse · Repeat", description: "Repeat 버튼 선택", state: { co2LaserMode: "Pulse", co2PulseMode: "Repeat" } },
  { id: "COS-011", name: "Parameter · Power", description: "Power 탭 선택", activeParam: "power" },
  { id: "COS-012", name: "Parameter · Duration", description: "Duration 탭 선택", activeParam: "duration" },
  { id: "COS-013", name: "Parameter · Interval", description: "Interval 탭 선택", activeParam: "interval" },
  { id: "COS-014", name: "Parameter · On Time", description: "On Time 탭 선택", activeParam: "onTime" },
  { id: "COS-015", name: "Parameter · Off Time", description: "Off Time 탭 선택", activeParam: "offTime" },
];

function Preview({ item, liveState }: { item: StateItem; liveState: HMIState2 }) {
  const state: HMIState2 = { ...HMI2_DEFAULT, ...liveState, screen: "cos", laserState: "standby", ...item.state };
  return <div style={{ width: 768, height: 1024, flex: "0 0 auto", overflow: "hidden", borderRadius: 16, background: "#fff", boxShadow: "0 18px 50px rgba(28,55,82,.16)" }}>
    <div style={{ width: 768, height: 1024 }}>
      <div className="portrait-hmi-root hmi-root" data-screen-frame="true">
        {item.splash ? <PortraitSplash onDone={noop}/> : <PortraitCOSControl state={state} update={noopUpdate} forcedActiveParam={item.activeParam}/>} 
      </div>
    </div>
  </div>;
}

export function PortraitScreenStatesPage({ liveState = HMI2_DEFAULT }: { liveState?: HMIState2 }) {
  const [selectedId, setSelectedId] = useState(STATES[0].id);
  const selected = STATES.find(item => item.id === selectedId) ?? STATES[0];

  return <main style={{ height: "100%", display: "flex", overflow: "hidden", background: "#eef4f8", color: "#10243e" }}>
    <aside style={{ width: 270, flex: "0 0 270px", padding: "24px 16px", overflowY: "auto", background: "#fff", borderRight: "1px solid #d7e3ef" }}>
      <div style={{ padding: "0 8px 18px", borderBottom: "1px solid #e5edf5" }}>
        <div style={{ color: "#09377c", fontSize: 11, fontWeight: 800, letterSpacing: ".16em" }}>07 · SCREEN STATES</div>
        <h1 style={{ margin: "7px 0 4px", fontSize: 21 }}>COS Screens</h1>
        <p style={{ margin: 0, color: "#71869c", fontSize: 11, lineHeight: 1.5 }}>화면 상태를 선택하세요.</p>
      </div>
      <div style={{ paddingTop: 12 }}>
        {STATES.map(item => {
          const active = item.id === selected.id;
          return <button key={item.id} data-frame-id={item.id} data-frame-name={item.name} onClick={() => setSelectedId(item.id)} style={{ width: "100%", padding: "12px", marginBottom: 5, border: active ? "1px solid #09377c" : "1px solid transparent", borderRadius: 10, background: active ? "#eaf2fb" : "transparent", color: active ? "#09377c" : "#526984", cursor: "pointer", textAlign: "left" }}>
            <span style={{ display: "block", fontFamily: "monospace", fontSize: 10, fontWeight: 800, opacity: .75 }}>{item.id}</span>
            <strong style={{ display: "block", marginTop: 3, fontSize: 13 }}>{item.name}</strong>
          </button>;
        })}
      </div>
    </aside>

    <section style={{ flex: 1, minWidth: 0, overflow: "auto", display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 24px 24px" }}>
      <header style={{ width: "min(100%, 720px)", display: "flex", alignItems: "end", justifyContent: "space-between", marginBottom: 12 }}>
        <div>
          <div style={{ color: "#09377c", fontFamily: "monospace", fontSize: 11, fontWeight: 800 }}>{selected.id}</div>
          <h2 style={{ margin: "5px 0 3px", fontSize: 23 }}>{selected.name}</h2>
          <p style={{ margin: 0, color: "#71869c", fontSize: 12 }}>{selected.description}</p>
        </div>
        <span style={{ padding: "7px 10px", borderRadius: 8, background: "#dfe9f3", color: "#526984", fontSize: 10, fontWeight: 800 }}>768 × 1024</span>
      </header>
      <Preview item={selected} liveState={liveState}/>
    </section>
  </main>;
}
