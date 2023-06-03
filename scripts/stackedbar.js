import { drawStackedPieChart } from "./stackedPie.js"

let barChartWidth = 960,
    barChartHeight = 500

let pieChartWidth = 450,
    pieChartHeight = 450

let margin = {
    top: 20,
    right: 200,
    bottom: 80,
    left: 50
}

let marginPie = {
    top: 30,
    right: 0,
    bottom: 100,
    left: 0
}

// Stacked Bar
let w = barChartWidth - margin.left - margin.right
let h = barChartHeight - margin.top - margin.bottom

// Stacked Pie
let wPie = pieChartWidth - marginPie.left - marginPie.right
let hPie = pieChartHeight - marginPie.bottom

let legendSizeSquare = 30

// raw data
let originalDataStackedPie = {}

// processed data to draw chart
let datasetTotal
let xScale, yScale,
    xAxis, yAxis

let color = d3.scaleOrdinal()
    .range(["#7F58AF", "#64C5EB", "#E84D8A", "#FEB326"]);

// Data for stacked pie chart
d3.json("data/reasons_for_moving_draft.json", function (error, json) {
    originalDataStackedPie = json
})

function stackBarChart(svg, datasetTotal) {
    let subgroups = datasetTotal.columns.slice(2)
    datasetTotal.forEach(function (d) {
        // Compute the total
        let total = 0
        for (let i in subgroups) {
            let name = subgroups[i];
            total += +d[name]
        }
        // Now normalize
        for (let i in subgroups) {
            let name = subgroups[i];
            d[name] = d[name] / total * 100
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
    let tooltip = d3.select("#chart-bar")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px")

    // Three function that change the tooltip when user hover / move / leave a cell
    const onMouseOver = function (d) {
        let subgroupName = d3.select(this.parentNode).datum().key;
        let subgroupValue = d.data[subgroupName];
        tooltip
            .html(subgroupName + "<br>" + "Value: " + subgroupValue.toFixed(2))
            .style("opacity", 1)
    }
    const onMouseMove = function (d) {
        tooltip
            .style("left", (d3.mouse(this)[0]) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
            .style("top", (d3.mouse(this)[1] + 50) + "px")
    }
    const onMouseLeave = function (d) {
        tooltip
            .style("opacity", 0)
    }

    // x-axis title 
    svg.append("text")
        .attr("x", w / 2)
        .attr("y", h + margin.bottom * 3 / 5 - 10)
        .text("Mobility Period")
        .classed("axis-title", true)

    svg.append("text")
        .attr("x", w / 2 - 60)
        .attr("y", h + margin.bottom)
        .text("Click on the bar to learn more")
        .style("font-weight", "bold")

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
        .attr("fill", function (d, i) {
            return color(i)
        })

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
        .on("mouseover", onMouseOver)
        .on("mousemove", onMouseMove)
        .on("mouseleave", onMouseLeave)
        .on("click", function (d) {
            d3.select("#chart-pie").remove();

            let newElement = document.createElement("div");
            newElement.setAttribute("id", "chart-pie");

            let parentNode = document.getElementById("content");
            parentNode.appendChild(newElement)

            let title = document.createElement("h3");
            title.textContent = "Mobility Period " + d.data["Mobility Period"]

            let info = document.createElement("p");
            info.textContent = "Hover on the chart to see details"
            info.style.fontWeight = 600
            info.style.fontSize = "0.8rem"

            newElement.appendChild(title)
            newElement.appendChild(info)

            let svgPie = d3.select("#chart-pie")
                .append("svg")
                .attr("width", wPie)
                .attr("height", hPie)
                .append("g")
                .attr("transform", "translate(" + wPie / 2 + "," + hPie / 2 + ")");

            let maxRadius = Math.min(wPie, hPie) / 2;

            const dataToDraw = originalDataStackedPie[d.data["Mobility Period"]]
            drawStackedPieChart(dataToDraw, svgPie, maxRadius)
        })
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

        let svg = d3.select("#chart-bar")
            .append("svg")
            .attr("width", barChartWidth)
            .attr("height", barChartHeight);

        stackBarChart(svg, datasetTotal);
    })
}