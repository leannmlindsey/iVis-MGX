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

        const phyloTree = new Tree(data, updateLevel); 
        const barChart = new sBar(data2);
        phyloTree.drawTree()
        barChart.drawChart()
        barChart.updateChart(2)

        let heatMap = new HeatMap(data, data3,updateViolinChart);
        heatMap.drawHeatmap();

        let violinPlot = new ViolinPlot(data, data3);
        violinPlot.drawViolinPlot();
        
        function updateLevel(levelNum) {
            console.log('updateLevel was called with level: ', levelNum);
            // barChart.drawChart(levelNum);
            barChart.updateChart(levelNum);
        }

        function updateViolinChart(gene) {
             console.log('updateViolinChart was called with gene: ', gene);
             violinPlot.updateViolinPlot(gene);
        }

     });
