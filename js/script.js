Promise.all([d3.csv('./data/taxonomyInputFile.csv'),d3.csv('./data/stackedBarInputFullT.csv'),d3.csv('./data/flatHeatMapConditionSuperSmall.csv')]).then(([data,data2,data3]) =>
     {

        console.log('Loading Data')
        console.log('taxonomyInputFile.csv')
        console.log(data)
        console.log('stackedBarInputSmallT.csv')
        console.log(data2)
        console.log('flatHeatmapDataSmall.csv')
        console.log(data3)
      //   console.log('taxonomyInputFile.csv')

        //prepare a universal color mapping
        let colorMap = data2.columns;
        colorMap.shift()
        //console.log(colorMap)

        let sortedColorMap = colorMap.sort(function(a, b){
            return a.length - b.length;
          });

        let colors = ['#dbdb8d','#ffbb78',"#c5b0d5","#aec7e8","#9467bd","#1f77b4","#98df8a","#ff9896","#ff7f0e","#e377c2","#f7b6d2", "#dbdb8d", "#17becf", "#9edae5",]
        //color scale
        let color = d3.scaleOrdinal()
            .domain(sortedColorMap) 
            .range(colors);
       
        const phyloTree = new Tree(data, data2, updateLevel, color); 
        const sunburst = new Sunburst(data, data2, updateLevel, color);
        const barChart = new sBar(data2,updateSunburstChart, color);
        //phyloTree.drawTree()
        sunburst.drawSunburst('Monarch_Wild_248')
        barChart.drawChart()
        barChart.updateChart(2)

        let heatMap = new HeatMap(data, data3,updateViolinChart);
        heatMap.drawHeatmap();

        let sampleGene = {GeneFamily: "UniRef90_A0A062X980|g__Lactobacillus.s__Lactobacillus_murinus", Sample: "NoMonarch_Wild_260", Value: "28.3265682948", Condition: "No-Monarch"}

        let violinPlot = new ViolinPlot(data, data3);
        violinPlot.drawViolinPlot();
        updateViolinChart(sampleGene)
        
        function updateLevel(levelNum) {
            console.log('updateLevel was called with level: ', levelNum);
            // barChart.drawChart(levelNum);
            barChart.updateChart(levelNum);
        }

        function updateViolinChart(gene) {
             console.log('updateViolinChart was called with gene: ', gene);
             violinPlot.updateViolinPlot(gene);
        }

        function updateSunburstChart(sample) {
          console.log('updateSunburstChart was called with gene: ', sample);
          sunburst.updateSunburst(sample);
     }

     });
