class sBar{
    constructor(data){
        this.data = data;
        this.select_subset=data;
        this.filtered = [] //an array to keep track of which species will be filtered out of the dataset 
     
        //set margins and dimensions
        this.margin = ({top: 10, right: 30, bottom: 200, left: 80});
        this.width = 460 - this.margin.left - this.margin.right;//used to be 760
        this.height = 800 - this.margin.top - this.margin.bottom;

        //List of experimental sample type(x-axis)
        this.groups = d3.map(this.select_subset, function(d){
            return(d.group)}).keys();

        this.x = d3.scaleBand()
            .domain(this.groups)
            .range([0, this.width])
            .padding([0.2]);

        this.y = d3.scaleLinear()
            .domain([0,100])
            .range([this.height, 0]);

        this.padding = 40;

    }

drawChart(){


    //append svg to page body
    let stack_svg = d3.select('#stacked-barchart')
        .append('svg')
            .attr("width", this.width + this.margin.left+10 + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .classed('stack-svg',true)
        .append('g')
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    //Draw x axis
    let xaxis = stack_svg.append('g')
        .attr("transform", "translate(0," + this.height + ")")
        .call(d3.axisBottom(this.x).tickSizeOuter(0))
       xaxis.selectAll(".tick text")
         .attr("transform", "translate (5,15) rotate (-30)")
         .attr("text-anchor", "end")
         .attr("font-family", "Work Sans");

    //Draw y-axis
    stack_svg.append('g')
        .call(d3.axisLeft(this.y));

    //Add Y axis title
    stack_svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - this.margin.left)
        .attr("x",0 - (this.height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("font-size", "smaller")
        .style("font-family", "Work Sans")
        .text("Taxon Abundance"); 
    
    //svg for legend
    let legend = d3.select('#stacked-barchart').append('svg')
        .classed("legend-svg", true)
        .attr("width", "230")
        .attr("height", "800")
        .append('g')
        .attr('class', 'legend');
    
}

updateChart(level){

        //List of taxons
        //create the subset to draw the correct level of the tree
        //level=1 kingdom, level=2 phylum, etc.
        let subgroups = createSubset(this.data,level, this.filtered);
        let labelText = "Level: Phylum"
        switch(level){
            case 0:
                labelText = "";
                break;
            case 1:
                labelText = "Level: Kingdom";
                break;
            case 2:
                labelText = "Level: Phylum";
                break;
            case 3:
                labelText = "Level: Class";
                break;
            case 4:
                labelText = "Level: Order";
                break;
            case 5:
                labelText = "Level: Family";
                break;
            case 6:
                labelText = "Level: Genus"
                break;
            case 7:
                labelText = "Level: Species"

        }
        let levelLabel=d3.select('#stackedLabel')
            .text(labelText)

        //color scale
        let color = d3.scaleOrdinal()
            .domain(subgroups) 
            .range(["#1f77b4","#aec7e8","#ff7f0e","#ffbb78","#98df8a","#ff9896","#9467bd","#c5b0d5","#e377c2","#f7b6d2", "#dbdb8d", "#17becf", "#9edae5", "#bcbd22",]);
        let that=this
        

        //stack the data per subgroup
        let stackedData = d3.stack()
            .keys(subgroups) 
            .order(d3.stackOrderNone) 
            (this.select_subset);

        //show the bars
        let rects = d3.select('.stack-svg').append('g')
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
            .selectAll('g')
            //enter in stack data, loop key per key, group per group
            .data(stackedData)
            .enter().append('g')
                .attr("fill", function(d){
                    //console.log(d.key)
                    return color(d.key); })
                .attr("class", function(d){return "myRect " + d.key.split(".").slice(-1)})
                .selectAll("rect")
                .data(function(d){
                    return d; });

        rects.exit().remove()

    let enterRects = rects.enter().append('rect');
            enterRects
                .attr("x", function(d){return that.x(d.data.group); })
                .attr("y", function(d){return that.y(d[1]); })
                .attr("height", function(d){ return that.y(d[0])- that.y(d[1]); })
                .attr("width", that.x.bandwidth());
            
            rects=rects.merge(enterRects)

            rects
               .transition()
               .duration(300)
               .delay(140)
                .attr("x", function(d){return that.x(d.data.group); })
                .attr("y", function(d){return that.y(d[1]); })
                .attr("height", function(d){ return that.y(d[0])- that.y(d[1]); })
                .attr("width", that.x.bandwidth());
                
            let legend = d3.select('.legend');

            legend.selectAll('rect')
                .data(stackedData)
                .join('rect')
                .attr('x', 0)
                .attr('y', function(d, i){
                return i * 18;
                })
                .attr('width', 12)
                .attr('height', 12)
                .attr("fill", function(d){
                return color(d.key); 
                })
                .attr("class", function(d){return "legendRect " + d.key.split(".").slice(-1)})
                
                .on("mouseover", function (d) {
                    let taxon = d.key.split(".").slice(-1);
                    //console.log(taxon[1])
                    d3.selectAll("."+ taxon)        
                      .style("opacity",0.2);             
               })
                .on("mouseout", function (d) {
                    d3.selectAll(".legendRect")
                       .style("opacity", 1)
                    d3.selectAll(".myRect")
                       .style("opacity", 1)
               })
                
                .on('click', click);
                ;
            
            legend.selectAll('text')
            .data(stackedData)
            .join('text')
            .text(function(d){
            return d.key.split(".").slice(-1);
            })
            .attr('x', 18)
            .attr('y', function(d, i){
            return i * 18;
             })
            .attr('text-anchor', 'start')
            .attr('alignment-baseline', 'hanging')
            .attr("class", function(d){return "legendText " + d.key.split(".").slice(-1)})
            .on("mouseover", function (d) {
              
                let taxon = d.key.split(".").slice(-1);
                //console.log(taxon[1])

                d3.selectAll(".legendText")
                  .style("opacity",1)
                       
                //Increase opacity of rect being hovered over
                d3.selectAll("."+ taxon)
                  .style("opacity",0.2)
           })
            .on("mouseout", function (d) {
                d3.selectAll(".legendRect")
                  .style("opacity", 1)
                d3.selectAll(".myRect")
                  .style("opacity", 1)

                d3.selectAll("text")
                   .transition()
                   .duration(1000)
                   .style("opacity", 1)
           })
            .on('click', click);

        function click(d) {
                    console.log(d.key)
                    //that.updateChart(level)
                    let taxon = d.key.split(".").slice(-1);
                    d3.selectAll("."+ taxon)
                      .attr("class","filtered")
                      .style("opacity",0.2)
                      .attr('fill','grey')
                    console.log('this.filtered', that.filtered)
                    that.filtered.push(d.key)
                    console.log('filtered list', that.filtered)
                    that.updateChart(level)
        } 
        //Add the tooltip labels on mouseover
        let tooltip = d3.select('#stacked-barchart').append('div').classed('tooltip', true).style("opacity",0);
            
                rects.on('mouseover', function (d, i) {
                    //subgroup being hovered over
                    var subgroupName = d3.select(this.parentNode).datum().key; 
                    var subgroupValue = d.data[subgroupName];
                    //Reduce opacity of all rectangles
                    d3.selectAll(".myRect")
                        .transition()
                        .duration(0)
                        .style("opacity", 0.2);
                    //Increase opacity of rect being hovered over
                    let taxon = subgroupName.split(".").slice(-1)
                    d3.selectAll("."+ taxon)
                        .transition()
                        .duration(800)
                        .style("opacity",1);


       

            //show tooltip
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(that.tooltipRender(d, subgroupName, subgroupValue))
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
        

  
                });
            //hover function for circle selection
            rects.on("mouseout", function (d) {

                 d3.selectAll(".myRect")
                    .transition()
                    .duration(1000)
                    .style("opacity", 1)


                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
}
tooltipRender(stackedData,subgroupName, subgroupValue) {
    let abundance = subgroupValue //stackedData[1] - stackedData[0]; old way commented out

    let taxon = subgroupName.split(".")
    //console.log(taxon)
    
    let text = "<h1>" + taxon.slice(-1) + "</h1>" + "<h2>" + abundance + "</h2>"; 
    return text;
    
}
}
function createSubset(data, level, filtered){

    //console.log(data.columns)
    //console.log(level)
    var indexList = []
    for (let key in data[1]) {
        //console.log('made it to create Subset')
        //console.log('key',key)
        let num = key.split('.') //counts the levels by counting the clade separator '.'
        
        if (num.length == level) {
            indexList.push(key)
        }
      }
    //now filter the indexList if anything is filtered out 
    for ( let item in filtered){
      //console.log('item',filtered[item])
      for (let key in indexList){
          //console.log('key', indexList[key])
        if (indexList[key] == filtered[item]) {
            indexList.splice(key, 1);
        }
      }  
    } 
    //console.log('final indexList',indexList)
    return indexList;
    

}
