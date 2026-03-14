export interface Article {
  slug: string;
  title: string;
  subtitle: string;
  tag: string;
  tagColor: string;
  circuit: string;
  race: string;
  readTime: string;
  date: string;
  paragraphs: string[];
}

export const ARCHIVE_ARTICLES: Article[] = [
  {
    slug: "tyre-deg-decides-before-lap-one",
    title: "Tyre Deg Decides Before Lap One Even Turns",
    subtitle:
      "Why compound choice at the formation lap seals championship points before a wheel has turned in anger.",
    tag: "STRATEGY DEEP DIVE",
    tagColor: "#f97316",
    circuit: "/circuits/bahrain.webp",
    race: "Bahrain Grand Prix",
    readTime: "6 min read",
    date: "9 March 2026",
    paragraphs: [
      "Long before a Formula 1 car's tyres touch the tarmac in anger, the race is being won or lost. Pirelli's three dry-weather compounds — soft (red wall), medium (yellow), and hard (white) — carry fundamentally different performance and degradation profiles, and the selection teams make before the formation lap sets the entire strategic trajectory of their afternoon. In a sport where the margin between first and fourth can be decided in the pit lane rather than on track, understanding how compound choice shapes race outcomes has become as important as raw car speed. The soft tyre delivers maximum grip but degrades faster and more consistently; the medium balances performance with durability; and the hard is designed for longevity at the cost of outright pace.",

      "The 2024 Bahrain Grand Prix offered a textbook case study in compound management. Pirelli nominated C1, C2, and C3 for the desert circuit, and a two-stop strategy dominated proceedings. The optimal sequence — soft to hard, pitting between Laps 13 and 19, then back to soft for a final burst — was executed to near-perfection by the top finishers. Max Verstappen posted a fastest lap of 1:32.608 on the C3 soft on Lap 39, while the best hard-compound lap in the same stint was around 1:34.090 — revealing a raw delta of 1.5 seconds per lap between the extreme compounds. That gap is precisely why teams fight so aggressively to be on the right tyre at the right moment: every lap on the wrong rubber bleeds irreplaceable time.",

      "The 2024 Italian Grand Prix at Monza illustrated the opposite strategic philosophy. Charles Leclerc and Ferrari opted for a single-stop medium-to-hard strategy, exploiting Monza's comparatively low tyre degradation and the enormous time penalty of the pit lane at the Temple of Speed. By stretching the opening medium stint to the maximum viable window and committing to a long hard run to the flag, Leclerc maintained consistent lap times — unlike rivals who committed to two stops and lost net time through a second pit lane visit. It was a victory built not on fastest laps but on compound preservation, demonstrating that degradation management often matters more than raw tyre performance at specific circuits.",

      "The evolution from 2023 to 2024 illustrated how Pirelli's compound allocations reshape entire strategic landscapes. In 2023, most circuits saw teams run two-stop strategies — typically medium-hard-hard — with medium stints of around 14 laps and hard stints of roughly 22 laps each. By 2024, improved tyre construction and lower degradation rates shifted the optimal approach to a single medium-to-hard stop on many circuits, with teams running approximately 25 laps on mediums and 33 on hards. Singapore 2024 epitomised one-stop dominance: Pirelli's Mario Isola confirmed the long pit lane, costing around 28 seconds per visit, made two-stop strategies economically unviable, with the optimal pit window between Laps 21 and 27.",

      "What separates elite F1 engineers from the rest is not just reacting to tyre behaviour in real time — it is predicting it before the lights go out. Data analytics and simulation tools process historical degradation rates, real-time tyre temperature telemetry, track evolution curves, and fuel-adjusted lap time projections to compute the precise moment a pit stop becomes beneficial. Studies of F1 race outcomes confirm that tyre wear characteristics are significantly more predictive of final race positions than qualifying results. In 2026, with the new active aerodynamics generating higher cornering loads and the uprated MGU-K adding torque stress on tyre exit, the degradation puzzle has only grown more complex — and the engineers who solve it earliest will win the championship.",
    ],
  },
  {
    slug: "ers-deployment-the-invisible-overtake",
    title: "ERS Deployment: The Invisible Overtake",
    subtitle:
      "Data reveals drivers deploying hybrid power 3.4 seconds earlier than rivals — without the fans ever seeing it.",
    tag: "TECHNICAL ANALYSIS",
    tagColor: "#60a5fa",
    circuit: "/circuits/monaco.webp",
    race: "Monaco Grand Prix",
    readTime: "5 min read",
    date: "25 May 2025",
    paragraphs: [
      "Every time a Formula 1 driver stamps on the brake pedal, something remarkable happens: the kinetic energy that would otherwise be lost as heat is harvested by the Motor Generator Unit-Kinetic and stored in a lithium-ion battery pack. This process, the core of F1's Energy Recovery System, transforms braking events — at which a modern F1 car decelerates from 300 km/h to 80 km/h in under two seconds — into stored electrical potential. Under the pre-2026 regulations, the MGU-K was capped at 120 kW of deployable power, providing up to 160 combined horsepower for approximately 33 seconds per lap when working alongside the MGU-H, which harvested energy from turbocharger heat. Together, they formed a hybrid architecture that made managing energy stores as strategically important as managing rubber.",

      "The 2026 regulations brought the most seismic ERS overhaul in the hybrid era's history. The MGU-H — long criticised for its extraordinary manufacturing cost and complexity — was eliminated entirely. In its place, the MGU-K has been uprated from 120 kW to a staggering 350 kW, nearly tripling its previous output and creating a near 50-50 power split between the internal combustion engine and the electrical system. The battery's permitted recharge allowance simultaneously more than doubled, from 4 MJ per lap to over 8 MJ. The consequence is a car that accelerates out of corners with ferocious electrical torque — but which can drain its entire electrical reserve before the end of a long straight if deployed carelessly.",

      "With DRS abolished in 2026, its strategic role has been absorbed by two systems: active aerodynamics that automatically reduces drag in predetermined zones, and 'Overtake Mode' — a driver-deployable manual electrical boost available when within one second of a rival. Unlike the binary nature of DRS, Overtake Mode can be parcelled out in deliberate bursts or concentrated on a single corner exit. The attacking car's MGU-K can deploy its full 350 kW up to 337 km/h, while the defending car's deployment tapers off at 290 km/h — a deliberate regulatory asymmetry designed to encourage overtaking. At the 2026 Australian Grand Prix, Russell and Leclerc spent multiple laps trading Overtake Mode deployments, with Russell's careful energy budgeting ultimately proving decisive.",

      "In the 2023–2025 seasons, ERS deployment was managed across three driver-selectable modes: Hotlap/Overtake mode, Balanced mode for standard race laps, and Charge mode for prioritising harvesting. A driver within a DRS window had a paradoxical advantage: the slipstream from the car ahead reduced aerodynamic load, meaning the following driver needed less ERS to maintain proximity — banking electrical energy for the attack. The defending driver, unable to use DRS, was often forced to burn more ERS to hold position, arriving at the critical moment with less stored energy. This asymmetry was a constant tactical consideration in strategy briefings.",

      "Across a race distance, ERS management resembles a fuel budget with no refuelling option. Spend too aggressively defending in the opening stint and you arrive at the final laps with an empty battery and no electrical response to late attacks. The finest practitioners — Hamilton through his Mercedes years, Verstappen in his Red Bull prime — developed an intuitive feel for their car's energy state, deploying boost at corners where rivals would lose slipstream and conserving during DRS zones where drag reduction did the work for free. In 2026, with ERS now delivering half the car's total power output, this calculus has intensified enormously. The race is no longer just about who is fastest — it is about who still has electricity when it matters most.",
    ],
  },
  {
    slug: "pit-window-evolution",
    title: "Pit Window Evolution: How the Undercut Became the Overcut",
    subtitle:
      "From 2022 to 2026, the strategy pendulum has swung decisively — here is the data behind the shift.",
    tag: "HISTORICAL CONTEXT",
    tagColor: "#a78bfa",
    circuit: "/circuits/italy.webp",
    race: "Italian Grand Prix",
    readTime: "8 min read",
    date: "1 September 2025",
    paragraphs: [
      "The pit stop has always been Formula 1's lever of unpredictability, but the modern era has refined it into a precision instrument. The 'undercut' — pitting earlier than a rival to exploit the pace advantage of fresh tyres — and the 'overcut' — extending a stint to benefit from track position while rivals cycle through stops — became the dominant strategic weapons of the 2022–2026 period. Their relative effectiveness shifted circuit by circuit and season by season, shaped by tyre degradation rates, the aerodynamic regulations of each era, and the tactical acuity of the teams deploying them. Understanding when to blink first — and when to stay out — became as important as outright pace.",

      "The 2022 ground-effect regulations, which dramatically increased mechanical downforce and reduced aerodynamic sensitivity to following another car, were expected to facilitate closer racing. They did — but they also complicated tyre degradation patterns significantly. At the 2022 Austrian Grand Prix, Lewis Hamilton demonstrated a textbook overcut: running in P7 through the opening laps while competitors pitted around Lap 15, Hamilton extended to Lap 28 before stopping, re-emerging in P4 and ultimately claiming a podium. At that same season's Hungarian Grand Prix, he ran extended stints on medium tyres before switching to softs later than rivals, giving him a decisive grip advantage in the final phase to recover from P7 to second. Overcuts in 2022 were particularly potent because tyre degradation on hard compounds was less severe than many teams had predicted.",

      "By 2023, teams had developed a finer understanding of ground-effect car tyre behaviour, and the undercut regained dominance at high-degradation circuits. The 2023 Azerbaijan Grand Prix provided a dramatic lesson in how circumstance overrides even perfect execution: Verstappen made a planned stop from the race lead just before a Safety Car appeared, falling behind drivers who subsequently pitted under the full Safety Car period. Strategy had been executed perfectly — then overturned by circumstance. At Silverstone's 2023 British Grand Prix, Ferrari's Leclerc pitted early on Lap 18 attempting the undercut, but found he was unable to generate adequate pace on the hard compound, invalidating the gain entirely. Context — who can actually generate pace on which compound — always determines whether the undercut delivers.",

      "Perhaps the most psychologically complex undercut of the era came at the 2024 Hungarian Grand Prix. McLaren found itself in an intra-team dilemma when Lando Norris, pitted first, used fresh-tyre pace to overcut his slower-pitting teammate Oscar Piastri and assume the race lead — building a six-second advantage through the pit stop sequence. McLaren's strategic rationale was clear: by pitting Norris first, they prevented Lewis Hamilton from executing an undercut on Piastri from behind, protecting a guaranteed 1-2 finish. After considerable intra-team radio tension, Norris ceded the lead to Piastri on Lap 68. The episode demonstrated how the undercut is not merely a weapon against rivals — it is sometimes deployed as a defensive shield protecting a team's own interests in the Constructors' Championship.",

      "The 2026 Australian Grand Prix showcased how active aerodynamics and Overtake Mode have reshaped the pit stop calculus. With DRS abolished, the cost of losing track position has increased — the following car no longer has a guaranteed drag-reduction tool to reclaim lost ground. Mercedes's decision to execute a double-stack stop for Russell and Antonelli on Lap 12, exploiting the Virtual Safety Car window at Melbourne, was an undercut of classical elegance: both drivers re-emerged on fresh hards, Ferrari's gamble on a later stop failed to materialise, and the race was effectively decided before the halfway mark. In 2026, the window is narrower, the stakes higher, and the consequences of hesitation more severe than at any point in the hybrid era.",
    ],
  },
  {
    slug: "constructors-championship-2026",
    title: "The Points Table at Dawn: 2026 Championship After Australia",
    subtitle:
      "Mercedes leads with 43 points but Ferrari, McLaren, and the new entrants are already closing in.",
    tag: "CHAMPIONSHIP ANALYSIS",
    tagColor: "#34d399",
    circuit: "/circuits/abu_dhabi.webp",
    race: "2026 Season Analysis",
    readTime: "7 min read",
    date: "9 March 2026",
    paragraphs: [
      "Formula 1's 2026 season is precisely one race old, but the Constructors' Championship table already tells a compelling story. Mercedes leads with 43 points after George Russell and Kimi Antonelli delivered a commanding 1-2 finish at the Australian Grand Prix in Melbourne on March 8. It is the most authoritative single-race haul possible for a team in the modern points system, and it carries a psychological weight that transcends the arithmetic. After a 2025 season in which Mercedes fought to recover its competitive footing, the Silver Arrows have returned in 2026's sweeping regulatory reset — new power units, active aerodynamics, no DRS — looking not merely competitive but dominant. The paddock took notice.",

      "Ferrari sits second in the Constructors' standings with 27 points — a tally that reflects a solid day's work and yet disguises the frustration in the Maranello camp. Charles Leclerc finished third and Lewis Hamilton fourth, separated by just 0.6 seconds at the chequered flag. The raw pace of the SF-26 was evidently strong — Leclerc spent significant stretches matching Russell's lap times, even prompting the Mercedes driver to reveal that he had been managing his true pace. Ferrari's strategic choice to hold both cars out past Lap 25, gambling on a second VSC that never arrived, likely cost the Scuderia 18 constructors' points or more. Technical strength punished by strategic misfortune: Ferrari's recurring opening-chapter story.",

      "McLaren sits third with 10 points after a deeply difficult Melbourne weekend. Oscar Piastri's pre-race crash on the reconnaissance lap — caused by an unexpected battery energy spike on cold tyres — robbed the team of its defending champion before the lights had even gone out. Lando Norris drove competently in Piastri's absence but could only salvage fifth place, contributing the team's sole points haul. For a squad that has operated at the front of the grid since 2024, the 33-point deficit to Mercedes after just one race feels disproportionate — the product of freak mechanical misfortune rather than competitive deficit. The true McLaren versus Mercedes battle, which pre-season testing suggested would be the season's defining rivalry, is yet to be properly joined.",

      "The 2026 season marks a watershed moment for F1's commercial landscape, with two new manufacturer identities on the grid. Audi, completing its acquisition of the former Sauber operation, enters as a full works team with its own bespoke 2026 power unit — the first time the German brand has competed in F1 as a constructor. Cadillac, a General Motors brand, makes their series debut using Ferrari power units — an arrangement that provides immediate competitive credibility. Both teams face the steep learning curve that all new entrants encounter, but 2026's regulation reset theoretically narrows the gap to the established order more than any rulebook change in a decade.",

      "The 2026 Constructors' Championship will be decided across 24 Grands Prix spanning from Melbourne in March to a December finale. After one round, Mercedes holds the early lead — but a 16-point gap to Ferrari and a 33-point gap to McLaren is an opening chapter, not a conclusion. The history of the hybrid era is littered with teams that led after Round 1 and surrendered the title by season's end. Red Bull Racing's 2026 performance remains to be fully assessed, and the development race throughout the season will be as important as individual race results. Melbourne delivered its verdict; the full jury is still very much out.",
    ],
  },
];

export function getArticle(slug: string): Article | undefined {
  return ARCHIVE_ARTICLES.find((a) => a.slug === slug);
}
