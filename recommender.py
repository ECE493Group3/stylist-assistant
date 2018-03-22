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
from anytree import Node, RenderTree


# import pymongo
# from pymongo import MongoClient

DATA_DIRECTORY = 'image-processing/DATA'

LIST_CATEGORY_IMG_FILE = os.path.join(DATA_DIRECTORY, 'Anno', 'list_category_img.txt')
LIST_CATEGORY_CLOTH_FILE = os.path.join(DATA_DIRECTORY, 'Anno', 'list_category_cloth.txt')

LIST_ATTR_IMG_FILE = os.path.join(DATA_DIRECTORY, 'Anno', 'list_attr_img.txt')
LIST_ATTR_CLOTH_FILE = os.path.join(DATA_DIRECTORY, 'Anno', 'list_attr_cloth.txt')

TSV_FILE_VALIDATION = 'sample_cloth_sim.txt'

class Cloth:

	def __init__(self, img_file, cat_type, cat_label, attr_v = [], attr_label={}):
		self.img_file = img_file
		self.cat_type = cat_type
		self.cat_label = cat_label
		self.attr_v = attr_v
		self.attr_label = attr_label

	def get_cat_type(self):
		return self.cat_type

	def get_cat_label(self):
		return self.cat_label

	def get_attr_label(self):
		return self.attr_label

	def get_attr_v(self):
		return self.attr_v

	def get_img_file(self):
		return self.img_file

	def set_attr_v(self, attr_v, attr_type):
		self.attr_v = attr_v
		self.attr_label = {}

		for i, attr in enumerate(self.attr_v):
			if(attr == "1"):                
				temp = {str(i+1):attr_type[int(i+1)]}
				self.attr_label.update(temp)

	def __str__(self):
		img_file_s = "img_file: " + str(self.img_file) + "\n"
		cat_type_s = "cat_type: " + str(self.cat_type) + "\n"
		cat_label_s = "cat_label: " + str(self.cat_label) + "\n"
		attr_label_s = "attr_label: " + str(self.attr_label) + "\n"
		# attr_v_s = "attr_v: " + str(self.attr_v) + "\n"

		return img_file_s + cat_type_s + cat_label_s + attr_label_s

def create_nodes():

	# Root Node
	root_cloth = Node("Cloth")
	cloth_dict = {
		"Cloth": ["Tops", "Bottoms", "Fullbody"],
		"Tops": ["Sweater", "Jacket", "Tee"],
		"Bottoms": ["Pants", "Sweatpants", "Shorts", "Skirt"],
		"Fullbody": ["Coat", "Onesie", "Dress"],
		"Sweater":["Blazer", "Bomber", "Cardigan", "Hoodie", "Turtleneck", "Flannel"],
		"Jacket": ["Parka", "Peacoat", "Poncho", "Anorak"],
		"Tee": ["Top", "Blouse", "Jersey", "Button-Down", "Tank", "Henley", "Halter"],
		"Pants": ["Jeans", "Chinos", "Joggers"],
		"Sweatpants": ["Leggings", "Culottes", "Jodhpurs", "Capris", "Jeggins"],
		"Shorts": ["Cutoffs", "Trunks", "Sweatshorts"],
		"Skirt": ["Cauchos", "Sarong"],
		"Coat": ["Robe", "Cape"],
		"Onesie": ["Jumpsuit", "Romper"],
		"Dress": ["Coverup", "Caftan", "Kimono", "Kaftan", "Nightdress", "Shirtdress", "Sundress"],
	}

	insert_order = ["Cloth", "Tops", "Bottoms", "Fullbody", "Sweater", "Jacket", "Tee", "Pants", "Sweatpants", "Shorts", "Skirt", "Coat", "Onesie", "Dress"]

	for parent in insert_order:
		parent_node = anytree.find(root_cloth, lambda node: node.name == parent)

		for node in cloth_dict[parent]:
			x =Node(node, parent = parent_node)

	# for pre, fill, node in RenderTree(root_cloth):
	# 	print("%s%s" % (pre, node.name))
	return root_cloth

def get_category_types():

	cat_type = {}

	with open(LIST_CATEGORY_CLOTH_FILE) as f:
		for i, line in enumerate(f.readlines()[2:]):
			label, typ = line.split()
			cat_type[i + 1] = [int(typ), label]

	return cat_type

def get_attr_types():
	attr_type = {}

	with open(LIST_ATTR_CLOTH_FILE) as f:
		for i, line in enumerate(f.readlines()[2:]):
			break_index = line.rfind(' ')
			line = line.strip()
			typ = line[-1:]
			
			attr_type[i + 1] = int(typ)

	return attr_type

