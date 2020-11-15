 Promise.all([d3.csv('./data/taxonomyInputFile.csv')]).then( dataRaw =>
     {
        console.log('Loading Data')
        let data=dataRaw[0]; 
        console.log(data)
        
        const phyloTree = new Tree(data); 
        phyloTree.drawTree(); 
   

     });

