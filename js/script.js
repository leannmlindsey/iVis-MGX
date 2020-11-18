 Promise.all([d3.csv('./data/taxonomyInputFile.csv'), d3.csv('./data/stackedBarInputFullT_Level.csv'), d3.csv('./data/flatHeatmapData.csv')]).then(( [data, data2, data3]) =>
     {

        console.log('Loading Data')
        console.log('taxonomyInputFile.csv')
        console.log(data)
        console.log('stackedBarInputSmallT.csv')
        console.log(data2)
        console.log('taxonomyInputFile.csv')
        
        const phyloTree = new Tree(data); 
        phyloTree.drawTree(); 

        let stackedbar = new sBar(data2);
        let heatMap = new HeatMap(data, data3);
        heatMap.drawHeatmap();
     });
