class ViolinPlot {
  /**
   * Creates a ViolinPlot object representing the 
   * abundance of all the genes present in a selected data set
   * 
   * @param data data from taxonomyInputFile.csv 
   * @param data3 data from flatHeatmapData.csv
   * @param updateViolinChart gives access to function in script.js which updates the violin chart
   */

  constructor(data, data3,updateViolinChart) {
      this.data = data; 
      this.data3 = data3;
      this.margin = { top: 30, right: 30, bottom: 30, left: 30}
      this.width = 670 - this.margin.left - this.margin.right; 
      this.height = 350 - this.margin.top - this.margin.bottom; 
      this.updateViolinChart = updateViolinChart;
      
      // Color scale for dots
      this.myColor = d3.scaleOrdinal()
        .range(["#1f77b4", "#ff7f0e"])
        .domain(["Monarch", "No-Monarch"]) 

      // Build and Show the Y scale
      this.y = d3.scaleLinear()
        .domain([0,1000])          
        .range([this.height, 0])
      
      // Build and Show the X scale. It is a band scale like for a boxplot: each group has an dedicated RANGE on the axis. This range has a length of x.bandwidth
      this.x = d3.scaleBand()
        .range([ 0, this.width ])
        .domain(["Monarch", "No-Monarch"])
        .padding(0.05)     // This is important: it is the space between 2 groups. 0 means no padding. 1 is the maximum.
      }


  drawViolinPlot(){
      var that = this;
      // append the svg object to the body of the page
      var svg = d3.select("#violinplot")
          .append("svg")
              .attr("width", this.width + this.margin.left + this.margin.right)
              .attr("height", this.height + this.margin.top + this.margin.bottom)
              .classed('violin-svg',true)
          .append("g")
              .attr("transform",
                  "translate(" + this.margin.left + "," + this.margin.top + ")");
     
      svg.append("g").call( d3.axisLeft(this.y) ).attr('class','yAxis')

      svg.append("g")
        .attr("transform", "translate(0," + this.height + ")")
        .call(d3.axisBottom(this.x))   

}


updateViolinPlot(gene){
    console.log(gene.GeneFamily)
    //enter lOOP here that searches through data and finds the GeneFamily that matches
    var subsetGene = this.data3.filter(function (d) {return (d.GeneFamily == gene.GeneFamily) })
    //console.log(subsetGene)
    const numbers = subsetGene.map(d => +d.Value);  
    
    var maxY=d3.max(numbers)
    //console.log(maxY)
    this.y = d3.scaleLinear()
      .domain([0,maxY*1.25])          
      .range([this.height, 0])
    d3.select(".yAxis")
      .call( d3.axisLeft(this.y) )

    // Features of the histogram
    var histogram = d3.histogram()
     .domain(this.y.domain())
     .thresholds(this.y.ticks(5))    
     .value(d => d)

    
    
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
   //console.log(sumstat)
   // Add the shape to this svg!

   //Note: I had to do it this way because datum does not work with join
   //remove all previous violin paths
   d3.select(".violin-svg").selectAll(".violins").selectAll("path").remove()
   
   //draw new violins 
   var svg = d3.select(".violin-svg")
     .selectAll(".violins")
     .data(sumstat)
     //.enter()
     //.append("g")
     .join('g')
       .attr('class','violins')
       .attr("transform", function(d){ return("translate(" + (that.x(d.key) + + that.margin.left) +" ," + that.margin.top + ")") } ) // Translation on the right to be at the group position
       .append("path")
       .datum(function(d){return(d.value)})     // So now we are working bin per bin
       .join('path')
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
 var jitterWidth = 30
 var circles = d3.select(".violin-svg")
   .selectAll("circle")
   .data(subsetGene)
   .join("circle")
   .attr("transform", function(d){ return("translate(" + that.margin.left +" ," + that.margin.top + ")") } ) // Translation on the right to be at the group position
   .attr("cx", function(d){
       return(that.x(d.Condition) + 2.3*that.x.bandwidth()/4 -( Math.random()*(2*jitterWidth)-2 ))})
   .attr("cy", function(d){
       return(that.y(parseInt(d.Value)))})
   .attr("r", 5)
   .style("fill", function(d){ return(that.myColor(d.Condition))})
     .attr("stroke", "white")
     .on("mouseover", function(d){
       console.log(d);
       tooltip.style("opacity", 0.9)
       d3.select(this)
        .style("opacity", 0.9)
     })
     .on("mousemove", function(d){
      tooltip              
      .html("Sample: " + d.Sample + "Value: " + d.Value)
      .style("left", (d3.event.pageX) + "px")
      .style("top", (d3.event.pageY - 28) + "px");
    })
     .on("mouseleave", function(d){
      tooltip.style("opacity", 0)
                 d3.select(this)
                    .style("stroke", "none")
                    .style("opacity", 0.8)
    })


    //create tooltip with information about which sample 
    var tooltip = d3.select(".violin-svg")
                 .append("div")
                 .style("opacity", 0)
                 .attr("class", "tooltip")
                 .style("background-color", "white")
                 //.style("border", "solid")
                 //.style("border-width", "2px")
                 //.style("border-radius", "5px")
                 .style("padding", "5px")
                
        
        d3.select("#saveButton").on("click", function() {
          console.log('saving gene')
          d3.select("#GeneToSaveLabel")
            .data(subsetGene)
            .append("a")
            .attr("href", function(d) {
              let gene = d.GeneFamily.split("|")
              let uniref = gene[0].split("_")
              console.log("https://www.uniprot.org/uniprot/"+uniref[1])
              return "https://www.uniprot.org/uniprot/"+uniref[1]
            })
            .html(function(d) {
              let gene = d.GeneFamily.split("|")
              return gene[0] + "<br></br>"
            })
            .attr("target", "_blank")

          }) 



  //update labels with Gene specific information 

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

  // d3.select(".violin-svg")  //tried brushing but decided to just rescale axis on every click of gene
  //         .call( d3.brushY()                     
  //           .extent( [ [0,0], [700,350] ])
  //         )

}
}

