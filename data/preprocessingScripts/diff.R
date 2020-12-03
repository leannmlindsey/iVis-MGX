#if (!requireNamespace("BiocManager", quietly = TRUE))
#  install.packages("BiocManager")

#BiocManager::install("edgeR")
#install.packages("plyr", repos="http://cran.case.edu/") 
library("plyr") 
library("edgeR")
#setwd("/uufs/chpc.utah.edu/common/home/u1323098/sundar-group-space/MetagenomicsProcessed/Reads/Monarchs/metagenomics/fastq_trimmed/humann_out1/split") 
setwd("/uufs/chpc.utah.edu/common/home/u1323098/sundar-group-space/MetagenomicsProcessed/Reads/Monarchs/metagenomics/fastq_trimmed/humann_out1/split2/split")


#Set up Data Structure
rawCountTable <-read.delim("combined_genefamilies_stratified.tsv", header = TRUE, sep = "\t", row.names=1)
#mydataM<- as.matrix(rawCountTable)
sampleInfo <- read.delim("sampleInfo.csv", header=TRUE, sep=",", row.names=1)

rawCountTable14 <- rawCountTable[,0:14]
sampleInfo$condition

head(rawCountTable)
nrow(rawCountTable)
ncol(rawCountTable)



dgeFull<-DGEList(counts=rawCountTable14, genes=rownames(rawCountTable), group=sampleInfo$condition)
dgeFull
dgeFull$samples
head(dgeFull$counts) 
head(dgeFull$genes) 

pseudoCounts <- log2(dgeFull$counts+1)
head(pseudoCounts)

hist(pseudoCounts[,"RM.248_S54_L001_R1R2_001_Abundance.RPKs"])
boxplot(pseudoCounts, col="gray", las=3)

par(mfrow=c(1,2))
## WT1 vs WT2
# A values
avalues <- (pseudoCounts[,1] + pseudoCounts[,2])/2
# M values
mvalues <- (pseudoCounts[,1] - pseudoCounts[,2])
plot(avalues, mvalues, xlab="A", ylab="M", pch=19, main="treated")
abline(h=0, col="red")
## Mt1 vs Mt2
# A values
avalues <- (pseudoCounts[,4] + pseudoCounts[,5])/2
# M values
mvalues <- (pseudoCounts[,4] - pseudoCounts[,5])
plot(avalues, mvalues, xlab="A", ylab="M", pch=19, main="control")
abline(h=0, col="red")

plotMDS(pseudoCounts)

sampleDists <- as.matrix(dist(t(pseudoCounts)))
sampleDists

#install.packages("RColorBrewer", repos="http://cran.case.edu/")
library(RColorBrewer)
if (!requireNamespace("BiocManager", quietly = TRUE))
 install.packages("BiocManager")

BiocManager::install("mixOmics")

library(mixOmics)

if (!requireNamespace("BiocManager", quietly = TRUE))
 install.packages("BiocManager")

BiocManager::install("HTSFilter")
library(HTSFilter)

cimColor <- colorRampPalette(rev(brewer.pal(9, "Blues")))(16)
cim(sampleDists, color=cimColor, symkey=FALSE)

#differential expression analysis
dgeFull <- DGEList(dgeFull$counts[apply(dgeFull$counts, 1, sum) != 0, ],
                  group=dgeFull$samples$group)
head(dgeFull$counts)

#estimate the normalization factors
dgeFull <- calcNormFactors(dgeFull, method="TMM")
dgeFull$samples

head(dgeFull$counts)
eff.lib.size <- dgeFull$samples$lib.size*dgeFull$samples$norm.factors
normCounts <- cpm(dgeFull)
pseudoNormCounts <- log2(normCounts + 1)
boxplot(pseudoNormCounts, col="gray", las=3)

plotMDS(pseudoNormCounts)

dgeFull <- estimateCommonDisp(dgeFull)
dgeFull <- estimateTagwiseDisp(dgeFull)
dgeFull

dgeTest <- exactTest(dgeFull)
dgeTest

filtData <- HTSFilter(dgeFull)$filteredData

dgeTestFilt <- exactTest(filtData)
dgeTestFilt

hist(dgeTest$table[,"PValue"], breaks=50)
hist(dgeTestFilt$table[,"PValue"], breaks=50)

resNoFilt <- topTags(dgeTest, n=nrow(dgeTest$table))
head(resNoFilt)

resFilt <- topTags(dgeTestFilt, n=nrow(dgeTest$table))
head(resFilt)

# before independent filtering
sum(resNoFilt$table$FDR < 0.28) # nothing for 0.01 try larger

# after independent filtering
sum(resFilt$table$FDR < 0.01)

sigDownReg <- resNoFilt$table[resNoFilt$table$FDR<0.28,]
sigDownReg <- sigDownReg[order(sigDownReg$logFC),]
head(sigDownReg)

sigUpReg <- sigDownReg[order(sigDownReg$logFC, decreasing=TRUE),]
head(sigUpReg)

write.csv(sigDownReg, file="sigDownReg_Monarch.csv")
write.csv(sigUpReg, file="sigUpReg_Monarch.csv")

plotSmear(dgeTest,
         de.tags = rownames(resNoFilt$table)[which(resNoFilt$table$FDR<0.01)])

volcanoData <- cbind(resNoFilt$table$logFC, -log10(resNoFilt$table$FDR))
colnames(volcanoData) <- c("logFC", "negLogPval")
head(volcanoData)

plot(volcanoData, pch=19)

y <- cpm(dgeFull, log=TRUE, prior.count = 1)
head(y)

selY <- y[rownames(resNoFilt$table)[resNoFilt$table$FDR<0.01 & 
                                   abs(resNoFilt$table$logFC)>1.5],]
head(selY)
cimColor <- colorRampPalette(rev(brewer.pal(9, "Blues")))(255)[255:1]
finalHM <- cim(t(selY), color=cimColor, symkey=FALSE)

plot(finalHM$ddc, leaflab="none")
abline(h=10, lwd=2, col="pink")

geneClust <- cutree(as.hclust(finalHM$ddc), h=10)
head(geneClust)

length(unique(geneClust))

names(which(geneClust==1))
