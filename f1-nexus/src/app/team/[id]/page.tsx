export default function TeamDetailPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative w-full h-[320px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/40 to-transparent z-10"></div>
        <div
          className="absolute inset-0 bg-center bg-cover"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC1-QAQVvWdb-Kiwf5RT5IZENcLXPeTtvmGA9K4RDSraR70xD8hoUrBnCOnSSX_-xGgoHCnnZcR2Phz5M1if8joDGhT38u7-smSDe1DRjHGPfEMTyTcZSmzD2WuoSp93yLdvId8TUHfXMRbJtt2cT6eKgUwtVE26X5tcDtRKKCYqxEU78PPC7YuRoxC56KbR6URSKhY9v70ij6EnX5A_RufidkatEWufwmF8VLUm6cU5snyeum0A59py3jW6YyU27VouA9u3V2iwDpB')",
          }}
        ></div>
        <div className="absolute bottom-0 left-0 w-full p-6 z-20 flex flex-col items-center">
          <div className="bg-primary p-3 rounded-xl mb-4 shadow-lg shadow-primary/20">
            <div className="h-12 w-12 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-3xl">shield</span>
            </div>
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase">Scuderia Ferrari</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold border border-primary/30">RANK: 2ND</span>
            <span className="text-slate-400 text-xs font-medium uppercase tracking-widest">2024 Championship</span>
          </div>
        </div>
      </div>

      {/* Season Performance */}
      <section className="px-4 py-8 max-w-5xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-5 w-1 bg-primary"></div>
          <h2 className="text-xl font-bold tracking-tight uppercase">Season Performance</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="glass-card rounded-xl p-5 flex flex-col">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Points</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-100">425</span>
              <span className="text-emerald-500 text-xs font-bold">+12%</span>
            </div>
            <div className="w-full bg-slate-800 h-1 mt-4 rounded-full overflow-hidden">
              <div className="bg-primary h-full" style={{ width: "78%" }}></div>
            </div>
          </div>
          <div className="glass-card rounded-xl p-5 flex flex-col">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Wins</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-100">03</span>
              <span className="text-emerald-500 text-xs font-bold">+1</span>
            </div>
            <div className="flex gap-1 mt-4">
              <div className="h-1 flex-1 bg-primary rounded-full"></div>
              <div className="h-1 flex-1 bg-primary rounded-full"></div>
              <div className="h-1 flex-1 bg-primary rounded-full"></div>
              <div className="h-1 flex-1 bg-slate-800 rounded-full"></div>
            </div>
          </div>
          <div className="glass-card rounded-xl p-5 flex flex-col">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Podiums</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-100">12</span>
              <span className="text-emerald-500 text-xs font-bold">+2</span>
            </div>
            <div className="w-full bg-slate-800 h-1 mt-4 rounded-full overflow-hidden">
              <div className="bg-primary h-full" style={{ width: "60%" }}></div>
            </div>
          </div>
          <div className="glass-card rounded-xl p-5 flex flex-col">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Avg Grid</p>
            <span className="text-3xl font-black text-slate-100">2.4</span>
            <p className="text-slate-500 text-[10px] mt-2 italic leading-tight">Elite Tier Qualifying</p>
          </div>
          <div className="glass-card rounded-xl p-5 flex flex-col col-span-2">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Avg Pit Stop</p>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-black text-slate-100 italic">2.32s</span>
              <div className="flex items-center text-primary">
                <span className="material-symbols-outlined text-sm">bolt</span>
                <span className="text-[10px] font-bold">TOP 3 IN PITLANE</span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <div className="flex-1 bg-slate-800 h-1.5 rounded-full relative">
                <div className="absolute left-0 top-0 h-full w-1/3 bg-primary rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Driver Roster */}
      <section className="px-4 py-8 bg-slate-900/30 max-w-5xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-5 w-1 bg-primary"></div>
          <h2 className="text-xl font-bold tracking-tight uppercase">Driver Roster</h2>
        </div>
        <div className="flex flex-col gap-4">
          {/* Leclerc Card */}
          <div className="glass-card rounded-xl overflow-hidden flex">
            <div
              className="w-32 bg-slate-800 bg-cover bg-top"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCWkZtpEV2xWYYTMh_wcRMIpyW3kyLGFUEgmTKT0nDV0J5X9dYSjE-csIht7hBKvHuzBFlhBT15DBSiM3sMMsxObjGu0XpedulOoH57F9J2INTNMLqeXDaL1fHjJeyTz6S58hPCm9hSbzbNjF4NR4qFL-DKztmPUNk2ODwkWrkTh43VVWm7vnk5sMoERBVH3yzl8pZ_4YMPZZC5czYpROvvE67Viy-6xWWXhMPmwQ8_PVSkSTOOnbZeSYO5vzD8b67GOj2t8VWQEjbS')",
              }}
            ></div>
            <div className="flex-1 p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-black uppercase italic leading-none">C. Leclerc</h3>
                  <p className="text-primary font-bold text-xs uppercase tracking-tighter">Monaco | #16</p>
                </div>
                <span className="text-slate-500 font-bold text-2xl opacity-30 italic">16</span>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-slate-500 text-[10px] uppercase font-bold">Points</p>
                  <p className="text-lg font-bold">235</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[10px] uppercase font-bold">Wins</p>
                  <p className="text-lg font-bold">2</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sainz Card */}
          <div className="glass-card rounded-xl overflow-hidden flex">
            <div
              className="w-32 bg-slate-800 bg-cover bg-top"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAu3lfWLI-kiI8SfeCoMG02Qh9owfhdsp-M0qy_2XAvohnwVn-aKAsJnpm4Is7SqTUt_q5FR7M8xCpiejQLxyfa7TVpvGmPDHNEvIfkwDI35cL91KOnMiOjrvo1Q5-p54k0Sntu0fpl79uAGd4n4U2NHkJd_sDmrkYtsvDNfcDJk25xn41C7GeyORX5Vd4uQuKYdecLS_6SkEoJTuAxp2MdbuY_5kbqPi9noipeBbEe6nl5uHcMAxqwYbc9nWpUW7xuR9NilNL1C2Iz')",
              }}
            ></div>
            <div className="flex-1 p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-black uppercase italic leading-none">C. Sainz</h3>
                  <p className="text-primary font-bold text-xs uppercase tracking-tighter">Spain | #55</p>
                </div>
                <span className="text-slate-500 font-bold text-2xl opacity-30 italic">55</span>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-slate-500 text-[10px] uppercase font-bold">Points</p>
                  <p className="text-lg font-bold">190</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[10px] uppercase font-bold">Wins</p>
                  <p className="text-lg font-bold">1</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Specs */}
      <section className="px-4 py-8 blueprint-grid border-y border-primary/5 max-w-5xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-5 w-1 bg-primary"></div>
          <h2 className="text-xl font-bold tracking-tight uppercase">Technical Specifications</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: "Power Unit", value: "Ferrari 066/12", icon: "bolt" },
            { label: "Chassis", value: "SF-24", icon: "build" },
            { label: "Max RPM", value: "15,000", icon: "speed" },
            { label: "Weight", value: "798 kg", icon: "scale" },
            { label: "ERS Power", value: "120 kW", icon: "battery_charging_full" },
            { label: "Top Speed", value: "372 km/h", icon: "trending_up" },
          ].map((spec) => (
            <div key={spec.label} className="glass-card rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary text-sm">{spec.icon}</span>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{spec.label}</p>
              </div>
              <p className="text-lg font-black text-slate-100">{spec.value}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
