import { useState } from "react";
import { HMI2_DEFAULT, HMIState2 } from "./hmi2";
import { PortraitCOSControl, PortraitFRXControl, PortraitHomeDesign, PortraitHomeVariant } from "./portrait-hmi";
import "../styles/portrait-home-comparison.css";

export function PortraitHomeComparison() {
  const [tab, setTab] = useState<PortraitHomeVariant>("A");
  const [control, setControl] = useState<null | "cos" | "frx">(null);
  const [state, setState] = useState<HMIState2>({ ...HMI2_DEFAULT, screen: "home" });
  const update = (patch: Partial<HMIState2>) => setState(previous => ({ ...previous, ...patch }));
  const open = (mode: "cos" | "frx") => {
    update({ screen: mode, laserState: "standby" });
    setControl(mode);
  };
  const back = () => {
    update({ screen: "home", laserState: "standby" });
    setControl(null);
  };
  return <main className="portrait-home-comparison">
    <header className="portrait-home-comparison__toolbar">
      <div><strong>Portrait Home Comparison</strong><span>768 × 1024</span></div>
      <nav aria-label="Home design versions">
        {(["A", "B", "C", "D"] as PortraitHomeVariant[]).map(version => <button key={version} data-active={tab === version} onClick={() => { setTab(version); setControl(null); }}>Version {version}</button>)}
      </nav>
    </header>
    <div className="portrait-home-comparison__stage">
          <div className="portrait-home-comparison__canvas">
            {control === "cos"
              ? <PortraitCOSControl state={state} update={update} onBack={back}/>
              : control === "frx"
                ? <PortraitFRXControl state={state} update={update} onBack={back}/>
                : <PortraitHomeDesign variant={tab} onCOS={() => open("cos")} onFRX={() => open("frx")}/>
            }
          </div>
        </div>
  </main>;
}
