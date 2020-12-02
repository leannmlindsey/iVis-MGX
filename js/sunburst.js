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

      this.middleArcLine = d => {
        console.log('middleArcLine called')
        

        //this function created by vasturiano
        //https://gist.github.com/vasturiano/12da9071095fbd4df434e60d52d2d58d 
      }


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

      //create a group for all of the paths for the hidden path
    let hiddenPathGroup =svg.append('g') //do in constructor so it doesn't append

    hiddenPathGroup.selectAll('path')
      .data(this.partition(root).descendants())
      .enter().append("path")
      .attr('class', 'hidden-arc')
      .attr('id', function(d,i) { return "hiddenArc_"+i; })
      .attr('d', function(d) {
        console.log('transformation')
        const halfPi = Math.PI/2;
        const angles = [that.x(d.x0) - halfPi, that.x(d.x1) - halfPi];
        const r = Math.max(0, (that.y(d.y0) + that.y(d.y1)) / 2);

        const middleAngle = (angles[1] + angles[0]) / 2;
        const invertDirection = middleAngle > 0 && middleAngle < Math.PI; // On lower quadrants write text ccw
        if (invertDirection) { angles.reverse(); }

        const path = d3.path();
        path.arc(0, 0, r, angles[0], angles[1], invertDirection);
        return path.toString();
      })
      .attr('opacity',0)
      .on("click", click)

      //create  a group for all of the text elements
    let textGroup =svg.append('g') //do in constructor so it doesn't append

      textGroup.selectAll('text')
        .data(this.partition(root).descendants())
        .enter().append('text')
        .attr("class", "cladeText")
        //.attr("dy", -13)
        .append("textPath")
          .attr("startOffset","50%")
          .style("text-anchor","middle")
          //.attr("xlink:href",function(d,i){return "#cladeArc_"+i;})
          .attr("xlink:href",function(d,i) {return "#hiddenArc_" +i;})
            .text(function(d) {
              let clade = d.data.id.split(".").slice(-1)
              let percentage = parseInt(d.data.data[that.sample])
              return percentage > 15 ? clade : "" })
            .attr("fill", 'white')
            .attr("font-size", '16px')

    function click(d) {

      let level = d.data.data.id.split(".").length
      that.updateLevel(level) //updates the stacked bar chart to the appropriate level 
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
    let tooltip = d3.select('#Phylo').append('div').classed('tooltip', true).style("opacity",0);
    
    hiddenPathGroup.selectAll('path')
        .on('mouseover', function(d) {
          console.log(d)

        //show tooltip
         tooltip.transition()
             .duration(200)
             .style("opacity", .9);
         tooltip.html(that.tooltipRender(d) + "<br/>")
             .style("left", (d3.event.pageX) + "px")
             .style("top", (d3.event.pageY - 28) + "px");
        });
         
  }
  tooltipRender(d) {
    let that = this;
    // console.log(d)
    // console.log(d.data.data.id)
    // console.log(d.value)
    let taxon = d.data.data.id.split(".")
    // console.log(taxon)
    let abundance = d.value

    let text = "<h1>" + taxon.slice(-1) + "</h1>" + "<h2>" + "Abundance: "+ abundance + "%" + "</h2>";
    return text;
     
    }
}

