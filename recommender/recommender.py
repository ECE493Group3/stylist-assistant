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

from cloth import Cloth, Outfit, FULLBODY, COMBINATIONS, TOP_CLOTH, BOTTOM_CLOTH, FULLBODY_CLOTH
from cloth_similarity import *
from cloth_hierarchy import *

TSV_FILE_VALIDATION_5050 = 'sample_cloth_s_5050.txt'
TSV_FILE_VALIDATION_9010 = 'sample_cloth_s_9010.txt'

OUTFIT_VALIDATION = "outfit_similarity.txt"

def make_tsvs(table):

	with open(TSV_FILE_VALIDATION, 'w') as f:
		f.writelines(str(img) for img in table)

def recommend_outfits(root, wardrobe_outfit, reference):
	recommend = []
	#possible_out = possible_outfit_from_wardrobe(wardrobe)

	for out in wardrobe_outfit:
		for ref in reference:
			sim = get_outfit_similarity(root, out, ref)
			#print(str(out) + " and " + str(ref) + " similarity: " + str(sim))
			outfit = {"outfit":out, "similarity":sim}
			if outfit not in recommend:
				recommend.append(outfit)

	recommend = sorted(recommend, key=lambda r:r['similarity'], reverse = True)
	#recommend = filter(lambda r:r['similarity'] >= 0.01, recommend)

	return recommend[:10]

def recommend_piece(root, cloth1, wardrobe, reference):

	recommend = []
	cloth1_cat_type = cloth1.get_cat_type()

	if(cloth1_cat_type() == FULLBODY_CLOTH):
		return -1

	if(cloth1.get_cat_type() == TOP_CLOTH):
		for i in wardrobe:
			if(i.get_cat_type() == cloth1.get_cat_type() or i.get_cat_type() == FULLBODY_CLOTH):
				continue
			for ref in reference:
				t = Outfit(cloth1, i, COMBINATIONS)
				sim = get_item_similarity(t, ref)
				outfit = {"outfit":i, "similarity":sim}
				recommend.append(t)

		recommend = sorted(recommend, key=lambda r:r['similarity'], reverse = True)
		recommend = filter(lambda r:r['similarity'] >= 0.5, recommend)

		return recommend

	if(cloth1.get_cat_type() == BOTTOM_CLOTH):
		# Need to find a top
		for i in wardrobe:
			if(i.get_cat_type() == cloth1.get_cat_type or i.get_cat_type() == FULLBODY_CLOTH):
				continue
			for ref in reference:
				t = Outfit(i, cloth1, COMBINATIONS)
				sim = get_item_similarity(t, ref)
				outfit = {"outfit":t, "similarity":sim}
				recommend.append(t)

		recommend = sorted(recommend, key=lambda r:r['similarity'], reverse = True)
		recommend = filter(lambda r:r['similarity'] >= 0.5, recommend)

		return recommend


def possible_outfit_from_wardrobe(wardrobe, possible_out):

	for item_1 in wardrobe:
		if(item_1.get_cat_type() == FULLBODY_CLOTH):
			t = Outfit(item_1)
			if(t not in possible_out):
				possible_out.append(t)
			continue

		for item_2 in wardrobe:
			if(item_1.get_cat_type() == item_2.get_cat_type()):
				continue
			elif(item_2.get_cat_type() == FULLBODY_CLOTH):
				continue
			else:
				if(item_1.get_cat_type() == TOP_CLOTH):
					t = Outfit(item_1, item_2, COMBINATIONS)
					if(t not in possible_out):
						possible_out.append(t)
				if(item_2.get_cat_type() == TOP_CLOTH):
					t = Outfit(item_2, item_1, COMBINATIONS)
					if(t not in possible_out):
						possible_out.append(t)

def make_wardrobe(wardrobe, cloths_list):

	for i in range(0, 500):
		a = random.randint(0, len(cloths_list))
		wardrobe.append(cloths_list[a])

def make_reference(reference, cloths_list, sample_size = 2000):
	for i in range(0, sample_size):
		a = random.randint(0, len(cloths_list)-1)

		cloth_a = cloths_list[a]

		if(cloth_a.get_cat_type() == 3):
			t = Outfit(cloth_a)
			reference.append(t)

		elif(cloth_a.get_cat_type() == 1):
			b = random.randint(0, len(cloth_bottom)-1)
			cloth_b = cloth_bottom[b]

			temp = Outfit(cloth_a, cloth_b, COMBINATIONS)
			reference.append(temp)

		elif(cloth_a.get_cat_type() == 2):
			b = random.randint(0, len(cloth_top)-1)
			cloth_b = cloth_top[b]

			temp = Outfit(cloth_b, cloth_a, COMBINATIONS)
			reference.append(temp)

if __name__=="__main__":

	cloths_list = []

	cloth_fullbody = []
	cloth_top = []
	cloth_bottom = []

	wardrobe = []
	reference = []

	print("Making wardrobe")

	print("Create Nodes")
	root_cloth = create_nodes()

	cat_types = get_category_types()
	attr_types = get_attr_types()
	get_category_attribute_label(cat_types, attr_types, cloths_list, cloth_fullbody, cloth_top, cloth_bottom)

	print("Length: " + str(len(cloths_list)))

	make_wardrobe(wardrobe, cloths_list)
	make_reference(reference, cloths_list)

	wardrobe_outfits = []
	possible_outfit_from_wardrobe(wardrobe, wardrobe_outfits)

	with open(OUTFIT_VALIDATION, 'w') as f:
		f.write("---------- Similarity Ratings ---------- \n\n")
		for out in wardrobe_outfits:
			for ref in reference:
				sim = get_outfit_similarity(root_cloth, out, ref)
				f.write("----------Comparing---------- \n")
				f.write(str(out) + "\n\n" + str(ref) + "\n Similarity: "+str(sim) + "\n ---------- \n\n")

	print("Done")


