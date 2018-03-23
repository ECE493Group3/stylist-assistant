#! /usr/bin/env python

# This script assumes the Category and Attribute Prediction benchmark
# is in the working directory, in a subdirectory called 'DATA', and
# completely uncompressed

# This generates a test sample of the data for the Top/Bottom/Full-body task,
# as a tsv file

import collections
import os
import sys
import random

import anytree
from anytree import Node, RenderTree, Walker

from cloth import Cloth
from calculate_similarity import *
from cloth_hierarchy import *
from connect_db import *

TSV_FILE_VALIDATION = 'sample_cloth_s.txt'

def make_tsvs(table):

	with open(TSV_FILE_VALIDATION, 'w') as f:
		f.writelines(str(img) for img in table)


if __name__=="__main__":

	if not len(sys.argv) == 2:
		print("Pass in the sample size")
		exit(1)

	cloths_list = []

	print("Making tsv")
	sample_size = int(sys.argv[1])

	print("Create Nodes")
	root_cloth = create_nodes()

	cat_types = get_category_types()
	attr_types = get_attr_types()
	get_category_attribute_label(cat_types, attr_types, cloths_list)

	make_tsvs(cloths_list)

	with open(TSV_FILE_VALIDATION, 'w') as f:
		for j in range(0, sample_size):
			a = random.randint(0, len(cloths_list))
			
			cloth_a = cloths_list[a]
			
			for i in range(0, len(cloths_list)):

				cloth_b = cloths_list[i]
				sim = get_item_similarity(root_cloth, cloth_a, cloth_b)

				if(sim >= 0.5):
					f.write("Comparing: " + str(cloth_a) + " " + str(cloth_b) + "\n Similarity: " + str(sim) + '\n')

	print("Done")


