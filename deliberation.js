document.addEventListener("DOMContentLoaded", () => {
    const svg = d3.select("#delib-graph");
    if (svg.empty()) return;

    const w = svg.node().clientWidth;
    const h = svg.node().clientHeight;

    const statusEl = document.getElementById("delib-status");

    // SIMPLE TRIAD MODEL (can plug into real Tacitus backend)
    const BASE = {
        nodes: [
            { id: "A", type: "tension" },
            { id: "B", type: "tension" },
            { id: "Mediator", type: "mediator" }
        ],
        links: [
            { source: "A", target: "B", relation: "tension" },
            { source: "Mediator", target: "A", relation: "mediation" },
            { source: "Mediator", target: "B", relation: "mediation" }
        ]
    };

    let current = JSON.parse(JSON.stringify(BASE));

    const sim = d3.forceSimulation(current.nodes)
        .force("link", d3.forceLink(current.links).id(d => d.id).distance(150))
        .force("charge", d3.forceManyBody().strength(-350))
        .force("center", d3.forceCenter(w/2, h/2));

    let link = svg.append("g")
        .selectAll("line")
        .data(current.links)
        .enter()
        .append("line")
        .attr("class", d => "delib-link " + (d.relation === "tension" ? "tension" : "guarantee"));

    let node = svg.append("g")
        .selectAll("g")
        .data(current.nodes)
        .enter()
        .append("g")
        .attr("class", d => "delib-node " + d.type)
        .call(drag(sim));

    node.append("circle").attr("r", 28);
    node.append("text")
        .attr("dy", 4)
        .attr("text-anchor", "middle")
        .text(d => d.id);

    sim.on("tick", () => {
        link.attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node.attr("transform", d => `translate(${d.x},${d.y})`);
    });

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

    // LOGIC: ROUNDS OF DELIBERATION
    function runRound(round) {
        statusEl.innerHTML = `Running Round ${round}…`;

        // Round effects:
        // 1. Tension fades
        current.links.forEach(l => {
            if (l.relation === "tension" && Math.random() > 0.5) {
                l.relation = "consensus";
            }
        });

        // 2. Mediator creates “guarantee edges”
        if (!current.links.some(l => l.relation === "guarantee")) {
            current.links.push({
                source: "Mediator",
                target: Math.random() > 0.5 ? "A" : "B",
                relation: "guarantee"
            });
        }

        redraw();
    }

    function redraw() {
        svg.selectAll("*").remove();

        link = svg.append("g")
            .selectAll("line")
            .data(current.links)
            .enter()
            .append("line")
            .attr("class", d => "delib-link " + d.relation);

        node = svg.append("g")
            .selectAll("g")
            .data(current.nodes)
            .enter()
            .append("g")
            .attr("class", d => "delib-node " + d.type)
            .call(drag(sim));

        node.append("circle").attr("r", 28);
        node.append("text")
            .attr("dy", 4)
            .attr("text-anchor", "middle")
            .text(d => d.id);

        sim.nodes(current.nodes);
        sim.force("link").links(current.links);
        sim.alpha(1).restart();
    }

    document.getElementById("delib-start").addEventListener("click", () => {
        current = JSON.parse(JSON.stringify(BASE));
        redraw();

        let round = 1;
        const interval = setInterval(() => {
            runRound(round);
            round++;
            if (round > 6) {
                clearInterval(interval);
                statusEl.innerHTML = "Rounds complete — ZOPA expanded.";
            }
        }, 1200);
    });
});
