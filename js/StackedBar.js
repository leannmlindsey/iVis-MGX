class sBar{
    constructor(data){
        this.data = data;

        this.drawChart(data);

    }

// this worked with LeAnn by transposing the data and deleting the header that was being read in.
    //ideas to fix this
        //read in multiple files
        //transpose within the script
        //make sure there are no headers/numbered headers





drawChart(){

//set margins and dimensions
    let margin = ({top: 10, right: 30, bottom: 200, left: 50});
    let width = 460 - margin.left - margin.right;
    let height = 400 - margin.top - margin.bottom;

//append svg to page body
    var dataT=d3.transpose(this.data)
    
    let stack_svg = d3.select('#stacked-barchart')
        .append('svg')
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append('g')
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



    //List of experimental sample type(x-axis)
    let subgroups = this.data.columns.slice(1);

    console.log(subgroups)

    //List of taxon(y-axis)
    let groups = d3.map(this.data, function(d){
        return(d.group)}).keys();
  
    //console.log(subgroups.slice(0,1))
    console.log(groups)

    //Add X axis
    let x = d3.scaleBand()
        .domain(groups)//if you add subgroups it looks cool but wrong(must be groups but then it gets ruined)
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
        .range(["#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#d62728", "#ff9896", "#9467bd", "#c5b0d5", "#e377c2", "#f7b6d2", "#bcbd22", "#dbdb8d", "#17becf", "#9edae5"]);
   

  
    //stack the data per subgroup
    let stackedData = d3.stack()
        .keys(subgroups) //should be subgroup //group for it to render something
        (this.data);
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
        //show tooltip
        tooltip.transition()
            .duration(200)
            .style("opacity", .9);
        tooltip.html(that.tooltipRender(d) + "<br/>")
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
  
      });
      //hover function for circle selection
      rects.on("mouseout", function (d) {
          tooltip.transition()
              .duration(500)
              .style("opacity", 0);
      });
}
tooltipRender(stackedData) {
    //let abundance = []
    //make for loop or just figure out how to subtract
    let text = "<h1>" + stackedData[1] + "</h1>"; //.charAt(0).toUpperCase()
    //console.log(stackedData) //+ data['phrase'].slice(1) +
    return text;
    
}
}
