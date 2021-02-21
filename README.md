# iVis-MGX, beta version 

iVis-MGX stands for Interactive Visualization of Metagenomic Data.  It is currently in Beta testing.

iVis-MGX is a tool that transforms the output of the metagenomic processing tools Humann 3.0 and Metaphlan 3.0 into a live website that a researcher can use to visualize and interact with their data.


 
## Examples of Live Sites
https://leannmlindsey.github.io/dataviscourse-pr-Visualization-of-Metagenomic-Data/FinalProject.html



## Installation Instructions
0. Run metaphlan 3.0 and humann 3.0 following the instructions from the Huttenhower website. 

<div class="language-markdown highlighter-rouge"><div class="highlight"><pre class="highlight"><code><span class="gh">[Humann 3.0 Tutorial, Software & Handbook](https://huttenhower.sph.harvard.edu/humann)</span>
<span class="gu"> Metaphlan 3.0 Tutorial, Software & Handbook </span>
</code></pre></div></div>

2. Create a file, samples.txt, which maps your sampleIDs to a sampleName (shorter usually than the sampleID and better for web visualization) and the experimental condition and save in iVis-Meta/data/raw/

<div class="language-markdown highlighter-rouge"><div class="highlight"><pre class="highlight"><code><span class="gh"># This is an &lt;h1&gt; tag</span>
<span class="gu">## This is an &lt;h2&gt; tag</span>
<span class="gu">###### This is an &lt;h6&gt; tag</span>
</code></pre></div></div>

4. Clone the github repository into your personal github account and then clone repository onto your local computer 

<div class="language-markdown highlighter-rouge"><div class="highlight"><pre class="highlight"><code><span class="gh"># This is an &lt;h1&gt; tag</span>
<span class="gu">## This is an &lt;h2&gt; tag</span>
<span class="gu">###### This is an &lt;h6&gt; tag</span>
</code></pre></div></div>

6. Copy the following output files from Humann 3.0 and Metaphlan 3.0 into iVis-Meta/data/raw/
* samples.txt (file created in step 1 that maps sampleIDs to experimental condition)
* combined_genefamilies.tsv (humann 3.0 output)
* combined_genepathways.tsv (humann 3.0 output)
* merged_abundance.txt (metaphlan 3.0 output)

<div class="language-markdown highlighter-rouge"><div class="highlight"><pre class="highlight"><code><span class="gh"># This is an &lt;h1&gt; tag</span>
<span class="gu">## This is an &lt;h2&gt; tag</span>
<span class="gu">###### This is an &lt;h6&gt; tag</span>
</code></pre></div></div>

4. Run the python program to format the data properly for visualization.  This can be done on the command line, or in a jupyter notebook.

<div class="language-markdown highlighter-rouge"><div class="highlight"><pre class="highlight"><code><span class="gh"># This is an &lt;h1&gt; tag</span>
<span class="gu">## This is an &lt;h2&gt; tag</span>
<span class="gu">###### This is an &lt;h6&gt; tag</span>
</code></pre></div></div>

6. Optional, reduce the size of the gene_pathways.tsv file by choosing differntialy expressed genes and save as gene_pathways_heatmap.tsv

<div class="language-markdown highlighter-rouge"><div class="highlight"><pre class="highlight"><code><span class="gh"># This is an &lt;h1&gt; tag</span>
<span class="gu">## This is an &lt;h2&gt; tag</span>
<span class="gu">###### This is an &lt;h6&gt; tag</span>
</code></pre></div></div>

8. Push local changes to github repository

<div class="language-markdown highlighter-rouge"><div class="highlight"><pre class="highlight"><code><span class="gh"># This is an &lt;h1&gt; tag</span>
<span class="gu">## This is an &lt;h2&gt; tag</span>
<span class="gu">###### This is an &lt;h6&gt; tag</span>
</code></pre></div></div>

10. Run the visualization locally by going to the command line, cd into the repository folder and typing php -S localhost:8080

<div class="language-markdown highlighter-rouge"><div class="highlight"><pre class="highlight"><code><span class="gh"># This is an &lt;h1&gt; tag</span>
<span class="gu">## This is an &lt;h2&gt; tag</span>
<span class="gu">###### This is an &lt;h6&gt; tag</span>
</code></pre></div></div>


Your visualization will then be active on your local machine by going to a browser and typing 
localhost:8080/iVis-MGX.html

Note:  on mac computers php is already installed.  If running on a computer without php, you will have to install php.

or

8. Create a live public website by setting up GitHub Pages

Go to your github repository and click on Settings (the wheel icon on the right hand side).  Scroll down to GitHub Pages and select main and save.

Your website will then be active at the url listed under GitHub Pages.  It takes about 10 minutes to load after you click save on GitHub Pages.

## Video Instructional 
LINK TO SCREENCAST:
The instructional video link is on the top left corner of the visualization, but it is also here:
https://youtu.be/HRD0133kAhM

## Citations
If you use [iVis-MGX](https://github.com/leannmlindsey/iVis-MGX) for any proposals or publications, please cite:

Lindsey L, Vasquez L, Truong K, Zhou Y, iVis-Meta, an Interactive Visualization Tool for Metagenomic Data, Spring 2021, https://github.com/leannmlindsey/iVis-MGX

Note: [Humann 3.0](https://huttenhower.sph.harvard.edu/humann) and [Metaphlan 3.0](https://huttenhower.sph.harvard.edu/metaphlan) are software tools developed by the Huttenhower Lab, Dept of Statistics, Harvard School of Public Health.  

Franzosa EA*, McIver LJ*, Rahnavard G, Thompson LR, Schirmer M, Weingart G, Schwarzberg Lipson K, Knight R, Caporaso JG, Segata N, Huttenhower C. Species-level functional profiling of metagenomes and metatranscriptomes. Nat Methods 15: 962-968 (2018).

Francesco Beghini1 ,Lauren J McIver2 ,Aitor Blanco-Mìguez1 ,Leonard Dubois1 ,Francesco Asnicar1 ,Sagun Maharjan2,3 ,Ana Mailyan2,3 ,Andrew Maltez Thomas1 ,Paolo Manghi1 ,Mireia Valles-Colomer1 ,George Weingart2,3 ,Yancong Zhang2,3 ,Moreno Zolfo1 ,Curtis Huttenhower2,3 ,Eric A Franzosa2,3 ,Nicola Segata1,4



