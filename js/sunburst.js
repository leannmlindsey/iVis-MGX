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
      //this.color = d3.scaleOrdinal(["#1f77b4","#aec7e8","#ff7f0e","#ffbb78","#98df8a","#ff9896","#9467bd","#c5b0d5","#e377c2","#f7b6d2", "#dbdb8d", "#17becf", "#9edae5", "#bcbd22",]);

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
          .call(d3.zoom().on("zoom", function() {
            svg.attr("transform", d3.event.transform)
          }))
      
      var root= this.stratify(this.data)
        .sort(function(a, b) { return (a.height - b.height) || a.id.localeCompare(b.id); });
  
    root = d3.hierarchy(root);
    root.sum(function(d) { 
      return !d.children || d.children.length === 0 ? parseInt(d.data[that.sample]) :0; });

    console.log('root',root)
    
    //paths cannot hold text so we will create a group to hold the text and the arc
    //create the arc
    svg.selectAll('g')
      .data(this.partition(root).descendants())
      .enter().append('g').attr('class','sunburstNode')
      .append('path')
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

    //create the text, only show text if pie segment is 20% or more
    svg.selectAll(".sunburstNode")
        .append('text')
        .attr("transform", d => "translate(" + that.arc.centroid(d) + ")")
          .attr("class", "cladeText")
          .attr("text-anchor", "middle")
          //.append("textPath")
            //.attr("xlink:href",function(d,i){return "#cladeArc_"+i;})
            .text(function(d) { 
              let clade = d.data.id.split(".").slice(-1)
              let percentage = parseInt(d.data.data[that.sample])
              return percentage > 20 ? clade : "" })
            .attr("fill", 'white')
            .attr("font-size", '11px')


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

   

  }

}

