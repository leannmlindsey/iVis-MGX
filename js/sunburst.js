class Sunburst {
  /**
   * Creates a Tree object representing the
   * phylogeny of all microbial species present
   *
   * @param data data from taxonomyInputFile.csv
   * @param data2 data from stackedBarInputFullT.csv
   * @param updateLevel ives access to function in script.js which updates the bar chart chart
   * @param color universal color map to create consistent colors throughout the site
   *
   */

  constructor(data, data2, updateLevel, color) {
      this.data = data;
      this.data2 = data2;
      this.margin = { top: 100, right: 200, bottom: 30, left: 30}
      this.width = 1200 - this.margin.left - this.margin.right;
      this.height = 650 - this.margin.top - this.margin.bottom;

      this.radius = (Math.min(this.width, this.height) / 2) - 10;
      this.updateLevel = updateLevel;
      this.subgroups = []
      this.formatNumber = d3.format(",d");
      this.sample = 'Monarch_Wild_248' //the sample initially shown in the sunburst plot
      this.x = d3.scaleLinear()
        .range([0, 2 * Math.PI]);

      this.y = d3.scaleSqrt()
          .range([0, this.radius]);

      this.partition = d3.partition()
          //.size([2*Math.PI, radius])

      this.color = color;
      
      let that=this;
      this.arc = d3.arc()
        .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, that.x(d.x0))); })
        .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, that.x(d.x1))); })
        .innerRadius(function(d) { return Math.max(0, that.y(d.y0)); })
        .outerRadius(function(d) { return Math.max(0, that.y(d.y1)); });

      this.stratify = d3.stratify()
        .parentId(function(d) { return d.id.substring(0, d.id.lastIndexOf(".")); });


  }
  drawSunburst(sample) {

    this.sample = sample;
    console.log('drawSunburst was called with ')
    console.log(this.sample)
    let that = this;

    let labelText = this.sample
    let levelLabel=d3.select('#sunburstLabel')
            .text("Sunburst for Sample:  " + labelText)

    d3.select("#Phylo")
          .append('div')
          .attr('class', 'tooltip')
          .style('opacity', 0)

    //Remove tree if one exists and remove old sunburst before drawing new one

     d3.select('#Phylo').selectAll('path').remove()
     d3.select('#Phylo').selectAll('text').remove()
     d3.select('#Phylo').selectAll('.tooltip').remove()
     d3.select('#Phylo').selectAll('svg').remove()

    let svg = d3.select('#Phylo').append('svg')
          .classed('sunburst-svg', true)
          .attr("width", this.width + this.margin.left + this.margin.right)
          .attr("height", this.height + this.margin.top + this.margin.bottom)
          .append('g')
          .attr("transform", "translate(" + this.width / 2 + "," + (this.height / 2) + ")")
          // .call(d3.zoom().on("zoom", function() {
          //   svg.attr("transform", d3.event.transform)
          // }))

      var root= this.stratify(this.data)
        .sort(function(a, b) { return (a.height - b.height) || a.id.localeCompare(b.id); });

    root = d3.hierarchy(root);
    root.sum(function(d) {
      return !d.children || d.children.length === 0 ? parseInt(d.data[that.sample]) :0; });

    console.log('root',root)

    //create a group for all of the paths
    let pathGroup =svg.append('g') //do in constructor so it doesn't append

    pathGroup.selectAll('path')
      .data(this.partition(root).descendants())
      .attr('class','pathGroup')
      .enter().append('path')
        .attr("d", this.arc)
        .attr("class", "cladeArc")
        .attr("id", function(d,i) { return "cladeArc_"+i; })
        .style("fill", function(d) {
          return that.color((d.children ? d : d.parent).data.id); })
        .on("click", click)
      .append("title")
        .text(function(d) {
        return d.data.id + "\n" + that.formatNumber(d.data[this.sample])
      });

    // pathGroup.selectAll("path")
    //   .each(function(d,i) { console.log(d3.select(this).attr("d"))
    //     //Note: the following code is from this tutorial
    //     //http://bl.ocks.org/nbremer/7b051187fe329d705ee9
    //     //to put text on a curved path in the center of the path
    //     //
    //     //First create a path that mimics the shape of the path but lower in the circle
    //     //
		// 		//A regular expression that captures all in between the start of a string (denoted by ^) and a capital letter L
		// 		//The letter L denotes the start of a line segment
		// 		//The "all in between" is denoted by the .+? 
		// 		//where the . is a regular expression for "match any single character except the newline character"
		// 		//the + means "match the preceding expression 1 or more times" (thus any single character 1 or more times)
		// 		//the ? has to be added to make sure that it stops at the first L it finds, not the last L 
		// 		//It thus makes sure that the idea of ^.*L matches the fewest possible characters
		// 		//For more information on regular expressions see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
		// 		var firstArcSection = /(^.+?)L/; 
					
		// 		//Grab everything up to the first Line statement
		// 		//The [1] gives back the expression between the () (thus not the L as well) which is exactly the arc statement
		// 		var newArc = firstArcSection.exec(d3.select(this).attr("d"))[1];
		// 		//Replace all the comma's so that IE can handle it -_-
		// 		//The g after the / is a modifier that "find all matches rather than stopping after the first match"
    //     newArc = newArc.replace(/,/g , " ");
        
    //   let textPathGroup = svg.append('g')
    //     //Create a new invisible arc that the text can flow along
    //     textPathGroup.selectAll("path")
    //     .data(this.partition(root).descendants())
    //     .enter().append("path")
    //     .attr("class", "textPathGroup")
    //     .attr("id", "nodeArc"+i)
    //     .attr("d", newArc)
    //     .style("fill", "black");
    // });

      //create  a group for all of the text elements
      let textGroup =svg.append('g') //do in constructor so it doesn't append

      textGroup.selectAll('text')
        .data(this.partition(root).descendants())
        .enter().append('text')
        .attr("class", "cladeText")
        //.attr("dy", -13)
        .append("textPath")
          //.attr("startOffset","50%")
          //.style("text-anchor","middle")
          .attr("xlink:href",function(d,i){return "#cladeArc_"+i;})
          //.attr("xlink:href",function(d,i) {return "#nodeArc_" +i;})
            .text(function(d) {
              let clade = d.data.id.split(".").slice(-1)
              let percentage = parseInt(d.data.data[that.sample])
              return percentage > 20 ? clade : "" })
            .attr("fill", 'black')
            .attr("font-size", '14px')

    function click(d) {

      let level = d.data.data.id.split(".").length
      that.updateLevel(level)
      svg.transition()
        .duration(750)
        .tween("scale", function() {
          var xd = d3.interpolate(that.x.domain(), [d.x0, d.x1]),
            yd = d3.interpolate(that.y.domain(), [d.y0, 1]),
            yr = d3.interpolate(that.y.range(), [d.y0 ? 20 : 0, that.radius]);
          return function(t) { that.x.domain(xd(t)); that.y.domain(yd(t)).range(yr(t)); };
        })
        .selectAll("path")
        .attrTween("d", function(d) { return function() { return that.arc(d); }; });
    }
    //Add the tooltip labels on mouseover
    // let tooltip = d3.select('#Phylo').append('div').classed('tooltip', true).style("opacity",0);
 
    //     pathGroup.on('mouseover', function(d) {

    //     //show tooltip
    //      tooltip.transition()
    //          .duration(200)
    //          .style("opacity", .9);
    //      tooltip.html(that.tooltipRender(d) + "<br/>")
    //          .style("left", (d3.event.pageX) + "px")
    //          .style("top", (d3.event.pageY - 28) + "px");
    //     });  
  }
  // tooltipRender(d) {
  //   let that = this;
  //   console.log(d)
  //   console.log(d.data.data.id)
  //   console.log(d.value)
  //   let taxon = d.data.data.id.split(".")
  //   console.log(taxon)
  //   let abundance = d.value

  //   let text = "<h1>" + taxon.slice(-1) + "</h1>" + "<h2>" + "Abundance: "+ abundance + "%" + "</h2>";
  //   return text;
     
  //   }
}