def get_category_attribute_label(category_type, attr_type):
	with open(LIST_CATEGORY_IMG_FILE) as cat_f, open(LIST_ATTR_IMG_FILE) as attr_f:
		cat_lines = cat_f.readlines()
		attr_lines = attr_f.readlines()
		for cat, attr in zip(cat_lines[2:], attr_lines[2:]):
			cat_imgfile, cat = cat.split()
			
			break_index = attr.find(' ')
			attr_imgfile = attr[:break_index+1].strip()
			if(cat_imgfile == attr_imgfile):
				attr_v_s = attr[break_index:]
				attr_v_s = attr_v_s.replace('0', '0.5')
				attr_v_s = attr_v_s.replace('-1', '0')
				attr_v = attr_v_s.split()



				temp = Cloth(cat_imgfile, category_type[int(cat)][0], category_type[int(cat)][1])
				temp.set_attr_v(attr_v, attr_type)
				cloths_list.append(temp)


def make_tsvs(table):

	with open(TSV_FILE_VALIDATION, 'w') as f:
		f.writelines(str(img) for img in table)

def get_type_similarity(cloth1, cloth2):
	if(cloth1.cat_type == cloth2.cat_type):
		return 1
	elif(cloth1.cat_type != cloth2.cat_type):
		return 0
	# elif if cloth1 is an ancestor of cloth2:
	#   return 0.5

def get_attribute_similarity(attr, cloth1, cloth2):
	if(attr in cloth1.values() and attr in cloth2.values()):
		return 1
	else:
		return 0

def get_item_similarity(cloth1, cloth2):
	sum = get_type_similarity(cloth1, cloth2)

	set_c1 = set(cloth1.attr_label)
	set_c2 = set(cloth2.attr_label)
	set_c = set_c1 & set_c2

	for i in set_c:
		if(cloth1.attr_label[i] == cloth2.attr_label[i]):
			sum += 1

	union_c = set_c1 | set_c2

	return sum / (1 + len(union_c))

if __name__=="__main__":

	if not len(sys.argv) == 2:
		print("Pass in the sample size")
		exit(1)

	cloths_list = []

	print("Making tsv")
	sample_size = int(sys.argv[1])

	print("Create Nodes")
	root_cloth = create_nodes()

	# db_host = '127.0.0.1'
	# db_port = 27017
	# print("Connecting to DB" + db_host + " " + str(db_port))

	# # Connect to Mongodb
	# client = MongoClient(db_host, db_port)
	
	# # Getting DB
	# db = client['stylist_db']
	
	# # Getting Collection
	# collection = db['stylist']
	# cloths_length = collection.count()

	# print("Number of items in db: " + str(cloths_length))

	cat_types = get_category_types()
	attr_types = get_attr_types()
	get_category_attribute_label(cat_types, attr_types)

	# if(cloths_length == 0):
	# 	cat_types = get_category_types()
	# 	attr_types = get_attr_types()
	# 	get_category_attribute_label(cat_types, attr_types)

	# 	for i, cloth in enumerate(cloths_list):
	# 		input_cloth = {
	# 			"_id": str(i),
	# 			"img_file": cloth.get_img_file(),
	# 			"cat_type": cloth.get_cat_type(),
	# 			# "attr_v": cloth.get_attr_v(),
	# 			"attr_label": cloth.get_attr_label(),
	# 		}
	# 		collection.insert_one(input_cloth)

	# 	print("Finish uploading to DB")
	with open(TSV_FILE_VALIDATION, 'w') as f:
		f.writelines(str(cloth) for cloth in cloths_list)

	exit(1)

	with open(TSV_FILE_VALIDATION, 'w') as f:
		for j in range(0, sample_size):
			a = random.randint(0, len(cloths_list))
			# doc = collection.find_one({"_id": str(a)})
			# cloth_a = Cloth(doc['img_file'], doc['cat_type'], doc['attr_v'], doc['attr_label'])
		
			cloth_a = cloths_list[a]
			
			for i in range(0, len(cloths_list)):
				# doc_b = collection.find_one({"_id":str(i)})
				# cloth_b = Cloth(doc_b['img_file'], doc_b['cat_type'], doc_b['attr_v'], doc_b['attr_label'])
				cloth_b = cloths_list[i]
				sim = get_item_similarity(cloth_a, cloth_b)

				f.write("Comparing: " + str(cloth_a) + " " + str(cloth_b) + "\n Similarity: " + str(sim) + '\n')

	print("Done")


