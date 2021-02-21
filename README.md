# iVis-MGX, beta version 

iVis-MGX stands for Interactive Visualization of Metagenomic Data.  It is currently in Beta testing.

iVis-MGX is a tool that transforms the output of the metagenomic processing tools Humann 3.0 and Metaphlan 3.0 into a live website that a researcher can use to visualize and interact with their data.


 
## Examples of Live Sites
https://leannmlindsey.github.io/dataviscourse-pr-Visualization-of-Metagenomic-Data/FinalProject.html

## Requirements
1. [GitHub](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) - You will need to have a GitHub account and have GitHub installed on your local machine.
2. [Humann 3.0](https://huttenhower.sph.harvard.edu/humann) - Humann 3.0 can be installed via conda or docker
3. [Metaphlan 3.0](https://huttenhower.sph.harvard.edu/metaphlan) - Metaphlan 3.0 can be installed via conda or docker
4. [Python 3.0](https://www.python.org/download/releases/3.0/) - Your local machine needs to have Python 3.0 installed

## Installation Instructions
**0. Run Metaphlan 3.0 and Humann 3.0 on your metagenomic samples, following the instructions from the Huttenhower Lab website.**

If you already have merged your Metaphlan files and combined your genepathways and genefamilies output files from Humann 3.0, then you can skip step 0 and move directly to step 1.

* [Humann 3.0 Tutorial, Software & Handbook](https://huttenhower.sph.harvard.edu/humann)
* [Metaphlan 3.0 Tutorial, Software & Handbook](https://huttenhower.sph.harvard.edu/metaphlan)

The following instructions are taken from the end of the [Humann 3.0 Tutorial](https://github.com/biobakery/biobakery/wiki/humann3#3-manipulating-humann-output-tables), the portion on running multiple samples.  First, run Humann 3.0 on all samples.

<div class="language-markdown highlighter-rouge"><div class="highlight"><pre class="highlight"><code><span class="gh">$ for f in *.fasta; do humann -i $f -o hmp_subset; done</span>
</code></pre></div></div>

Then merge the output files into two tables, genepathways.tsv and genefamilies.tsv.

<div class="language-markdown highlighter-rouge"><div class="highlight"><pre class="highlight"><code><span class="gh">$ humann_join_tables -i input_dir -o genefamilies.tsv --file_name genefamilies</span>
<span class="gh">$ humann_join_tables -i input_dir -o genepathways.tsv --file_name genepathways</span>
</code></pre></div></div>


The following instructions are taken from the end of the [Metaphlan 3.0 Tutorial](https://github.com/biobakery/biobakery/wiki/metaphlan3), the portion on running multiple samples.  First, run metaphlan on all samples.
<div class="language-markdown highlighter-rouge"><div class="highlight"><pre class="highlight"><code><span class="gh">$ for i in SRS*.fasta.gz
> do
>     metaphlan $i --input_type fasta --nproc 4 > ${i%.fasta.gz}_profile.txt
> done</span>
<span class="gu">  </span>
</code></pre></div></div>

Then, merge the metaphlan output files.

<div class="language-markdown highlighter-rouge"><div class="highlight"><pre class="highlight"><code><span class="gu">$ merge_metaphlan_tables.py *_profile.txt > merged_abundance_table.txt</span>
</code></pre></div></div>

To be clear, we have no affiliation with the Huttenhower Lab, this is just an alternative way to visualize the output processed with their tools.

**1. Create a new github repository in your personal github account at www.github.com and import code from the iVis-MGX repository**
* Choose create new repository
* Give your repository a name
* Choose the last option, "...or, import code from another repository" and click "import code" and then type the https address of iVis-MGX (provided below)



![GitSetup](https://github.com/leannmlindsey/iVis-MGX/blob/main/images/GitSetup.png)

<div class="language-markdown highlighter-rouge"><div class="highlight"><pre class="highlight"><code><span class="gh">https://github.com/leannmlindsey/iVis-MGX.git</span>
</code></pre></div></div>

**2. Clone repository onto your local computer**
* You can find the clone address for your github repository by clicking on the green button labeled "Code" on the repository home page, and then copying the http// link in the pop up box.  In the box below, replace https://github.com/leannmlindsey/trial.git with the github https:// address that you created in step 1.

<div class="language-markdown highlighter-rouge"><div class="highlight"><pre class="highlight"><code><span class="gh">$ git clone https://github.com/leannmlindsey/trial.git</span>
</code></pre></div></div>

**3. Create a tab delimited file, samples.txt, which should have at a minimum 3 columns.  SampleID, SampleName, Condition_0.**  

This file maps your sampleIDs to a sampleName and experimental conditions.  Multiple experimental conditions are accepted by the tool, each experimental condition should be a separate column and labeled Condition_1, Condition_2, etc.  An example of the format of the samples.txt file is below.  The file can be created in excel and saved as a tab delimited file with the name samples.txt.

* [samples.txt](https://github.com/leannmlindsey/iVis-MGX/blob/main/data/raw/samples.txt)

It is important that the sampleID names *exactly match* the headers in the combined_genefamilies.tsv and combined_genepathways.tsv files.  An example of a command line script that you can run to capture these exact names is included below.

<div class="language-markdown highlighter-rouge"><div class="highlight"><pre class="highlight"><code><span class="gh">$ head -1 combined_genefamilies.tsv | tr "\t" "\n" > samples.txt</span>
</code></pre></div></div>

You can then open the samples.txt file in excel to create your sampleNames and condition_0 columns.  Then save as a tab delimited file.  Alternately you can create this file in any text editor and save as a tab delimited file.

**4. Copy the following output files from Humann 3.0 and Metaphlan 3.0 into iVis-Meta/data/raw/**
* samples.txt (file created in step 1 that maps sampleIDs to experimental condition)
* combined_genefamilies.tsv (humann 3.0 output)
* combined_genepathways.tsv (humann 3.0 output)
* merged_abundance.txt (metaphlan 3.0 output)

<div class="language-markdown highlighter-rouge"><div class="highlight"><pre class="highlight"><code><span class="gh">$ mv samples.txt ./iVis-MGX/data/raw/</span>
<span class="gh">$ cp combined_genefamilies.tsv ./iVis-MGX/data/raw/</span>
<span class="gu">$ cp combined_genepathways.tsv ./iVis-MGX/data/raw/</span>
<span class="gu">$ cp merged_abundance.txt ./iVis-MGX/data/raw/</span>
</code></pre></div></div>

**5. Run the python program to format the data properly for visualization.  This can be done on the command line, or in a jupyter notebook.**

<div class="language-markdown highlighter-rouge"><div class="highlight"><pre class="highlight"><code><span class="gh">$ cd ./iVis-MGX/</span>
<span class="gu">$ python3 iVis-MGX-preprocessing.py </span>
</code></pre></div></div>

Alternately, you can use the provided jupyter notebook to preprocess your data.

* [iVis-MGX-preprocessing.ipynb](https://github.com/leannmlindsey/iVis-MGX/blob/main/data/preprocessingScripts/DataVisProject_FinalScripts.ipynb)

**6. Optional, reduce the size of the gene_pathways.tsv file by choosing differntialy expressed genes and save as gene_pathways_heatmap.tsv**

The heatmap in the lower section of the screen will display the entire file that it is given.  The genepathways.tsv file is usually extremely large and takes too long to load.  You can look at a partial section of the file, or you can run some differential expression analysis software to reduce the number of lines in the file.  An example file diff.R is provided in [./iVis-MGX/data/preprocessingScripts/](https://github.com/leannmlindsey/iVis-MGX/blob/main/data/preprocessingScripts/diff.R)

* [diff.R](https://github.com/leannmlindsey/iVis-MGX/blob/main/data/preprocessingScripts/diff.R)

**7. Push local changes to github repository**

<div class="language-markdown highlighter-rouge"><div class="highlight"><pre class="highlight"><code><span class="gh">$ cd ./iVis-MGX/</span>
<span class="gu">git status</span>
<span class="gu">git add data/raw/samples.txt</span>
<span class="gu">git add data/raw/combined_genefamilies.tsv</span>
<span class="gu">git add data/raw/combined_genepathways.tsv</span>
<span class="gu">git add data/raw/merged_abundance.txt</span>
<span class="gu">git commit</span>
<span class="gu">git push</span>
</code></pre></div></div>

**8. Run the visualization locally by setting up a local php server**

<div class="language-markdown highlighter-rouge"><div class="highlight"><pre class="highlight"><code><span class="gh">$ cd ./iVis-MGX/</span>
<span class="gu">$ php -S localhost:8080</span>
</code></pre></div></div>

Your visualization will then be active on your local machine by going to a browser on the same local machine and typing 
localhost:8080/iVis-MGX.html 

Note:  on mac computers php is already installed.  If running on a computer without php, you will have to install php.

**9. Create a live public website by setting up GitHub Pages**

Go to your github repository and click on Settings (the wheel icon on the right hand side).  

![GitPagesSettings](https://github.com/leannmlindsey/iVis-MGX/blob/main/images/GitPagesSettings.png)

Scroll down to GitHub Pages, under "Source", select main and save.
![GitHubSource](https://github.com/leannmlindsey/iVis-MGX/blob/main/images/GitHubPagesSource.png)

Your website will then be active at the url listed under GitHub Pages after you save.  It takes about 10 minutes to load after you click save on GitHub Pages.
![GitHubSource](https://github.com/leannmlindsey/iVis-MGX/blob/main/images/GitHubPagesSite.png)

## Video Instructional 
LINK TO SCREENCAST:
The instructional video link is on the top left corner of the visualization, but it is also here:
https://youtu.be/HRD0133kAhM

## Citations
If you use [iVis-MGX](https://github.com/leannmlindsey/iVis-MGX) in your work, please cite:

Lindsey L, Vasquez L, Truong K, Zhou Y, iVis-Meta, an Interactive Visualization Tool for Metagenomic Data, Spring 2021, https://github.com/leannmlindsey/iVis-MGX

Note: [Humann 3.0](https://huttenhower.sph.harvard.edu/humann) and [Metaphlan 3.0](https://huttenhower.sph.harvard.edu/metaphlan) are software tools developed by the Huttenhower Lab, Dept of Statistics, Harvard School of Public Health.  If you use them in your work, please cite:

Franzosa EA*, McIver LJ*, Rahnavard G, Thompson LR, Schirmer M, Weingart G, Schwarzberg Lipson K, Knight R, Caporaso JG, Segata N, Huttenhower C. Species-level functional profiling of metagenomes and metatranscriptomes. Nat Methods 15: 962-968 (2018).

Francesco Beghini1 ,Lauren J McIver2 ,Aitor Blanco-Mìguez1 ,Leonard Dubois1 ,Francesco Asnicar1 ,Sagun Maharjan2,3 ,Ana Mailyan2,3 ,Andrew Maltez Thomas1 ,Paolo Manghi1 ,Mireia Valles-Colomer1 ,George Weingart2,3 ,Yancong Zhang2,3 ,Moreno Zolfo1 ,Curtis Huttenhower2,3 ,Eric A Franzosa2,3 ,Nicola Segata1,4



