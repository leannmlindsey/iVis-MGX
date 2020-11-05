 Promise.all([d3.csv('./data/taxonomyInputFile.csv')]).then( dataRaw =>
     {
        console.log('Loading Data')
        console.log(dataRaw)
        let data=dataRaw[0]
        var stratify = d3.stratify()
            .parentId(function(d) { return d.id.substring(0, d.id.lastIndexOf(".")); });
        var root = stratify(data)
            .sort(function(a, b) { return (a.height - b.height) || a.id.localeCompare(b.id); });

        console.log(root)
   

     });

