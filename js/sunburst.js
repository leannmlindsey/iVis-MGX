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
      //this.width = 1300 - this.margin.left - this.margin.right; 
      //this.height = 750 - this.margin.top - this.margin.bottom;
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
  
  
      //     //color scale
  //     this.color = d3.scaleOrdinal()
  //         .domain(this.subgroups) //domain will be set on drawTree when subgroups is defined
  //         .range(["#1f77b4","#aec7e8","#ff7f0e","#ffbb78","#98df8a","#ff9896","#9467bd","#c5b0d5","#e377c2","#f7b6d2", "#dbdb8d", "#17becf", "#9edae5", "#bcbd22",]);
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
    //console.log(this.data)
    //console.log(root)
  
    root = d3.hierarchy(root);
    //  root.sum(function(d) { console.log(d.data[this.sample])
    //	return parseInt(d.data[this.sample]); });
    root.sum(function(d) { 
      return !d.children || d.children.length === 0 ? parseInt(d.data[that.sample]) :0; });

    updateSubgroups(2)

    svg.selectAll("path")
      .data(this.partition(root).descendants())
      .enter().append("path")
      //.join("path")
      .attr("d", this.arc)
      .style("fill", function(d) { 
        //console.log(d.data.id)
        //console.log(that.color(d.data.id))
        return that.color((d.children ? d : d.parent).data.id); })
      //.style("fill", d => that.color(d.data.id))
      .on("click", click)
      .append("title")
      .text(function(d) { 
        //console.log(d.data.id);
	      //console.log(d.data.data[this.sample]);
        return d.data.id + "\n" + that.formatNumber(d.data[this.sample])});

    
    

    function click(d) {
    console.log('made it to click1')
    console.log(d.data.data.id)
    let level = d.data.data.id.split(".").length
    console.log(level)
    that.updateLevel(level)
    svg.transition()
      .duration(750)
      .tween("scale", function() { console.log('made it to tween click1')
        var xd = d3.interpolate(that.x.domain(), [d.x0, d.x1]),
            yd = d3.interpolate(that.y.domain(), [d.y0, 1]),
            yr = d3.interpolate(that.y.range(), [d.y0 ? 20 : 0, that.radius]);
        return function(t) { that.x.domain(xd(t)); that.y.domain(yd(t)).range(yr(t)); };
      })
      .selectAll("path")
      .attrTween("d", function(d) { return function() { return that.arc(d); }; });
    }

    function updateSubgroups(level) {
      that.subgroups = []

      for (let i = 0; i < that.data.length; i++ ) {
          let clade = that.data[i].id.split(".").length
          if (clade == (level)){
               that.subgroups.push(that.data[i].id)
           }  
      };
      //reset the color scale to align with new level 
      //that.color = d3.scaleOrdinal()
          //.domain(that.subgroups) 
          //.range(["#1f77b4","#aec7e8","#ff7f0e","#ffbb78","#98df8a","#ff9896","#9467bd","#c5b0d5","#e377c2","#f7b6d2", "#dbdb8d", "#17becf", "#9edae5", "#bcbd22",]);
    }

  }

  updateSunburst(sample) {
    this.sample = sample;
    let that=this;
    var root= this.stratify(this.data)
        .sort(function(a, b) { return (a.height - b.height) || a.id.localeCompare(b.id); });
    
    root = d3.hierarchy(root);
        //  root.sum(function(d) { console.log(d.data[this.sample])
        //	return parseInt(d.data[this.sample]); });
    root.sum(function(d) { 
        return !d.children || d.children.length === 0 ? parseInt(d.data[that.sample]) :0; });
      

    let svg = d3.select('.sunburst-svg')
      .selectAll("path")
      .data(this.partition(root).descendants())
      //.enter().append("path")
      .join("path")
      .attr("d", this.arc)
      .style("fill", function(d) { 
        //console.log(d.data.id)
        //console.log(that.color(d.data.id))
        return that.color((d.children ? d : d.parent).data.id); })
      //.style("fill", d => that.color(d.data.id))
      .on("click", click2)
      .append("title")
      .text(function(d) { 
        //console.log(d.data.id);
        //console.log(d.data.data[this.sample]);
        return d.data.id + "\n" + that.formatNumber(d.data[this.sample]) 
      });

      function click2(d) {
        console.log('made it to click2')
        console.log(d.data.data.id)
        let level = d.data.data.id.split(".").length
        console.log(level)
        that.updateLevel(level)
        svg.transition()
          .duration(750)
          .tween("scale", function() { console.log('made it to tween click2')
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

