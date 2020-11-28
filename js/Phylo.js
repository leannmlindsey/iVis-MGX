class Tree {
    /**
     * Creates a Tree object representing the 
     * phylogeny of all microbial species present
     * 
     * @param data data from taxonomyInputFile.csv 
     */

    constructor(data, updateLevel) {
        this.data = data; 
        this.margin = { top: 10, right: 90, bottom: 30, left: 90} //margin right used to be 90
        this.width = 1300 - this.margin.left - this.margin.right; 
        this.height = 750 - this.margin.top - this.margin.bottom; 
        this.updateLevel = updateLevel; 
        this.subgroups = []
        // let stackedbar = new sBar(data2); 
        // this.stackedbar = stackedbar
        // this.level = 4

        //color scale
        this.color = d3.scaleOrdinal()
            .domain(this.subgroups) //domain will be set on drawTree when subgroups is defined
            .range(["#1f77b4","#aec7e8","#ff7f0e","#ffbb78","#98df8a","#ff9896","#9467bd","#c5b0d5","#e377c2","#f7b6d2", "#dbdb8d", "#17becf", "#9edae5", "#bcbd22",]);
    }

    drawTree() {
        // this.stackedbar.drawChart(this.level)
        let that = this; 

        d3.select("#Phylo")
          .append('div')
          .attr('class', 'tooltip')
          .style('opacity', 0)

        let svg = d3.select('#Phylo').append('svg')
          .classed('tree-svg', true)
          .attr("width", this.width + this.margin.left + this.margin.right)
          .attr("height", this.height + this.margin.top + this.margin.bottom)
          .call(d3.zoom().on("zoom", function() {
            svg.attr("transform", d3.event.transform)
          }))

        //let tax_ranks=["Kingdom", "Phylum", "Class", "Order", "Family", "Genus", "Species"]
        //svg.append("text").text(tax_ranks).attr("x1","100").attr("y1", "100"); 
        //above code not rendering properly, eitherway it would be better to do something like the last homework where the labels
        //update depending on expansion. I didn't do it on my homework 6 hehe..

        let treeGroup = d3.select('.tree-svg').append('g')
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")"); 
        
        // declare a tree layout and assign size 
        let treemap = d3.tree().size([this.height, this.width]); 

        // converts tabular data to a hierarchy 
        let stratify = d3.stratify()
            // .id(function(d) { 
            //     return d.id.substring(d.id.lastIndexOf(".")+1); 
            // })
            .parentId(function(d) { return d.id.substring(0, d.id.lastIndexOf(".")); })


        let root = stratify(this.data)
            .sort(function(a, b) { return (a.height - b.height) || a.id.localeCompare(b.id); });

        root.x0 = this.height / 2; 
        root.y0 = 0; 

        // collapse after the second level 
        root.children.forEach(collapse);
     
        update(root); 

        // collapse the node and all its children 
        function collapse(d) {
            if (d.children) {
                d._children = d.children; 
                d._children.forEach(collapse);
                d.children = null; 
            }
        }
        function getId(d) {
            //console.log(d.id)
            that.subgroups.push(d.id)
            //console.log(that.subgroups)
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
            that.color = d3.scaleOrdinal()
                .domain(that.subgroups) 
                .range(["#1f77b4","#aec7e8","#ff7f0e","#ffbb78","#98df8a","#ff9896","#9467bd","#c5b0d5","#e377c2","#f7b6d2", "#dbdb8d", "#17becf", "#9edae5", "#bcbd22",]);
        }

        function update(source) {


            // assign x and y coordinate properties to each node 
            let treeData = treemap(root);
        
            // compute the new tree layout
            let nodes = treeData.descendants(), 
                links = treeData.descendants().slice(1); 
           
            let maxDepth = Math.max.apply(null, nodes.map(d => d.depth))
            that.updateLevel(maxDepth+1)
            updateSubgroups(maxDepth+1) //updating subgroups updates the colors on the nodes 

            // Normalize for fixed-depth.
            nodes.forEach(function(d){ d.y = d.depth * 150});

            /************ NODES SECTION  ***************/
            // update the nodes 
            let node = svg.selectAll('g.node')
                .data(nodes, d => d.id); 
        
            // enter any new nodes at the parent's position
            let nodeEnter = node.enter().append('g')
                .attr('class', 'node')
                .attr('transform', d => {
                    return "translate(" + source.y0 + "," + source.x0 + ")";
                })
                .on('click', click); 
            
            // add circle for the nodes 
            nodeEnter.append('circle')
                .attr('class', 'node')
                .attr('r', 1e-6)
                .attr("transform", "translate(" + that.margin.left + "," + that.margin.top + ")")
                //.style("fill", d => d._children ? "#aec7e8" : "#fff");
                .style("fill", d => d._children ? that.color(d.id) : "#fff");
            // add labels for the nodes 
            nodeEnter.append('text')
                .attr("dy", ".35em")
                .attr("x", d => d.children || d._children ? -13 : 13)
                .attr("transform", "translate(" + that.margin.left + "," + that.margin.top + ")")
                .attr("text-anchor", d => d.children || d._children ? "end" : "start")
                .text(d => d.id.substring(d.id.lastIndexOf(".")+1));
            
            // update 
            let duration = 750;
            let nodeUpdate = nodeEnter.merge(node); 

            // transition to the proper position for the node 
            nodeUpdate.transition()
                .duration(duration)
                .attr("transform", d => "translate(" + d.y + "," + d.x + ")"); 
            
            // update the node attributes and style 
            nodeUpdate.select('circle.node')
                .attr('r', 10)
                //.style("fill", d => d._children ? "#aec7e8" : "#fff") //old node coloring system
                //.style("fill", d => d._children ? that.color(d.id): "#fff") //nodes colored to match the stacked bar
                .style("fill", d => {
                    if (d._children) {
                        if (d.depth == maxDepth){
                            //console.log(d.depth)
                            return that.color(d.id)
                        } else {
                        return '#aec7e8'
                        }
                    } else {
                        return "#fff"
                    }
                    
                })
                .attr('cursor', 'pointer');
            
            // remove any exiting nodes 
            let nodeExit = node.exit().transition()
                .duration(duration)
                .attr("transform", d => "translate(" + source.y + "," + source.x + ")")
                .remove();
            
            // on exit, reduce the node circles size to 0 
            nodeExit.select('circle')
                .attr('r', 1e-6);
        
            // On exit reduce the opacity of text labels
            nodeExit.select('text')
                .style('fill-opacity', 1e-6);
            
            const tooltip = d3.select('.tooltip'); 
            nodeUpdate.on("mouseover", function(d,i) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 1); 
        
                tooltip.html(tooltipRender(d))
                    .style("left", `${d3.event.pageX}px`)
                    .style("top", `${d3.event.pageY}px`); 
            })
                .on("mouseleave", function(d, i) {
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
            })

            /**
             * Returns html that can be used to render the tooltip.
             * @param data 
             * @returns {string}
             */
            function tooltipRender(data) {

                if (data._children) {
                    var text = "<h2> Children: " + data._children.length + "</h2>";
                }
                else if (data.children) {
                    var text = "<h2> Children: " + data.children.length + "</h2>";
                }
                else {
                    var text = "<h2> Children: 0 </h2>";
                }

                return text; 
            }

            
            // ****************** links section ***************************

            // Update the links...
            let link = svg.selectAll('path.link')
                .data(links, d => d.id);

            // Enter any new links at the parent's previous position.
            let linkEnter = link.enter().insert('path', "g")
                .attr("class", "link")
                .attr('d', d => {
                    let o = {x: source.x0, y: source.y0}
                    return diagonal(o, o)
                });

            // UPDATE
            let linkUpdate = linkEnter.merge(link);

            // Transition back to the parent element position
            linkUpdate.transition()
                .duration(duration)
                .attr("transform", "translate(" + that.margin.left + "," + that.margin.top + ")")
                .attr('d', d => diagonal(d, d.parent));

            // Remove any exiting links
            let linkExit = link.exit().transition()
                .duration(duration)
                .attr('d', d => {
                    let o = {x: source.x, y: source.y}
                    return diagonal(o, o)
                })
                .remove();

            // Store the old positions for transition.
            nodes.forEach(d => {
                d.x0 = d.x;
                d.y0 = d.y;
            });

            // Creates a curved (diagonal) path from parent to the child nodes
            function diagonal(s, d) {

                let path = `M ${s.y} ${s.x}
                        C ${(s.y + d.y) / 2} ${s.x},
                        ${(s.y + d.y) / 2} ${d.x},
                        ${d.y} ${d.x}`

                return path
            }


            // Toggle children on click.
            function click(d) {

                if (d.children) {
                    d._children = d.children;
                    d.children = null;
                } else {
                    d.children = d._children;
                    d._children = null;
                }

                update(d);
                // that.updateLevel(d.depth+2)
            }
        }
        
    }


}

