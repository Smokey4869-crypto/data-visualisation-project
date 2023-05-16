let svgWidth = 960
let svgHeight = 500

let margin = {
    top: 20,
    right: 200,
    bottom: 100,
    left: 50
}

let w = svgWidth - margin.left - margin.right
let h = svgHeight - margin.top - margin.bottom

let legendSizeSquare = 30
let originalData = {}
let dataset
let datasetTotal
let xScale, yScale,
    xAxis, yAxis

let color = d3.scaleOrdinal()
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);


d3.json("data/reasons_for_moving_details.json", function (error, json) {
    originalData = json
    dataset.push(json.reason1)
    dataset.push(json.reason2)
    dataset.push(json.reason3)
    dataset.push(json.reason4)
});

function stackBarChart(svg, datasetTotal) {
    let subgroups = datasetTotal.columns.slice(2)
    datasetTotal.forEach(function (d) {
        // Compute the total
        tot = 0
        for (i in subgroups) {
            let name = subgroups[i];
            tot += +d[name]
        }
        // Now normalize
        for (i in subgroups) {
            let name = subgroups[i];
            d[name] = d[name] / tot * 100
        }
    })

    let stack = d3.stack()
        .keys(subgroups)
        .order(d3.stackOrderReverse)
    let series = stack(datasetTotal);

    let groups = svg.selectAll("g")
        .data(series)
        .enter()
        .append("g")
        .style("fill", function (d, i) {
            return color(i);
        })

    svg.append("g")
        .call(xAxis)
        .attr("transform", "translate(" + margin.left + "," + h + ")")

    svg.append("g")
        .call(yAxis)
        .attr("transform", "translate(" + margin.left + ",0)")

    // tooltip
    let tooltip = d3.select("#chart")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px")

    // Three function that change the tooltip when user hover / move / leave a cell
    let mouseover = function (d) {
        var subgroupName = d3.select(this.parentNode).datum().key;
        var subgroupValue = d.data[subgroupName];
        tooltip
            .html(subgroupName + "<br>" + "Value: " + subgroupValue.toFixed(2))
            .style("opacity", 1)
    }
    let mousemove = function (d) {
        tooltip
            .style("left", (d3.mouse(this)[0]) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
            .style("top", (d3.mouse(this)[1]) + "px")
    }
    let mouseleave = function (d) {
        tooltip
            .style("opacity", 0)
    }

    // x-axis title 
    svg.append("text")
        .attr("x", w / 2)
        .attr("y", h + margin.bottom / 2 - 10)
        .text("Mobility Period")
        .classed("axis-title", true)

    // y-axis title
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", margin.left / 2 - 10)
        .attr("x", -h / 2)
        .text("Percentage")
        .classed("axis-title", true)

    // create legend 
    let g = svg.append("g")
        .attr("transform", "translate(" + (w / 2 + 80) + "," + (h - legendSizeSquare * subgroups.length) + ")");

    let legend = g.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "start")
        .selectAll("g")
        .data(subgroups.slice())
        .enter().append("g")
        .attr("transform", function (d, i) {
            return "translate(0, " + i * legendSizeSquare + ")";
        });

    legend.append("rect")
        .attr("x", w / 2)
        .attr("width", legendSizeSquare)
        .attr("height", legendSizeSquare)
        .attr("fill", function(d, i) {
            return color(i)
        });

    legend.append("text")
        .attr("x", w / 2 + 40)
        .attr("y", 15)
        .attr("dy", "0.32em")
        .text(function (d) { return d; });

    // draw the chart
    let rects = groups.selectAll("rect")
        .data(function (d) { return d; })
        .enter()
        .append("rect")
        .attr('x', function (d) {
            return xScale(d.data["Mobility Period"]) + margin.left;
        })
        .attr("y", function (d) {
            return yScale(d[1]);
        })
        .attr("height", function (d) {
            return (yScale(d[0]) - yScale(d[1]));
        })
        .attr("width", xScale.bandwidth())
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
}

window.onload = function () {
    d3.csv("data/reasons_for_moving_total.csv", function (error, csv) {
        datasetTotal = csv
        let xGroups = d3.map(datasetTotal, function (d) {
            return d["Mobility Period"]
        }).keys().reverse()

        xScale = d3.scaleBand()
            .domain(xGroups)
            .rangeRound([0, w])
            .paddingInner(0.4)

        yScale = d3.scaleLinear()
            .domain([0, 100])
            .range([h, margin.top])

        yAxis = d3.axisLeft()
            .scale(yScale)

        xAxis = d3.axisBottom()
            .scale(xScale)

        let svg = d3.select("body")
            .append("svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight);

        stackBarChart(svg, datasetTotal);
    })
}