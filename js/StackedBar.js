class sBar{
    constructor(data){
        this.data = data;
        this.select_subset=data;
        
        //this.subsetData(data);
        this.drawChart(data, 6);
        

    }

drawChart(data, level){

//set margins and dimensions
    let margin = ({top: 10, right: 30, bottom: 200, left: 50});
    let width = 760 - margin.left - margin.right;
    let height = 800 - margin.top - margin.bottom;

//append svg to page body
    let stack_svg = d3.select('#stacked-barchart')
        .append('svg')
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append('g')
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//create the subset to draw the correct level of the tree
//level=1 kingdom, level=2 phylum, etc.
    let subgroups = createSubset(this.data,level)
    console.log('subgroups')
    console.log(subgroups)
    
    //List of experimental sample type(x-axis)
    let groups = d3.map(this.select_subset, function(d){
        return(d.group)}).keys();
  
    
    console.log(groups)

    //Add X axis
    let x = d3.scaleBand()
        .domain(groups)
        .range([0, width])
        .padding([0.2])
    let xaxis = stack_svg.append('g')
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickSizeOuter(0))
       xaxis.selectAll(".tick text")
         .attr("transform", "translate (0,15) rotate (-90)")
         .attr("text-anchor", "end")
         .attr("font-family", "Work Sans");

    //Add Y axis
    let y = d3.scaleLinear()
        .domain([0,100])
        .range([height, 0])
    stack_svg.append('g')
        .call(d3.axisLeft(y));

    //Add Y axis label
    stack_svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("font-size", "smaller")
        .style("font-family", "Work Sans")
        .text("Taxon Abundance"); 
    
    //color palette = one color per different taxon
    let color = d3.scaleOrdinal()
        .domain(subgroups) 
        .range(["#1f77b4","#aec7e8","#ff7f0e","#ffbb78","#98df8a","#ff9896","#9467bd","#c5b0d5","#e377c2","#f7b6d2", "#dbdb8d", "#17becf", "#9edae5", "#bcbd22",]);
        //.range(["#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#ff9896", "#98df8a", "#9467bd", "#c5b0d5", "#e377c2", "#f7b6d2", "#bcbd22", "#dbdb8d", "#17becf", "#9edae5"]);
        //"#d62728"--red "#bcbd22"
  
    //stack the data per subgroup
    let stackedData = d3.stack()
        .keys(subgroups) 
        //.keys(['Bacteria.Actinobacteria','Bacteria.Synergistetes'])
        (this.select_subset);
    console.log('stacked data')
    console.log(stackedData)
    
    
    //show the bars
    let rects = stack_svg.append('g')
        .selectAll('g')
        //enter in stack data, loop key per key, group per group
        .data(stackedData)
        .enter().append('g')
            .attr("fill", function(d){
                return color(d.key); })
            .selectAll("rect")
            .data(function(d){
                return d; })
            .enter().append("rect")
                .attr("x", function(d){return x(d.data.group); })
                .attr("y", function(d){return y(d[1]); })
                .attr("height", function(d){return y(d[0])- y(d[1]); })
                .attr("width", x.bandwidth());

    //Add the tooltip labels on mouseover
    let tooltip = d3.select('#stacked-barchart').append('div').classed('tooltip', true).style("opacity",0);
    let that = this;
    rects.on('mouseover', function (d, i) {
       // what subgroup are we hovering?
       var subgroupName = d3.select(this.parentNode).datum().key; // This was the tricky part
       var subgroupValue = d.data[subgroupName];
       

        //show tooltip
        tooltip.transition()
            .duration(200)
            .style("opacity", .9);
        tooltip.html(that.tooltipRender(d, subgroupName, subgroupValue))
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
        
        //this section will highlight all of the rects of same species, if they
        //are classed in a specific way with the name as a class 
        // Reduce opacity of all rect to 0.2
        //d3.selectAll(".myRect").style("opacity", 0.2)
        // Highlight all rects of this subgroup with opacity 0.8. It is possible to select them since they have a specific class = their name.
        //d3.selectAll("."+subgroupName)
            //.style("opacity", 1)
  
      });
      //hover function for circle selection
      rects.on("mouseout", function (d) {
          tooltip.transition()
              .duration(500)
              .style("opacity", 0);
      });
}
tooltipRender(stackedData,subgroupName, subgroupValue) {
    let abundance = subgroupValue //stackedData[1] - stackedData[0]; old way commented out
    //console.log('subgroupName')
    //console.log(subgroupName)
    //console.log('subgroupValue')
    //console.log(subgroupValue)
    let taxon = subgroupName.split(".")
    //console.log(taxon)
    
    let text = "<h1>" + taxon.slice(-1) + "</h1>" + "<h2>" + abundance + "</h2>"; //.charAt(0).toUpperCase()
    return text;
    
}
}
function createSubset(data, level){
    //console.log(data.columns)
    //console.log(level)
    var indexList = []
    for (let key in data[1]) {
        let num = key.split('.')
        
        if (num.length == level) {
            //console.log('success!  we have a match!')
            //console.log(num.length);
            //console.log(level)
            indexList.push(key)
        }
      }
    //console.log(indexList)
    return indexList;
    

}
