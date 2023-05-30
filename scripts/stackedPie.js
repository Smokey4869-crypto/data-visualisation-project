let maxRadius

let multiLevelData = [];

let color1 = d3.scaleOrdinal()
    .range(["#edf8e9", "#c7e9c0", "#a1d99b", "#74c476", "#41ab5d", "#238b45", "#005a32"])

let color2 = d3.scaleOrdinal()
    .range(["#eff3ff", "#c6dbef", "#9ecae1", "#6baed6", "#4292c6", "#2171b5", "#084594"])

let color3 = d3.scaleOrdinal()
    .range(["#feedde", "#fdd0a2", "#fdae6b", "#fd8d3c", "#f16913", "#d94801", "#8c2d04"])

let color4 = d3.scaleOrdinal()
    .range(["#f2f0f7", "#dadaeb", "#bcbddc", "#9e9ac8", "#807dba", "#6a51a3", "#4a1486"])

let pieWidth

function setMultiLevelData(data) {
    multiLevelData = []
    if (data == null)
        return;
    let level = data.length,
        counter = 0,
        currentLevelData = [],
        queue = [];
    for (let i = 0; i < data.length; i++) {
        queue.push({
            ...data[i],
            group: (i + 1)
        });
    };

    while (!queue.length == 0) {
        let node = queue.shift();
        currentLevelData.push(node);
        level--;

        if (node.subData) {
            for (const element of node.subData) {
                queue.push({
                    ...element,
                    group: node.group
                });
                counter++;
            }
        }
        if (level == 0) {
            level = counter;
            counter = 0;
            multiLevelData.push(currentLevelData);
            currentLevelData = [];
        }
    }
}

function drawPieChart(svg, _data, index) {
    let sortedData = []
    let subData1 = []
    let subData2 = []
    let subData3 = []
    let subData4 = []

    for (const d of _data) {
        if (index == 1) {
            if (d.group == 1) {
                subData1.push(d)
            }
            if (d.group == 2) {
                subData2.push(d)
            }
            if (d.group == 3) {
                subData3.push(d)
            }
            if (d.group == 4) {
                subData4.push(d)
            }
        }
    }

    subData1.sort((a, b) => a.nodeData.value - b.nodeData.value)
    subData2.sort((a, b) => a.nodeData.value - b.nodeData.value)
    subData3.sort((a, b) => a.nodeData.value - b.nodeData.value)
    subData4.sort((a, b) => a.nodeData.value - b.nodeData.value)

    sortedData.push(...subData1)
    sortedData.push(...subData2)
    sortedData.push(...subData3)
    sortedData.push(...subData4)

    color1.domain(d3.range(d3.max(subData1) + 1))
    color2.domain(d3.range(d3.max(subData2) + 1))
    color3.domain(d3.range(d3.max(subData3) + 1))
    color4.domain(d3.range(d3.max(subData4) + 1))

    let pie = d3.pie()
        .sort(null)
        .value(function (d) {
            return d.nodeData.value;
        });
    let arc = d3.arc()
        .outerRadius((index + 1) * pieWidth - 1)
        .innerRadius(index * pieWidth);
    let g = svg.selectAll(".arc" + index).data(pie((index == 0) ? _data : sortedData)).enter().append("g")
        .attr("class", "arc" + index);

    // tooltip
    let tooltip = d3.select("#chart-pie")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip-pie")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px")

    const onMouseOver = function (d) {
        tooltip
            .html(d.data.nodeData.name + "<br>" + "Value: " + d.data.nodeData.value.toFixed(2))
            .style("opacity", 1)
    }
    const onMouseMove = function (d) {
        tooltip
            // Add a small amount due to the margin of the pieChart compared with the relative mouse position to the SVG
            .style("left", (d3.mouse(this)[0] + 200) + "px")
            .style("top", (d3.mouse(this)[1] - 200) + "px")
    }
    const onMouseLeave = function (d) {
        tooltip
            .style("opacity", 0)
    }

    g.append("path")
        .attr("d", arc)
        .style("fill", function (d) {
            if (index == 0) {
                if (d.data.group == 1) {
                    return color1.range()[color1.range().length - 3];
                }
                if (d.data.group == 2) {
                    return color2.range()[color2.range().length - 1];
                }
                if (d.data.group == 3) {
                    return color3.range()[color3.range().length - 1];
                }
                if (d.data.group == 4) {
                    return color4.range()[color4.range().length - 1];
                }
            } else {
                if (d.data.group == 1) {
                    return color1(d.data.nodeData.name);
                }
                if (d.data.group == 2) {
                    return color2(d.data.nodeData.name);
                }
                if (d.data.group == 3) {
                    return color3(d.data.nodeData.name);
                }
                if (d.data.group == 4) {
                    return color4(d.data.nodeData.name);
                }
            }
        })
        .on("mouseover", onMouseOver)
        .on("mousemove", onMouseMove)
        .on("mouseleave", onMouseLeave)

    if (index == 0) {
        g.append("text")
            .attr("transform", function (d) {
                return "translate(" + arc.centroid(d) + ")";
            })
            .style("font-size", "12px")
            .attr("dy", ".35em")
            .attr("fill", "white")
            .attr("dx", function(d) {
                if (d.data.nodeData.name == "Employment-related") {
                    return "1em";
                } else {
                    return ""
                }
            })
            .style("text-anchor", "middle")
            .text(function (d) {
                let name = d.data.nodeData.name;
                if (name.endsWith("-related")) {
                    return name.slice(0, -8);  // Remove the last 8 characters ("-related")
                }
                return name;
            })
    }
}

export function drawStackedPieChart(data, svg, radius) {
    maxRadius = radius
    setMultiLevelData(data)
    pieWidth = parseInt(maxRadius / multiLevelData.length) - multiLevelData.length;

    for (let i = 0; i < multiLevelData.length; i++) {
        let _cData = multiLevelData[i];
        drawPieChart(svg, _cData, i);
    }
}
