class ViolinPlot {
    /**
     * Creates a ViolinPlot object representing the 
     * abundance of all the genes present in a selected data set
     * 
     * @param data data from taxonomyInputFile.csv 
     * @param data3 data from flatHeatmapData.csv
     */

    constructor(data, data3,updateViolinChart) {
        this.data = data; 
        this.data3 = data3;
        this.margin = { top: 100, right: 30, bottom: 30, left: 40}
        this.width = 700 - this.margin.left - this.margin.right; 
        this.height = 350 - this.margin.top - this.margin.bottom; 
        this.updateViolinChart = updateViolinChart;
  
        // Color scale for dots
        this.myColor = d3.scaleOrdinal()
          .range(["#1f77b4", "#ff7f0e"])
          .domain(["Monarch", "No-Monarch"]) 

        // Build and Show the Y scale
        this.y = d3.scaleLinear()
          .domain([0,650])          
          .range([this.height, 0])
        
        // Build and Show the X scale. It is a band scale like for a boxplot: each group has an dedicated RANGE on the axis. This range has a length of x.bandwidth
        this.x = d3.scaleBand()
          .range([ 0, this.width ])
          .domain(["Monarch", "No-Monarch"])
          .padding(0.05)     // This is important: it is the space between 2 groups. 0 means no padding. 1 is the maximum.
        }


    drawViolinPlot(){
	      var that = this;
        console.log(this.data3)
        // append the svg object to the body of the page
        var svg = d3.select("#violinplot")
            .append("svg")
                .attr("width", this.width + this.margin.left + this.margin.right)
                .attr("height", this.height + this.margin.top + this.margin.bottom)
                .classed('violin-svg',true)
            .append("g")
                .attr("transform",
                    "translate(" + this.margin.left + "," + this.margin.top + ")");
       
        svg.append("g").call( d3.axisLeft(this.y) )

        svg.append("g")
          .attr("transform", "translate(0," + this.height + ")")
          .call(d3.axisBottom(this.x))

        // Add a clipPath: everything out of this area won't be drawn.
        //var clip = svg.append("defs").append("svg:clipPath")
          //.attr("id", "clip")
          //.append("svg:rect")
          //.attr("width", this.width )
          //.attr("height",this.height )
          //.attr("x", 0)
          //.attr("y", 0);


	}
	updateViolinPlot(gene){
     console.log('made it to updateViolinPlot')
     console.log('gene')
     console.log(gene)
     //var idleTimeout
     // A function that set idleTimeOut to null
    //function idled() { idleTimeout = null; }
    // var extent = d3.event.selection
    //  console.log('extent')
    //  console.log(extent)
    //  console.log(idleTimeout)
     // If no selection, back to initial coordinate. Otherwise, update X axis domain
    // if(!extent){
    //   if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
    //   this.y.domain([0,650])
    // }else{
    //   this.y.domain([ this.y.invert(extent[0]), this.y.invert(extent[1]) ])
    //   scatter.select(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
    // }
    // Update axis and circle position
    //yAxis.transition().duration(1000).call(d3.axisBottom(x))

     // Features of the histogram
     var histogram = d3.histogram()
       .domain(this.y.domain())
       .thresholds(this.y.ticks(5))    
       .value(d => d)

      //enter lOOP here that searches through data and finds the GeneFamily that matches
      var subsetGene = this.data3.filter(function (d) {return (d.GeneFamily == gene.GeneFamily) })
      console.log(subsetGene)
      const numbers = subsetGene.map(d => +d.Value);
      var maxY=d3.extent(numbers)
      console.log(maxY)
      this.y.domain(maxY)
      
      
     // Compute the binning for each group of the dataset
     var sumstat = d3.nest()  // nest function allows to group the calculation per level of a factor
       .key(function(d) { 
          
          return d.Condition;
    
        })
       .rollup(function(d) {   // For each key..
         var input = d.map(function(g) { return parseInt(g.Value)})    // Keep the variable called Sepal_Length
         var bins = histogram(input)   // And compute the binning on it.
         return(bins)
       })
       .entries(subsetGene)

     // What is the biggest number of value in a bin? We need it cause this value will have a width of 100% of the bandwidth.
     var maxNum = 0
     for ( let i in sumstat ){
       var allBins = sumstat[i].value
       var lengths = allBins.map(function(a){return a.length;})
       var longest = d3.max(lengths)
       if (longest > maxNum) { maxNum = longest }
     }

     // The maximum width of a violin must be x.bandwidth = the width dedicated to a group
     var xNum = d3.scaleLinear()
       .range([0, this.x.bandwidth()])
       .domain([-maxNum,maxNum])
     
     
     var that=this;
     console.log(sumstat)
     // Add the shape to this svg!
     var svg = d3.select(".violin-svg")
       .selectAll("myViolins")
       //.attr("clip-path", "url(#clip)")
       .data(sumstat)
       .enter()
       .append("g")
         .attr('class','violins')
         .attr("transform", function(d){ return("translate(" + (that.x(d.key) + + that.margin.left) +" ," + that.margin.top + ")") } ) // Translation on the right to be at the group position
         .append("path")
         .datum(function(d){ return(d.value)})     // So now we are working bin per bin
         .style("stroke", "none")
         .style("fill", function(d,i){ return that.myColor(d)})
   	     .style("opacity", "0.6")
           .attr("d", d3.area()
               .x0(function(d){ return(xNum(-d.length)) } )
               .x1(function(d){ return(xNum(d.length)) } )
               .y(function(d){ return(that.y(d.x0)) } )
               .curve(d3.curveCatmullRom)    // This makes the line smoother to give the violin appearance. Try d3.curveStep to see the difference
         )
        
      
// Add individual points with jitter
   var jitterWidth = 40
   var circles = d3.select(".violin-svg")
      //.attr("clip-path", "url(#clip)")
     .selectAll("circle")
     .data(subsetGene)
     .join("circle")
     .attr("transform", function(d){ return("translate(" + that.margin.left +" ," + that.margin.top + ")") } ) // Translation on the right to be at the group position
       .attr("cx", function(d){
         return(that.x(d.Condition) + 3*that.x.bandwidth()/4 -( Math.random()*(2*jitterWidth) ))})
       .attr("cy", function(d){
         return(that.y(parseInt(d.Value)))})
       .attr("r", 5)
       .style("fill", function(d){ return(that.myColor(d.Condition))})
       .attr("stroke", "white")

    let vlabelTextG = "Gene: "
    let vlevelLabelG=d3.select('#violinLabelGene')
            .data(subsetGene)
            .text(d => {
              let gene = d.GeneFamily.split("|")
              return "Gene: " + gene[0]})
    let vlabelTextS = "Species: "
    let vlevelLabelS=d3.select('#violinLabelSpecies')
            .data(subsetGene)
            .text(d => {
              let gene = d.GeneFamily.split("|")
              return "Species: " + gene[1]})
  
    // d3.select(".violin-svg")
    //         .call( d3.brushY()                     
    //           .extent( [ [0,0], [700,350] ])
    //         )

}
}
