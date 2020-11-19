class HeatMap {
    /**
     * Creates a Heatmap object representing the 
     * abundance of all the genes present in a selected data set
     * 
     * @param data data from taxonomyInputFile.csv 
     */

    constructor(data, data2) {
        this.data = data; 
        this.data2 = data2;
        this.margin = { top: 150, right: 150, bottom: 150, left: 400}
        this.width = 1000 - this.margin.left - this.margin.right; 
        this.height = 22000 - this.margin.top - this.margin.bottom; 

    console.log('constructed new heatmap')
    }

    drawHeatmap() {
        // append the svg object to the body of the page
        var svg = d3.select("#heatmap")
            .append("svg")
              .classed("heat-svg", true)
              .attr("width", this.width + this.margin.left + this.margin.right)
              .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
              .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
            

            let mySamples = this.data.columns.slice(1);
            console.log('mySamples =')
            console.log(mySamples)
            // Labels of row and columns
            //var mySamples = this.data.columns.slice(1,14)
            var geneList = []
            this.data2.forEach(function (d) {
                geneList.push(d.GeneFamily)
            });

            // Build X scales and axis:
            var x = d3.scaleBand()
                .range([ 0, this.width ])
                .domain(mySamples)
                .padding(0.01);
            svg.append("g")
                .attr("transform", "translate(0," + 0 + ")")
                .style("font-family", "Work Sans")
                .call(d3.axisTop(x))
                .selectAll("text")
                  .attr("y", 0)
                  .attr("x", 9)
                  .attr("dy", ".35em")
                  .attr("transform", "rotate(-30)")
                  .style("text-anchor", "start")
                  .style("font-family", "Work Sans");
                  

            // Build Y scales and axis:
            var y = d3.scaleBand()
                .range([ this.height, 0 ])
                .domain(geneList)
                .padding(0.01);
                svg.append("g")
                  .call(d3.axisLeft(y));
                svg.selectAll(".tick text").style("font-family", "Work Sans");

            // Build color scale
            var myColor = d3.scaleLinear()
                .range(["white", "#1f77b4"]) // //"#69b3a2"
                .domain([1,100])

            // create a tooltip

        var tooltip = d3.select("#heatmap")
                 .append("div")
                 .style("opacity", 0)
                 .attr("class", "tooltip")
                 .style("background-color", "white")
                 //.style("border", "solid")
                 //.style("border-width", "2px")
                 //.style("border-radius", "5px")
                 .style("padding", "5px")
                
         // Three function that change the tooltip when user hover / move / leave a cell
        var mouseover = function(d) {
                 tooltip.style("opacity", 0.9)
                 d3.select(this)
                 //.style("stroke", "black")
                 .style("opacity", 0.9)
        }
         var mousemove = function(d) {
                 tooltip
                    .html(tooltipRender(d))   
                    //.html("Gene: " + d.GeneFamily + "Sample: " + d.Sample + "Value:"  + d.Value)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
        }
        var mouseleave = function(d) {
                 tooltip.style("opacity", 0)
                 d3.select(this)
                    .style("stroke", "none")
                    .style("opacity", 0.8)
        }
        
        var tooltipRender = function (d) {
            let geneNameParsed = d.GeneFamily.split("|")
            let speciesNameParsed = d.GeneFamily.split("_")
            //console.log(speciesNameParsed)
            let line1 = "<h2>Gene: " + geneNameParsed[0] + "</h2>";
            let line2 = "<h2>Species: " + speciesNameParsed[5] + "_" + speciesNameParsed[6] + "</h2>";
            let line3 = "<h2>Sample: " + d.Sample + "</h2>";
            let line4 = "<h2>Value: "  + Math.round(d.Value)+ "</h2>";
            let text = line1 + String.fromCharCode(13) + line2 +String.fromCharCode(13) + line3+String.fromCharCode(13) + line4;
            return text;
        }

        let rectsSVG =  svg.selectAll()
                .data(this.data2) 
                .enter()
        
        let rects = rectsSVG.append("rect")
                  .attr("x", function(d) { return x(d.Sample) })
                  .attr("y", function(d) { return y(d.GeneFamily) })
                  .attr("width", x.bandwidth() )
                  .attr("height", y.bandwidth() )
                  .style("fill", function(d) { return myColor(d.Value)} )
                  .on("mouseover", mouseover)
                  .on("mousemove", mousemove)
                  .on("mouseleave", mouseleave)

    }
    

    
}
