
// -----------------------------
//  TACITUS COMPLEX GRAPH ENGINE
// -----------------------------

const svg = d3.select("#conflict-graph");
const width = +svg.attr("width") || 900;
const height = +svg.attr("height") || 520;

// MAIN GROUP
const container = svg.append("g").attr("class", "graph-container");

// ZOOM
svg.call(
    d3.zoom().scaleExtent([0.3, 3]).on("zoom", (event) => {
        container.attr("transform", event.transform);
    })
);

// -----------------------------
//  NODE / EDGE COLOR MAP
// -----------------------------
const nodeColors = {
    ministry: "#4cc9f0",
    union: "#f72585",
    contractor: "#7209b7",
    mayor: "#3a86ff",
    oversight: "#ffba08",
    external: "#06d6a0",
    political: "#ff006e"
};

const edgeColors = {
    dependency: "#6c757d",
    veto: "#ff0033",
    funding: "#00b4d8",
    alliance: "#82c91e",
    rivalry: "#ff6b6b",
    pressure: "#f8961e",
    oversight: "#ffdd00",
    trust: "#1dd3b0",
    narrative: "#b5179e"
};

// -----------------------------
//  COMPLEX GRAPH DATA
// -----------------------------
const graph = {
    nodes: [
        { id: "Ministry of Transport", type: "ministry", power: 9 },
        { id: "Finance Ministry", type: "ministry", power: 8 },
        { id: "Prime Minister's Office", type: "political", power: 9 },

        { id: "National Rail Union", type: "union", power: 7 },
        { id: "Construction Workers Federation", type: "union", power: 5 },

        { id: "Contractors Consortium", type: "contractor", power: 6 },

        { id: "Rail Regulator", type: "oversight", power: 7 },
        { id: "Audit Court", type: "oversight", power: 7 },
        { id: "Anti-Corruption Unit", type: "oversight", power: 8 },

        { id: "External Funding Office", type: "external", power: 7 },
        { id: "Rating Agency", type: "external", power: 5 },
        { id: "Civil Society Coalition", type: "external", power: 4 },
        { id: "Commuter Coalition", type: "external", power: 3 },

        { id: "Opposition Bloc", type: "political", power: 6 },
        { id: "Press Ecosystem", type: "political", power: 5 },

        // local mayors cluster
        { id: "Mayor North", type: "mayor", power: 4 },
        { id: "Mayor South", type: "mayor", power: 4 },
        { id: "Mayor East", type: "mayor", power: 4 },
        { id: "Mayor West", type: "mayor", power: 4 }
    ],

    links: [
        // core executive structure
        { source: "Ministry of Transport", target: "Finance Ministry", type: "dependency" },
        { source: "Ministry of Transport", target: "Prime Minister's Office", type: "dependency" },
        { source: "Finance Ministry", target: "Prime Minister's Office", type: "dependency" },

        // implementation & money
        { source: "Ministry of Transport", target: "Contractors Consortium", type: "oversight" },
        { source: "Finance Ministry", target: "External Funding Office", type: "funding" },
        { source: "External Funding Office", target: "Rating Agency", type: "dependency" },

        // unions & labour
        { source: "National Rail Union", target: "Ministry of Transport", type: "pressure" },
        { source: "National Rail Union", target: "Contractors Consortium", type: "rivalry" },
        { source: "Construction Workers Federation", target: "Contractors Consortium", type: "pressure" },
        { source: "Construction Workers Federation", target: "National Rail Union", type: "alliance" },

        // oversight triangle
        { source: "Rail Regulator", target: "Contractors Consortium", type: "oversight" },
        { source: "Rail Regulator", target: "Ministry of Transport", type: "oversight" },
        { source: "Audit Court", target: "Finance Ministry", type: "oversight" },
        { source: "Anti-Corruption Unit", target: "Contractors Consortium", type: "oversight" },
        { source: "Anti-Corruption Unit", target: "Ministry of Transport", type: "oversight" },

        // politics & narrative
        { source: "Opposition Bloc", target: "Finance Ministry", type: "veto" },
        { source: "Opposition Bloc", target: "Press Ecosystem", type: "narrative" },
        { source: "Press Ecosystem", target: "Ministry of Transport", type: "pressure" },
        { source: "Press Ecosystem", target: "Prime Minister's Office", type: "pressure" },

        { source: "Civil Society Coalition", target: "Press Ecosystem", type: "narrative" },
        { source: "Civil Society Coalition", target: "Mayor East", type: "pressure" },

        // mayors & commuters
        { source: "Mayor North", target: "Ministry of Transport", type: "pressure" },
        { source: "Mayor East", target: "Ministry of Transport", type: "pressure" },
        { source: "Mayor South", target: "Ministry of Transport", type: "pressure" },
        { source: "Mayor West", target: "Ministry of Transport", type: "pressure" },

        { source: "Mayor North", target: "Commuter Coalition", type: "trust" },
        { source: "Mayor South", target: "Commuter Coalition", type: "trust" },
        { source: "Commuter Coalition", target: "Press Ecosystem", type: "narrative" }
    ]
};

// -----------------------------
//  FORCE SIMULATION
// -----------------------------
const simulation = d3
    .forceSimulation(graph.nodes)
    .force("link", d3.forceLink(graph.links).id((d) => d.id).distance(120))
    .force("charge", d3.forceManyBody().strength(-350))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("collision", d3.forceCollide().radius(40));

// -----------------------------
//  RENDERING NODES AND LINKS
// -----------------------------
const link = container
    .append("g")
    .attr("class", "edges")
    .selectAll("line")
    .data(graph.links)
    .enter()
    .append("line")
    .attr("stroke", (d) => edgeColors[d.type])
    .attr("stroke-width", 2)
    .attr("opacity", 0.75);

const node = container
    .append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(graph.nodes)
    .enter()
    .append("circle")
    .attr("r", 14)
    .attr("fill", (d) => nodeColors[d.type])
    .call(
        d3.drag()
            .on("start", dragStart)
            .on("drag", drag)
            .on("end", dragEnd)
    );

const labels = container
    .append("g")
    .attr("class", "labels")
    .selectAll("text")
    .data(graph.nodes)
    .enter()
    .append("text")
    .text((d) => d.id)
    .attr("font-size", "12px")
    .attr("dx", 18)
    .attr("dy", 4)
    .attr("fill", "#fff");

// -----------------------------
//  TICK FUNCTION
// -----------------------------
simulation.on("tick", () => {
    link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

    node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

    labels.attr("x", (d) => d.x).attr("y", (d) => d.y);
});

// -----------------------------
//  DRAGGING
// -----------------------------
function dragStart(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function drag(event, d) {
    d.fx = event.x;
    d.fy = event.y;
}

function dragEnd(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}

// Reset Button
document.getElementById("conflict-graph-reset").onclick = () => {
    simulation.alpha(1).restart();
};
