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

def recommend_outfit(root, wardrobe, reference):
	recommend = {}
	possible_out = possible_outfit_from_wardrobe(wardrobe)

	with open(TSV_FILE_VALIDATION, 'w') as f:
		for poss in possible_out:
			for ref in reference:
				sim = get_outfit_similarity(root, poss, ref)


def possible_outfit_from_wardrobe(wardrobe):

	possible_out = []

	for item_1 in wardrobe:
		if(item_1.get_cat_type() == 3):
			if([item_1] not in possible_out):
				possible_out.append([item_1])
			continue

		for item_2 in wardrobe:
			if(item_1.get_cat_type == item_2.get_cat_type):
				continue
			else:
				if(item_1.get_cat_type == 1):
					if([item_1, item_2] not in possible_out):
						possible_out.append([item_1, item_2])
				if(item_2.get_cat_type == 1):
					if([item_2, item_1] not in possible_out):
						possible_out.append([item_2, item_1])

	return possible_out


def recommend_piece(root, cloth1, wardrobe, reference):

	recommend = {}
	cloth1_cat_type = cloth1.get_cat_type()

	if(cloth1_cat_type == 3):
		return -1

	if(cloth1.get_cat_type == 1):
		for i in wardrobe:
			if(i.get_cat_type == cloth1.get_cat_type or cloth1.get_cat_type == 3):
				continue
			for ref in reference:
				sim = get_item_similarity([cloth1, i], ref)


		return recommend

	if(cloth1.get_cat_type == 2):
		# Need to find a top
		for i in wardrobe:
			if(i.get_cat_type == cloth1.get_cat_type or cloth1.get_cat_type == 3):
				continue
			for ref in reference:
				sim = get_item_similarity([i, cloth1], ref)

		return recommend

def test_similarity(sample_size):

	with open(TSV_FILE_VALIDATION, 'w') as f:
		for j in range(0, sample_size):
			a = random.randint(0, len(cloths_list))
			
			cloth_a = cloths_list[a]
			
			for i in range(0, len(cloths_list)):

				cloth_b = cloths_list[i]
				sim = get_item_similarity(root_cloth, cloth_a, cloth_b)

				if(sim >= 0.5):
					f.write("Comparing: " + str(cloth_a) + " " + str(cloth_b) + "\n Similarity: " + str(sim) + '\n')

def test_outfit_similarity(sample_size, cloths_list, root):
	wardrobe = []
	make_wardrobe(sample_size, wardrobe, cloths_list)

	outfits = possible_outfit_from_wardrobe(wardrobe)

	with open(TSV_FILE_VALIDATION, 'w') as f:
		a = random.randint(0, len(outfits))

		outfit_a = outfits[a]

		for i in range(0, len(outfits)):
			outfit_b = outfits[i]

			sim = get_outfit_similarity(root, outfit_a, outfit_b)
			f.write("Comparing: " + str(outfit_a) + " " + str(outfit_b) + "\n Similarity: " + str(sim) + "\n\n")


def make_wardrobe(wardrobe_size, wardrobe, cloths_list):

	for i in range(0, wardrobe_size):
		a = random.randint(0, len(cloths_list))
		wardrobe.append(cloths_list[a])

def make_reference(reference, cloths_list, sample_size = 50):
	for i in range(0, sample_size):
		a = random.randint(0, len(cloths_list))

		cloth_a = cloths_list[a]

		if(cloth_a.get_cat_type == 3):
			reference.append([cloth_a])

		elif(cloth_a.get_cat_type == 1):
			b = random.random(int)
			cloth_b = cloths_list[b]
			while(cloth_b.get_cat_type != 2):
				b = random.random(int)
				cloth_b = cloths_list[b]

			reference.append([cloth_a, cloth_b])

		elif(cloth_a.get_cat_type == 2):
			b = random.random(int)
			cloth_b = cloths_list[b]
			while(cloth_b.get_cat_type != 1):
				b = random.random(int)
				cloth_b = cloths_list[b]

			reference.append([cloth_b, cloth_a])

	return reference

if __name__=="__main__":

	if not len(sys.argv) == 2:
		print("Pass in a size")
		exit(1)

	cloths_list = []
	wardrobe = []
	reference = []

	print("Making wardrobe")
	sample_size = int(sys.argv[1])

	print("Create Nodes")
	root_cloth = create_nodes()

	cat_types = get_category_types()
	attr_types = get_attr_types()
	get_category_attribute_label(cat_types, attr_types, cloths_list)

	# make_tsvs(cloths_list)
	make_wardrobe(sample_size, wardrobe, cloths_list)
	make_reference(reference, cloths_list)
	test_outfit_similarity(sample_size, cloths_list, root_cloth)


	# recommend_outfit(root_cloth, wardrobe, reference)



	print("Done")


