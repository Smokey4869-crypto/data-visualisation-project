let width = 900,
    height = 850,
    maxRadius = Math.min(width, height) / 2;

let multiLevelData = [];
let color = d3.scaleOrdinal()
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b"]);
let pieWidth

function setMultiLevelData(data) {
    if (data == null)
        return;
    let level = data.length,
        counter = 0,
        currentLevelData = [],
        queue = [];
    for (let i = 0; i < data.length; i++) {
        queue.push({
            ...data[i],
            group: (i+1)
        });
    };

    while (!queue.length == 0) {
        let node = queue.shift();
        currentLevelData.push(node);
        level--;

        if (node.subData) {
            for (let i = 0; i < node.subData.length; i++) {
                queue.push({
                    ...node.subData[i],
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

    console.log(multiLevelData)
}

function drawPieChart(svg, _data, index) {
    let pie = d3.pie()
        .sort(null)
        .value(function (d) {
            return d.nodeData.value;
        });
    let arc = d3.arc()
        .outerRadius((index + 1) * pieWidth - 1)
        .innerRadius(index * pieWidth);

    let g = svg.selectAll(".arc" + index).data(pie(_data)).enter().append("g")
        .attr("class", "arc" + index);

    g.append("path").attr("d", arc)
        .style("fill", function (d) {
            return color(d.data.nodeData.name);
        });

    g.append("text")
        .attr("transform", function (d) {
            return `translate(${arc.centroid(d)})`;
        })
        .attr("dy", ".35em")
        .attr("class", "arc-text")
        .style("text-anchor", "middle")
        .text(function (d) {
            if (d.data.nodeData.value < 4) {
                return "";
            } else {
                return d.data.nodeData.name;
            }
        })
}

window.onload = function () {
    d3.json("data/testPieChart.json", function (error, json) {
        let svg = d3.select("#chart").append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        setMultiLevelData(json)
        pieWidth = parseInt(maxRadius / multiLevelData.length) - multiLevelData.length;

        for (let i = 0; i < multiLevelData.length; i++) {
            let _cData = multiLevelData[i];
            drawPieChart(svg, _cData, i);
        }
    })

}