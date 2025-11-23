// TACITUS.PRISM LAB
// Dynamic moral-foundation mapping + argument reframing
// This file is loaded only on polarization.html

(function () {
  document.addEventListener('DOMContentLoaded', () => {
    // Only run on Prism page
    const hero = document.querySelector('.analysis-hero');
    const topicButtons = document.querySelectorAll('.topic-selector .topic-btn, .topic-selector .btn-ghost.small');
    if (!hero || topicButtons.length === 0) return;
    initPrismLab();
  });

  const FOUNDATIONS = ["Care", "Fairness", "Liberty", "Loyalty", "Authority", "Sanctity", "Security"];

  const VALUE_KEYWORDS = {
    Care: ["harm", "hurt", "injury", "safe", "safety", "protect", "vulnerable", "suffering", "wellbeing", "dignity", "abuse"],
    Fairness: ["fair", "unfair", "justice", "equal", "equality", "inequality", "rigged", "bias", "discrimination", "stacked"],
    Liberty: ["freedom", "free", "liberty", "autonomy", "censorship", "open", "control", "surveillance", "tyranny", "permissionless", "innovation"],
    Loyalty: ["loyal", "betray", "community", "neighbourhood", "neighborhood", "patriot", "hometown", "tradition", "heritage", "belong", "local", "our people"],
    Authority: ["authority", "order", "rules", "law", "discipline", "respect", "institution", "governance", "oversight", "regulate", "license"],
    Sanctity: ["sacred", "pure", "corrupt", "degrade", "contaminate", "profane", "decency", "clean", "toxic"],
    Security: ["security", "risk", "threat", "terror", "catastrophic", "attack", "defence", "defense", "resilience", "stability", "fragile"]
  };

  const DOMAINS = {
    ai: {
      id: "ai",
      label: "AI Regulation",
      detectedTopic: "AI Safety / Governance",
      currentFrame: "Innovation vs Risk",
      opponentFrame: "Existential Security",
      defaultExample:
        "Open-weight AI models are essential for transparency and innovation. If we lock models behind a few corporations, we entrench monopolies and slow down independent safety research.",
      baseValues: { Care: 1, Fairness: 1, Liberty: 3, Loyalty: 0, Authority: 1, Sanctity: 0, Security: 2 },
      opponentBias: { Care: 1, Fairness: 0, Liberty: -1, Loyalty: 0, Authority: 2, Sanctity: 0, Security: 3 },
      losingReason:
        "Liberty-heavy frames (“censorship”, “control”) can sound cavalier about catastrophic misuse. A national security audience hears risk dismissal.",
      bridgeHints: {
        direct:
          "Show how your preferred openness actually strengthens institutional safety and resilience (Security, Authority) while preserving scientific freedom (Liberty).",
        goal:
          "Name a shared goal like “no uncontrolled, opaque, world-scale models” and treat governance as a joint design problem, not a clash of tribes.",
        process:
          "Offer visible guardrails: transparency baselines, independent audits, and red-team access that let security actors sleep at night."
      }
    },
    urban: {
      id: "urban",
      label: "Urban Density",
      detectedTopic: "Housing / Spatial Justice",
      currentFrame: "Anti-Sprawl Modernisation",
      opponentFrame: "Community Preservation",
      defaultExample:
        "Blocking new housing in this district pushes working families out of the city. Gentle density near transit is the only way to keep the next generation rooted here.",
      baseValues: { Care: 2, Fairness: 3, Liberty: 1, Loyalty: 2, Authority: 1, Sanctity: 0, Security: 1 },
      opponentBias: { Care: 1, Fairness: 1, Liberty: -1, Loyalty: 3, Authority: 1, Sanctity: 1, Security: 1 },
      losingReason:
        "Frames that cast locals as selfish or nostalgic attack Loyalty and Sanctity (“my street, my history”) and trigger fierce resistance.",
      bridgeHints: {
        direct:
          "Lead with protecting long-time residents from displacement (Loyalty, Care). Then show how well-designed infill is a tool for that protection, not a threat to it.",
        goal:
          "Define a shared goal: the next generation should be able to afford to live near the people and institutions they rely on.",
        process:
          "Propose stepwise rezonings, tenant protections, and design codes co-written with neighbourhood groups."
      }
    },
    speech: {
      id: "speech",
      label: "Free Speech",
      detectedTopic: "Campus / Public Sphere",
      currentFrame: "Truth-Seeking / Anti-Censorship",
      opponentFrame: "Safety & Institutional Stability",
      defaultExample:
        "If we keep disinviting controversial speakers, we teach students that the loudest faction decides what may be said. That’s incompatible with a serious university.",
      baseValues: { Care: 1, Fairness: 1, Liberty: 3, Loyalty: 1, Authority: 1, Sanctity: 1, Security: 1 },
      opponentBias: { Care: 3, Fairness: 1, Liberty: -1, Loyalty: 1, Authority: 2, Sanctity: 1, Security: 2 },
      losingReason:
        "Absolutist liberty language can sound indifferent to harassment, targeted campaigns, and reputational collapse for institutions.",
      bridgeHints: {
        direct:
          "Tie robust speech norms to the safety and dignity of vulnerable students (Care) and to predictable, non-arbitrary rules (Authority).",
        goal:
          "Articulate a shared aim: a campus where students feel physically safe and intellectually serious at the same time.",
        process:
          "Emphasise viewpoint-neutral procedures, transparent enforcement, and meaningful appeal mechanisms."
      }
    },
    climate: {
      id: "climate",
      label: "Climate Policy",
      detectedTopic: "Decarbonisation / Transition",
      currentFrame: "Planetary Emergency",
      opponentFrame: "Economic Security & Reliability",
      defaultExample:
        "We need aggressive decarbonisation now; delaying for the sake of incumbents is morally indefensible.",
      baseValues: { Care: 3, Fairness: 2, Liberty: 1, Loyalty: 1, Authority: 1, Sanctity: 2, Security: 2 },
      opponentBias: { Care: 1, Fairness: 1, Liberty: 0, Loyalty: 2, Authority: 1, Sanctity: 0, Security: 3 },
      losingReason:
        "Emergency rhetoric that ignores livelihoods and grid reliability is heard as reckless disregard for Security and Loyalty to workers.",
      bridgeHints: {
        direct:
          "Frame transition as a duty to protect workers, grids, and local economies while avoiding climate shocks.",
        goal:
          "Shared goal: reliable energy and habitable communities for children and grandchildren.",
        process:
          "Lay out staged timelines, compensation mechanisms, and local investment to make trade-offs governable."
      }
    },
    migration: {
      id: "migration",
      label: "Migration & Borders",
      detectedTopic: "Mobility / Sovereignty",
      currentFrame: "Humanitarian / Opportunity",
      opponentFrame: "Order & Cultural Continuity",
      defaultExample:
        "Closing borders betrays our values and traps people in impossible situations. We need more open, humane pathways.",
      baseValues: { Care: 3, Fairness: 2, Liberty: 2, Loyalty: 0, Authority: 1, Sanctity: 0, Security: 1 },
      opponentBias: { Care: 1, Fairness: 1, Liberty: 0, Loyalty: 3, Authority: 2, Sanctity: 1, Security: 3 },
      losingReason:
        "Language that dismisses border worries as bigotry attacks Loyalty and Security, making compromise politically toxic.",
      bridgeHints: {
        direct:
          "Emphasise protecting families, preserving community cohesion, and having rules that are actually enforced.",
        goal:
          "Shared goal: predictable, fair systems that neither abandon people nor collapse local trust.",
        process:
          "Highlight screening, integration supports, and clear limits that make generosity sustainable."
      }
    },
    policing: {
      id: "policing",
      label: "Policing & Public Safety",
      detectedTopic: "Security / Justice",
      currentFrame: "Accountability & Harm Reduction",
      opponentFrame: "Order & Protection",
      defaultExample:
        "Over-militarised policing erodes trust and fails to keep communities safe in the long run.",
      baseValues: { Care: 3, Fairness: 3, Liberty: 1, Loyalty: 1, Authority: 1, Sanctity: 0, Security: 2 },
      opponentBias: { Care: 1, Fairness: 1, Liberty: 0, Loyalty: 2, Authority: 3, Sanctity: 0, Security: 3 },
      losingReason:
        "If you only highlight abuses without acknowledging real fears, proposals sound naïve about Security and Authority.",
      bridgeHints: {
        direct:
          "Frame reforms as tools that help officers do their jobs better and come home safe while reducing harm to civilians.",
        goal:
          "Shared goal: streets where people feel safe calling the police and safe when the police arrive.",
        process:
          "Point to training, data, and oversight that distinguish high-risk situations from routine community policing."
      }
    }
  };

  let currentDomainKey = "ai";
  let radarChart = null;

  function initPrismLab() {
    const topicButtons = document.querySelectorAll(".topic-selector .topic-btn, .topic-selector .btn-ghost.small");
    const intensitySlider = document.querySelector(".cyber-slider");
    const argInput = document.getElementById("prism-argument");
    const detectedTopicEl = document.getElementById("detected-topic");
    const currentFrameEl = document.getElementById("current-frame");
    const opponentFrameEl = document.getElementById("opponent-frame");
    const valueSummaryEl = document.getElementById("value-summary");
    const losingArgEl = document.getElementById("losing-argument");
    const losingReasonEl = document.getElementById("losing-reason");
    const bridgeDirectEl = document.getElementById("bridge-direct");
    const bridgeGoalEl = document.getElementById("bridge-goal");
    const bridgeProcessEl = document.getElementById("bridge-process");

    const radarCanvas = document.getElementById("prism-radar");
    if (!argInput || !radarCanvas) return;

    // Wire topics
    topicButtons.forEach(btn => {
      btn.classList.add("topic-btn"); // normalise class
      btn.addEventListener("click", () => {
        topicButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentDomainKey = btn.getAttribute("data-topic") || "ai";
        const domain = DOMAINS[currentDomainKey] || DOMAINS.ai;
        // Reset input to domain default if empty or just switched
        argInput.value = domain.defaultExample;
        updateAnalysis();
      });
    });

    // Intensity label live update
    const sliderLabels = document.querySelector(".slider-labels");
    if (intensitySlider && sliderLabels) {
      intensitySlider.addEventListener("input", () => {
        const v = parseInt(intensitySlider.value, 10);
        let label = "Moderate";
        if (v > 70) label = "Radical";
        else if (v > 40) label = "Firm";
        sliderLabels.querySelectorAll("span")[0].textContent = "Moderate";
        sliderLabels.querySelectorAll("span")[1].textContent = label;
        updateAnalysis();
      });
    } else if (intensitySlider) {
      intensitySlider.addEventListener("input", updateAnalysis);
    }

    // Argument typing (debounced)
    let typingTimer = null;
    argInput.addEventListener("input", () => {
      if (typingTimer) clearTimeout(typingTimer);
      typingTimer = setTimeout(updateAnalysis, 350);
    });

    // Initialise radar
    const ctx = radarCanvas.getContext("2d");
    radarChart = new Chart(ctx, {
      type: "radar",
      data: {
        labels: FOUNDATIONS,
        datasets: [
          {
            label: "Your framing",
            data: FOUNDATIONS.map(() => 20),
            borderColor: "#00f3ff",
            backgroundColor: "rgba(0,243,255,0.12)",
            borderWidth: 2,
            pointRadius: 3
          },
          {
            label: "Counterpart filter",
            data: FOUNDATIONS.map(() => 20),
            borderColor: "#ffb347",
            backgroundColor: "rgba(255,179,71,0.16)",
            borderWidth: 2,
            pointRadius: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 700,
          easing: "easeOutQuad"
        },
        scales: {
          r: {
            beginAtZero: true,
            suggestedMax: 100,
            angleLines: { color: "rgba(255,255,255,0.12)" },
            grid: { color: "rgba(255,255,255,0.08)" },
            ticks: { display: false },
            pointLabels: {
              color: "#9ca3af",
              font: { size: 10, family: "'Inter', system-ui, sans-serif" }
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });

    function updateAnalysis() {
      const domain = DOMAINS[currentDomainKey] || DOMAINS.ai;
      const text = (argInput.value && argInput.value.trim().length > 0)
        ? argInput.value.trim()
        : domain.defaultExample;

      const rawUser = extractValues(text);
      // If nothing was detected, fall back to base profile
      const mergedUser = mergeProfiles(domain.baseValues, rawUser);
      const opponent = deriveOpponentProfile(mergedUser, domain.opponentBias);
      const userNorm = normalizeProfile(mergedUser);
      const oppNorm = normalizeProfile(opponent);

      // Update terminal log
      if (detectedTopicEl) detectedTopicEl.textContent = domain.detectedTopic;
      if (currentFrameEl) currentFrameEl.textContent = `"${domain.currentFrame}"`;
      if (opponentFrameEl) opponentFrameEl.textContent = domain.opponentFrame;

      // Update radar dataset
      if (radarChart) {
        radarChart.data.datasets[0].data = FOUNDATIONS.map(f => userNorm[f] || 0);
        radarChart.data.datasets[1].data = FOUNDATIONS.map(f => oppNorm[f] || 0);
        radarChart.update();
      }

      // Value summary
      const topUser = topFoundations(userNorm, 3);
      const topOpp = topFoundations(oppNorm, 3);
      if (valueSummaryEl) {
        valueSummaryEl.innerHTML =
          `<strong>Your loudest signals:</strong> ${renderChips(topUser)}<br>` +
          `<strong>What they track first:</strong> ${renderChips(topOpp)}<br>` +
          `<span class="stat-desc" style="display:block;margin-top:6px;">You don't need to like their priorities. The question is whether you can describe your proposal in a way that makes sense <em>within</em> their moral map.</span>`;
      }

      // Losing & bridges
      if (losingArgEl) {
        losingArgEl.textContent = `"${text}"`;
      }
      if (losingReasonEl) {
        losingReasonEl.textContent = domain.losingReason;
      }

      const bridges = buildBridgeVariants(domain, userNorm, oppNorm, text);
      if (bridgeDirectEl) bridgeDirectEl.textContent = bridges.direct;
      if (bridgeGoalEl) bridgeGoalEl.textContent = bridges.goal;
      if (bridgeProcessEl) bridgeProcessEl.textContent = bridges.process;
    }

    // First boot
    const defaultBtn = document.querySelector('.topic-selector .topic-btn[data-topic="ai"]')
      || document.querySelector('.topic-selector .btn-ghost.small');
    if (defaultBtn) defaultBtn.click();
    else updateAnalysis();
  }

  function extractValues(text) {
    const lower = text.toLowerCase();
    const scores = {};
    FOUNDATIONS.forEach(f => (scores[f] = 0));
    Object.entries(VALUE_KEYWORDS).forEach(([foundation, words]) => {
      words.forEach(w => {
        if (lower.includes(w)) scores[foundation] += 1;
      });
    });
    return scores;
  }

  function mergeProfiles(base, detected) {
    const merged = {};
    FOUNDATIONS.forEach(f => {
      merged[f] = (base[f] || 0) + (detected[f] || 0);
    });
    return merged;
  }

  function deriveOpponentProfile(userProfile, bias) {
    const opp = {};
    FOUNDATIONS.forEach(f => {
      const tweak = (bias && bias[f]) || 0;
      opp[f] = Math.max(0, (userProfile[f] || 0) + tweak);
    });
    return opp;
  }

  function normalizeProfile(profile) {
    const values = FOUNDATIONS.map(f => profile[f] || 0);
    const max = Math.max(1, ...values);
    const normalized = {};
    FOUNDATIONS.forEach(f => {
      normalized[f] = Math.round((profile[f] || 0) * 100 / max);
    });
    return normalized;
  }

  function topFoundations(profile, n) {
    return Object.entries(profile)
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([k]) => k);
  }

  function renderChips(list) {
    return list.map(v => `<span class="value-chip">${v}</span>`).join(" ");
  }

  function buildBridgeVariants(domain, userNorm, oppNorm, rawText) {
    const userTop = topFoundations(userNorm, 2);
    const oppTop = topFoundations(oppNorm, 2);
    const text = rawText || "";

    const direct =
      `Start by explicitly acknowledging ${oppTop.join(" and ")} as legitimate concerns, ` +
      `then show how your proposal reduces those risks while keeping your core (${userTop.join(" and ")}) intact.`;

    const goal =
      `Instead of fighting over instruments, surface a shared objective – what outcome would both sides quietly accept? ` +
      `Use your argument to show how your path is a workable route to that goal, and where you are genuinely open to adjustment.`;

    const process =
      domain.bridgeHints.process ||
      `Offer a concrete, checkable process (who decides, based on what data, with which review) so your counterpart isn't being asked for a blank cheque.`;

    const enrichedDirect = domain.bridgeHints.direct
      ? `${domain.bridgeHints.direct}`
      : direct;

    const enrichedGoal = domain.bridgeHints.goal
      ? `${domain.bridgeHints.goal}`
      : goal;

    return {
      direct: enrichedDirect,
      goal: enrichedGoal,
      process
    };
  }

  // --- Optional backend hook (not called by default) -------------------------
  // To enable, call `callPrismBackend(payload)` inside updateAnalysis and
  // merge its response into the client-side analysis.
  async function callPrismBackend(payload) {
    try {
      const res = await fetch("/api/prism-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data;
    } catch (err) {
      console.warn("Prism backend unavailable:", err);
      return null;
    }
  }

})();
