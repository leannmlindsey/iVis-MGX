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
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");


// //Read the data
// //d3.csv("data/test1.csv", function(error1, data) {  
// //d3.csv("data/flatHeatmapData2387.csv", function(error2, data2) {

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
                .call(d3.axisTop(x))
                .selectAll("text")
                  .attr("y", 0)
                  .attr("x", 9)
                  .attr("dy", ".35em")
                  .attr("transform", "rotate(-30)")
                  .style("text-anchor", "start")

            // Build X scales and axis:
            var y = d3.scaleBand()
                .range([ this.height, 0 ])
                .domain(geneList)
                .padding(0.01);
                svg.append("g")
                  .call(d3.axisLeft(y));

            // Build color scale
            var myColor = d3.scaleLinear()
                .range(["white", "#69b3a2"])
                .domain([1,100])

            svg.selectAll()
                .data(this.data2) 
                .enter()
                .append("rect")
                  .attr("x", function(d) { return x(d.Sample) })
                  .attr("y", function(d) { return y(d.GeneFamily) })
                  .attr("width", x.bandwidth() )
                  .attr("height", y.bandwidth() )
                  .style("fill", function(d) { return myColor(d.Value)} )

    }
}
