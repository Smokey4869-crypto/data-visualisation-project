var margin = { top: 10, right: 30, bottom: 100, left: 100 },
    width = 1200 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

let xScale, yScale

let maxImmigration = -Infinity
let maxEmigration = -Infinity

let years = []
let yearIndex = 0

// time interval for automation
let intervalId
let automatic = true

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
const onMouseOver = function (d) {
    tooltip
        .html(d.States + "<br>" + "Immigration: " + d.Immigration + "<br>" + "Emigration: " + d.Emigration)
        .style("opacity", 1)
}
const onMouseMove = function (d) {
    tooltip
        .style("left", (d3.mouse(this)[0]) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
        .style("top", (d3.mouse(this)[1]) + "px")
}
const onMouseLeave = function (d) {
    tooltip
        .style("opacity", 0)
}

function drawScatterPlotChart(data, svg) {
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .call(d3.axisLeft(yScale));

    // x-axis title 
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom / 2)
        .text("Emigration")
        .classed("axis-title", true)

    // y-axis title
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", margin.left / 2 - 100)
        .attr("x", -height / 2)
        .text("Immigration")
        .classed("axis-title", true)

    svg.append('g')
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function (d) {
            return xScale(d.Emigration / 10000);
        })
        .attr("cy", function (d) {
            return yScale(d.Immigration / 10000);
        })
        .attr("r", 10)
        .style("fill", "#131BC1")
        .style("stroke", "#000")
        .on("mouseover", onMouseOver)
        .on("mousemove", onMouseMove)
        .on("mouseleave", onMouseLeave)
        .on("click", function () {
            // Change color of clicked dot
            if (d3.select(this).style("fill") === "red") {
                d3.select(this).style("fill", "#131BC1")
            } else {
                // Reset color of other dots
                svg.selectAll("circle")
                    .style("fill", "#131BC1");
                d3.select(this).style("fill", "red");
            }
        });

    // Add reference lines
    svg.append("line")
        .attr("class", "average-line")
        .attr("x1", 0)
        .attr("y1", yScale(maxImmigration / 20000))
        .attr("x2", width)
        .attr("y2", yScale(maxImmigration / 20000))

    svg.append("text")
        .attr("classs", "average-label")
        .attr("x", 10)
        .attr("y", yScale(maxImmigration / 20000) - 10)
        .text("Average Immigration quantity")
        .attr("fill", "green")

    svg.append("line")
        .attr("class", "average-line")
        .attr("x1", xScale(maxEmigration / 20000))
        .attr("y1", yScale(height))
        .attr("x2", xScale(maxEmigration / 20000))
        .attr("y2", yScale(0))

    svg.append("text")
        .attr("classs", "average-label")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("x", 10)
        .attr("y", xScale(maxEmigration / 20000) - 10)
        .text("Average Emigration quantity")
        .attr("fill", "green")

}

function updateData(svg, index, data) {
    let newData = data[years[index]]

    let dots = svg.selectAll("circle")
        .data(newData)

    // Update existing dots
    dots
        .transition()
        .duration(1000)
        .attr("cx", function (d) {
            return xScale(d.Emigration / 10000);
        })
        .attr("cy", function (d) {
            return yScale(d.Immigration / 10000);
        })

    // Create new dots for any new dots
    dots
        .enter()
        .append("circle")
        .attr("cx", function (d) {
            return xScale(d.Emigration / 10000);
        })
        .attr("cy", function (d) {
            return yScale(d.Immigration / 10000);
        })
        .attr("r", 10)
        .style("fill", "#131BC1")
        .style("stroke", "#000")
        .on("mouseover", onMouseOver)
        .on("mousemove", onMouseMove)
        .on("mouseleave", onMouseLeave)
        .on("click", function () {
            // Change color of clicked dot
            if (d3.select(this).style("fill") === "red") {
                d3.select(this).style("fill", "#131BC1")
            } else {
                // Reset color of other dots
                svg.selectAll("circle")
                    .style("fill", "#131BC1");
                d3.select(this).style("fill", "red");
            }
        });

    dots
        .selectAll("circle")
        .exit()
        .transition()
        .duration(1000)
        .style('opacity', 0)
        .remove();
}

function generateDropdown(svg, data) {
    // Generate dropdown 
    let select = document.createElement("select")
    select.name = "Year"
    select.id = "select"

    for (const year of Object.keys(data)) {
        let option = document.createElement("option");
        option.value = year
        option.text = year
        select.appendChild(option)
        //update years list
        years.push(year)
    }

    var label = document.createElement("label");
    label.innerHTML = "Choose a year: "
    label.htmlFor = "Choose a year";
    document.getElementById("dropdown").appendChild(label).appendChild(select)

    select.addEventListener("change", handleSelectChange)

    function handleSelectChange(e) {
        automatic = false
        const selectedYear = e.target.value
        yearIndex = years.indexOf(selectedYear)
        document.getElementById("year").textContent = "Data displayed for year " + selectedYear

        updateData(svg, yearIndex, data)
    }
}

window.onload = function () {
    d3.json("data/state_to_state.json", function (error, json) {
        // Iterate over each sheet in the JSON data
        for (const sheetName in json) {
            const sheetData = json[sheetName];

            // Iterate over each row in the sheet data
            for (const row of sheetData) {
                // Check if immigration value is greater than current max
                if (parseInt(row.Immigration) > maxImmigration) {
                    maxImmigration = parseInt(row.Immigration);
                }

                // Check if emigration value is greater than current max
                if (parseInt(row.Emigration) > maxEmigration) {
                    maxEmigration = parseInt(row.Emigration);
                }
            }
        }

        xScale = d3.scaleLinear()
            .domain([0, maxEmigration / 10000])
            .range([0, width])

        // Add Y axis
        yScale = d3.scaleLinear()
            .domain([0, maxImmigration / 10000])
            .range([height, 0])

        let svg = d3.select("#chart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        generateDropdown(svg, json)
        drawScatterPlotChart(json[years[yearIndex]], svg)

        d3.select("#automatic")
            .on("click", function () {
                automatic = !automatic
                document.getElementById("automatic").textContent = "Automatic: " + (automatic ? "On" : "Off")
            })

        document.getElementById("year").textContent = "Data displayed for year " + years[yearIndex]

        intervalId = setInterval(() => {
            if (automatic) {
                if (yearIndex == years.length) {
                    yearIndex = 0
                } else {
                    yearIndex++
                }

                document.getElementById("year").textContent = "Data displayed for year " + years[yearIndex]
                updateData(svg, yearIndex, json)
            }
        }, 2000);
    })
}