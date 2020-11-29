class Sunburst {
  /**
   * Creates a Tree object representing the 
   * phylogeny of all microbial species present
   * 
   * @param data data from taxonomyInputFile.csv 
   */

  constructor(data, updateLevel) {
      this.data = data; 
      this.margin = { top: 30, right: 200, bottom: 30, left: 30} 
      this.width = 1300 - this.margin.left - this.margin.right; 
      this.height = 750 - this.margin.top - this.margin.bottom; 
      this.radius = (Math.min(this.width, this.height) / 2) - 10;
      this.updateLevel = updateLevel; 
      this.subgroups = []
      this.formatNumber = d3.format(",d");

      this.x = d3.scaleLinear()
        .range([0, 2 * Math.PI]);

      this.y = d3.scaleSqrt()
          .range([0, this.radius]);

      this.partition = d3.partition()
          //.size([2*Math.PI, radius])

      this.color = d3.scaleOrdinal(["#1f77b4","#aec7e8","#ff7f0e","#ffbb78","#98df8a","#ff9896","#9467bd","#c5b0d5","#e377c2","#f7b6d2", "#dbdb8d", "#17becf", "#9edae5", "#bcbd22",]);
  
      let that=this;
      this.arc = d3.arc()
        .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, that.x(d.x0))); })
        .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, that.x(d.x1))); })
        .innerRadius(function(d) { return Math.max(0, that.y(d.y0)); })
        .outerRadius(function(d) { return Math.max(0, that.y(d.y1)); });

      this.stratify = d3.stratify()
        .parentId(function(d) { return d.id.substring(0, d.id.lastIndexOf(".")); });
  
  
      //     //color scale
  //     this.color = d3.scaleOrdinal()
  //         .domain(this.subgroups) //domain will be set on drawTree when subgroups is defined
  //         .range(["#1f77b4","#aec7e8","#ff7f0e","#ffbb78","#98df8a","#ff9896","#9467bd","#c5b0d5","#e377c2","#f7b6d2", "#dbdb8d", "#17becf", "#9edae5", "#bcbd22",]);
  }
  drawSunburst() {

    let that = this; 

    d3.select("#Phylo")
          .append('div')
          .attr('class', 'tooltip')
          .style('opacity', 0)

    let svg = d3.select('#Phylo').append('svg')
          .classed('tree-svg', true)
          .attr("width", this.width + this.margin.left + this.margin.right)
          .attr("height", this.height + this.margin.top + this.margin.bottom)
          .append('g')
          .attr("transform", "translate(" + this.width / 2 + "," + (this.height / 2) + ")")
          .call(d3.zoom().on("zoom", function() {
            svg.attr("transform", d3.event.transform)
          }))


    //var svg = d3.select("body").append("svg")
    //   .attr("width", width)
    //   .attr("height", height)
    //   .append("g")
    //   .attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")")
  
    var root= this.stratify(this.data)
        .sort(function(a, b) { return (a.height - b.height) || a.id.localeCompare(b.id); });
    console.log(this.data)
    console.log(root)
  
    root = d3.hierarchy(root);
    //  root.sum(function(d) { console.log(d.data['NoMonarch_Experiment_256'])
    //	return parseInt(d.data['NoMonarch_Experiment_256']); });
    root.sum(function(d) { return !d.children || d.children.length === 0 ? parseInt(d.data['Monarch_Wild_249']) :0; });

    svg.selectAll("path")
      .data(this.partition(root).descendants())
      .enter().append("path")
      .attr("d", this.arc)
      .style("fill", function(d) { return that.color((d.children ? d : d.parent).data.id); })
      .on("click", click)
      .append("title")
      .text(function(d) { 
        console.log(d.data.id);
	      console.log(d.data.data['NoMonarch_Experiment_256']);
        return d.data.id + "\n" + that.formatNumber(d.data.data['NoMonarch_Experiment_256']) 
      });



    function click(d) {
    svg.transition()
      .duration(750)
      .tween("scale", function() {
        var xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
            yd = d3.interpolate(y.domain(), [d.y0, 1]),
            yr = d3.interpolate(y.range(), [d.y0 ? 20 : 0, radius]);
        return function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); };
      })
      .selectAll("path")
      .attrTween("d", function(d) { return function() { return arc(d); }; });
    }
  }
}
