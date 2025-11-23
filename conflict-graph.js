// ===============================================================
//  TACITUS Conflict Graph Visualizer
//  Modern D3 Force Layout for Geopolitical / Org / Family Conflicts
// ===============================================================

document.addEventListener("DOMContentLoaded", () => {
    const svg = d3.select("#conflict-graph");
    if (svg.empty()) return;

    const width = svg.node().clientWidth;
    const height = svg.node().clientHeight;

    const nodeDetails = document.getElementById("node-details");

    // === DATASETS ================================================
    // Each case is intentionally dense: more actors, more structure,
    // more realistic interests / constraints.

    const CASES = {
        // ----------------------------------------------------------
        //  GEO CASE: SAUDI–IRAN DÉTENTE + YEMEN / ENERGY STRUCTURE
        // ----------------------------------------------------------
        geo: {
            nodes: [
                {
                    id: "Saudi Govt",
                    type: "State",
                    interests: "De-escalate with Iran; exit Yemen on acceptable terms; protect oil exports; attract investment.",
                    constraints: "Reliance on external security guarantees; domestic reform agenda; vulnerability to missile/drone attacks.",
                    leverage: "Oil production, air power, financial resources, convening power in Gulf.",
                    redLines: "Attacks on territory and critical infrastructure; unchecked Houthi missile/drone capability."
                },
                {
                    id: "Iran Govt",
                    type: "State",
                    interests: "Sanctions relief; regional legitimacy; sustain deterrence and network of partners.",
                    constraints: "Economic fragility; internal elite competition; exposure to further sanctions.",
                    leverage: "Network of armed partners; ballistic / drone capabilities; geographic depth.",
                    redLines: "Perceived encirclement; moves that weaken regional deterrence posture."
                },
                {
                    id: "China",
                    type: "Mediator",
                    interests: "Stable energy imports; reduced Gulf escalation risk; diplomatic stature as broker.",
                    constraints: "Non-alliance doctrine; desire to avoid deep security commitments.",
                    leverage: "Market access, investment, infrastructure finance, political capital with both parties."
                },
                {
                    id: "United States",
                    type: "State",
                    interests: "Freedom of navigation; containment of escalation; protection of partners and bases.",
                    constraints: "War fatigue; domestic politics; competing global priorities.",
                    leverage: "Security guarantees, naval presence, sanctions architecture, advanced defense tech."
                },
                {
                    id: "Iraq",
                    type: "Facilitator",
                    interests: "Reduce proxy conflict on its territory; assert regional diplomatic role.",
                    constraints: "Internal fragmentation; security risks from non-state armed groups.",
                    leverage: "Track record hosting backchannel talks; relationships with both capitals."
                },
                {
                    id: "Oman",
                    type: "Facilitator",
                    interests: "Regional de-escalation; quiet brokerage; protection of maritime trade.",
                    constraints: "Limited hard power; economic vulnerabilities.",
                    leverage: "Trusted neutral broker; discreet channels; reputation for quiet diplomacy."
                },
                {
                    id: "Houthis",
                    type: "Armed Group",
                    interests: "Regime survival; territorial control in Yemen; leverage via cross-border pressure.",
                    constraints: "Humanitarian cost of conflict; dependence on external support; internal factionalism.",
                    leverage: "Missiles/drones targeting Saudi territory and shipping; control over key terrain."
                },
                {
                    id: "Yemen Govt",
                    type: "Government",
                    interests: "Preserve sovereignty; regain territory; secure sustained external support.",
                    constraints: "Fragmented alliances; corruption perceptions; limited territorial control.",
                    leverage: "International recognition; access to formal financial channels."
                },
                {
                    id: "Gulf Shipping",
                    type: "System",
                    interests: "Predictable shipping lanes; reduced insurance and security costs.",
                    constraints: "Exposure to attacks, blockades, and coercive disruptions.",
                    leverage: "Indirect: spikes in risk premiums, global trade disruption signal costs of escalation."
                },
                {
                    id: "Energy Markets",
                    type: "System",
                    interests: "Price stability; uninterrupted supply; predictability for producers and consumers.",
                    constraints: "High sensitivity to shocks; speculative behavior; limited direct agency.",
                    leverage: "Price signals that quickly penalize escalation and reward de-escalation."
                }
            ],
            links: [
                // Core rivalry
                { source: "Saudi Govt", target: "Iran Govt", relation: "tension" },
                { source: "Iran Govt", target: "Saudi Govt", relation: "tension" },

                // Mediation and facilitation
                { source: "China", target: "Saudi Govt", relation: "mediation" },
                { source: "China", target: "Iran Govt", relation: "mediation" },
                { source: "Iraq", target: "Saudi Govt", relation: "backchannel" },
                { source: "Iraq", target: "Iran Govt", relation: "backchannel" },
                { source: "Oman", target: "Saudi Govt", relation: "backchannel" },
                { source: "Oman", target: "Iran Govt", relation: "backchannel" },

                // Yemen proxy layer
                { source: "Saudi Govt", target: "Yemen Govt", relation: "support" },
                { source: "Iran Govt", target: "Houthis", relation: "support" },
                { source: "Houthis", target: "Saudi Govt", relation: "tension" },
                { source: "Houthis", target: "Gulf Shipping", relation: "risk" },
                { source: "Yemen Govt", target: "Houthis", relation: "tension" },

                // Global / structural layer
                { source: "United States", target: "Saudi Govt", relation: "security" },
                { source: "Saudi Govt", target: "United States", relation: "security" },
                { source: "United States", target: "Iran Govt", relation: "tension" },

                { source: "Energy Markets", target: "Saudi Govt", relation: "dependency" },
                { source: "Energy Markets", target: "Iran Govt", relation: "dependency" },
                { source: "Energy Markets", target: "China", relation: "dependency" },

                { source: "Gulf Shipping", target: "Saudi Govt", relation: "exposure" },
                { source: "Gulf Shipping", target: "Iran Govt", relation: "exposure" },
                { source: "Gulf Shipping", target: "United States", relation: "security" }
            ]
        },

        // ----------------------------------------------------------
        //  BOARD CASE: AI COMPANY GOVERNANCE CRISIS
        //  (Board–CEO–Partner–Employees–Safety Bloc–Investors)
        // ----------------------------------------------------------
        board: {
            nodes: [
                {
                    id: "CEO",
                    type: "Exec",
                    interests: "Ship product fast; grow ecosystem; maintain founder narrative.",
                    constraints: "Board oversight; dependence on key partner; regulatory and safety scrutiny.",
                    leverage: "Vision, public profile, ability to rally employees and investors.",
                    redLines: "Loss of operational control; moves that threaten fundraising or product velocity."
                },
                {
                    id: "Board",
                    type: "Governance",
                    interests: "Guard mission; manage existential risk; preserve legal and fiduciary integrity.",
                    constraints: "Public backlash; information asymmetry; limited time and technical bandwidth.",
                    leverage: "Power to hire/fire leadership; set governance structure; control of charter."
                },
                {
                    id: "Microsoft",
                    type: "Partner",
                    interests: "Stable roadmap; privileged access to models; return on massive capex.",
                    constraints: "Reputational risk; antitrust and regulatory exposure; dependence on joint roadmap.",
                    leverage: "Capital, cloud, hardware, and potential landing zone for leadership and staff."
                },
                {
                    id: "Employees",
                    type: "Stakeholder",
                    interests: "Job security; coherent mission; internal voice in safety vs. growth tradeoffs.",
                    constraints: "Individual bargaining power; visa status; option packages.",
                    leverage: "Collective action (open letters, mass exit threats), informal information flows."
                },
                {
                    id: "Safety Bloc",
                    type: "Internal Faction",
                    interests: "Tighter guardrails; slower deployment; more transparency to governance bodies.",
                    constraints: "Minority position; technical disagreements; external politicization.",
                    leverage: "Expert credibility; ability to raise alarms to board, regulators, and media."
                },
                {
                    id: "Investors",
                    type: "Stakeholder",
                    interests: "Valuation growth; liquidity options; avoidance of catastrophic governance failure.",
                    constraints: "Limited formal control in hybrid structures; reputational exposure.",
                    leverage: "Behind-the-scenes pressure; alternative funding offers; board influence via relationships."
                },
                {
                    id: "Interim Leadership",
                    type: "Exec",
                    interests: "Stabilize company; maintain continuity; avoid being perceived as a pawn.",
                    constraints: "Short time horizon; unclear mandate during crisis.",
                    leverage: "Control of internal messaging during transition window."
                },
                {
                    id: "Public Opinion",
                    type: "System",
                    interests: "Perception of responsible AI; narrative about who is ‘in control’ of powerful models.",
                    constraints: "Fragmented information; media framing; limited direct information.",
                    leverage: "Reputational shocks that influence regulators, partners, and talent flows."
                }
            ],
            links: [
                // Board vs CEO
                { source: "Board", target: "CEO", relation: "tension" },
                { source: "CEO", target: "Board", relation: "tension" },

                // Partner dynamics
                { source: "Microsoft", target: "CEO", relation: "cooperation" },
                { source: "Microsoft", target: "Board", relation: "pressure" },

                // Employees
                { source: "Employees", target: "CEO", relation: "support" },
                { source: "Employees", target: "Board", relation: "tension" },

                // Safety bloc
                { source: "Safety Bloc", target: "Board", relation: "alignment" },
                { source: "Safety Bloc", target: "CEO", relation: "tension" },

                // Investors
                { source: "Investors", target: "CEO", relation: "support" },
                { source: "Investors", target: "Board", relation: "pressure" },
                { source: "Investors", target: "Microsoft", relation: "coordination" },

                // Interim leadership
                { source: "Board", target: "Interim Leadership", relation: "appointment" },
                { source: "Interim Leadership", target: "Employees", relation: "messaging" },

                // Public opinion / external field
                { source: "Public Opinion", target: "Board", relation: "reputational" },
                { source: "Public Opinion", target: "CEO", relation: "reputational" },
                { source: "Public Opinion", target: "Microsoft", relation: "reputational" }
            ]
        },

        // ----------------------------------------------------------
        //  FAMILY CASE: MULTI-PARTY INHERITANCE DISPUTE
        //  (Siblings, spouses, executor, lawyer, mediator, care system)
        // ----------------------------------------------------------
        family: {
            nodes: [
                {
                    id: "Eldest Sibling",
                    type: "Sibling",
                    interests: "Recognition for years of caregiving; stable share of assets; clarity on debts.",
                    constraints: "Personal debt; burnout; perception of favoritism from others.",
                    leverage: "Detailed knowledge of parent’s wishes and medical/financial history.",
                    redLines: "Being treated as if caregiving never happened; forced sale of home at distress price."
                },
                {
                    id: "Younger Sibling",
                    type: "Sibling",
                    interests: "Fairness vs. income; avoid being written off as ‘absent’; keep emotional bond.",
                    constraints: "Income volatility; distance from parent; limited visibility into day-to-day history.",
                    leverage: "Moral claim to equal treatment; ability to delay decisions or contest process."
                },
                {
                    id: "Parent",
                    type: "Parent",
                    interests: "Harmony among children; staying in familiar home; orderly transfer of assets.",
                    constraints: "Health deterioration; cognitive load; pressure from both sides.",
                    leverage: "Formal ownership; ability to revise will / powers of attorney while capable."
                },
                {
                    id: "Spouse (Eldest)",
                    type: "Spouse",
                    interests: "Protect household time and finances; avoid indefinite caregiving burden.",
                    constraints: "Limited direct say in inheritance; dependence on Eldest’s choices.",
                    leverage: "Influence on Eldest’s bargaining position and red lines."
                },
                {
                    id: "Spouse (Younger)",
                    type: "Spouse",
                    interests: "Avoid sudden financial obligations; protect own family’s priorities.",
                    constraints: "Perceived as outsider; may not know full family history.",
                    leverage: "Can harden or soften Younger’s stance; control over travel/time commitments."
                },
                {
                    id: "Executor",
                    type: "Executor",
                    interests: "Implement will as written; minimize disputes and legal exposure.",
                    constraints: "Bound by legal text; limited emotional legitimacy with family.",
                    leverage: "Control over formal steps: valuations, disbursements, communication with authorities."
                },
                {
                    id: "Family Lawyer",
                    type: "Professional",
                    interests: "Provide compliant advice; avoid conflicts of interest; get clear instructions.",
                    constraints: "Ethical rules; confidentiality; cannot ‘pick a side’.",
                    leverage: "Frames options; drafts documents; can suggest mediation vs. litigation."
                },
                {
                    id: "Mediator Friend",
                    type: "Mediator",
                    interests: "Preserve long-term relationships; avoid court; help parties hear each other.",
                    constraints: "No formal authority; risk of being perceived as biased.",
                    leverage: "Trust capital with both siblings; can reframe positions as interests."
                },
                {
                    id: "Care Home / Services",
                    type: "System",
                    interests: "Stable payments; predictable care plan; risk-managed environment.",
                    constraints: "Regulation; limited flexibility; staffing constraints.",
                    leverage: "Information on realistic care options and costs; timelines that force decisions."
                },
                {
                    id: "Family Home",
                    type: "Asset",
                    interests: "N/A (structural node representing shared asset).",
                    constraints: "Illiquid; emotionally charged; may require maintenance or upgrades.",
                    leverage: "Anchor of dispute: who gets to live there, sell, or keep it as common asset."
                }
            ],
            links: [
                // Core sibling tension
                { source: "Eldest Sibling", target: "Younger Sibling", relation: "tension" },
                { source: "Parent", target: "Eldest Sibling", relation: "bond" },
                { source: "Parent", target: "Younger Sibling", relation: "bond" },

                // Spouses and alignment
                { source: "Spouse (Eldest)", target: "Eldest Sibling", relation: "alliance" },
                { source: "Spouse (Younger)", target: "Younger Sibling", relation: "alliance" },

                // Executor and lawyer
                { source: "Parent", target: "Executor", relation: "mandate" },
                { source: "Executor", target: "Family Lawyer", relation: "consult" },
                { source: "Family Lawyer", target: "Eldest Sibling", relation: "advice" },
                { source: "Family Lawyer", target: "Younger Sibling", relation: "advice" },

                // Mediator
                { source: "Mediator Friend", target: "Eldest Sibling", relation: "mediation" },
                { source: "Mediator Friend", target: "Younger Sibling", relation: "mediation" },

                // Care system
                { source: "Parent", target: "Care Home / Services", relation: "care" },
                { source: "Care Home / Services", target: "Eldest Sibling", relation: "coordination" },
                { source: "Care Home / Services", target: "Younger Sibling", relation: "coordination" },

                // Asset focus
                { source: "Family Home", target: "Eldest Sibling", relation: "claim" },
                { source: "Family Home", target: "Younger Sibling", relation: "claim" },
                { source: "Family Home", target: "Parent", relation: "residence" }
            ]
        }
    };

    // === BUILD FORCE SIM ==========================================

    let simulation, link, node;

    function render(caseKey) {
        svg.selectAll("*").remove();

        const data = CASES[caseKey];

        simulation = d3.forceSimulation(data.nodes)
            .force("link", d3.forceLink(data.links).id(d => d.id).distance(140))
            .force("charge", d3.forceManyBody().strength(-320))
            .force("center", d3.forceCenter(width / 2, height / 2));

        link = svg.append("g")
            .selectAll("line")
            .data(data.links)
            .enter()
            .append("line")
            .attr("class", d => "link " + d.relation);

        node = svg.append("g")
            .selectAll("g")
            .data(data.nodes)
            .enter()
            .append("g")
            .attr("class", "node")
            .call(drag(simulation));

        node.append("circle")
            .attr("r", 24)
            .attr("fill", d => nodeColor(d))
            .attr("stroke", d => strokeColor(d));

        node.append("text")
            .attr("dy", 4)
            .attr("text-anchor", "middle")
            .text(d => d.id);

        node.on("mouseover", (e, d) => {
            let extra = "";
            if (d.leverage) {
                extra += `<br>Leverage: ${d.leverage}`;
            }
            if (d.redLines) {
                extra += `<br>Red lines: ${d.redLines}`;
            }
            if (d.notes) {
                extra += `<br>Notes: ${d.notes}`;
            }

            nodeDetails.innerHTML = `
                <strong>${d.id}</strong><br>
                Type: ${d.type}<br>
                Interests: ${d.interests}<br>
                Constraints: ${d.constraints}
                ${extra}
            `;
        });

        node.on("mouseout", () => {
            nodeDetails.innerHTML = `Hover a node to see its Interests, Constraints, and Role.`;
        });

        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node.attr("transform", d => `translate(${d.x},${d.y})`);
        });
    }

    // Color Logic
    function nodeColor(d) {
        if (d.type === "Mediator") return "rgba(255,209,102,0.35)";
        if (d.type === "Exec" || d.type === "Parent") return "rgba(0,255,200,0.28)";
        if (d.type === "Governance") return "rgba(255,100,140,0.28)";
        if (d.type === "System" || d.type === "Asset") return "rgba(200,200,255,0.20)";
        return "rgba(80,160,255,0.25)";
    }

    function strokeColor(d) {
        if (d.type === "Mediator") return "#ffd166";
        if (d.type === "Exec" || d.type === "Parent") return "#00ffaa";
        if (d.type === "Governance") return "#ff6b8a";
        if (d.type === "System" || d.type === "Asset") return "#c0d4ff";
        return "#4ab3ff";
    }

    // Drag Behavior
    function drag(sim) {
        return d3.drag()
            .on("start", event => {
                if (!event.active) sim.alphaTarget(0.3).restart();
                event.subject.fx = event.subject.x;
                event.subject.fy = event.subject.y;
            })
            .on("drag", event => {
                event.subject.fx = event.x;
                event.subject.fy = event.y;
            })
            .on("end", event => {
                if (!event.active) sim.alphaTarget(0);
                event.subject.fx = null;
                event.subject.fy = null;
            });
    }

    // Case switching
    document.querySelectorAll(".conflict-case-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".conflict-case-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            render(btn.dataset.case);
        });
    });

    // First load
    render("geo");
});

