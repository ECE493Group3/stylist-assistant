#! /usr/bin/env python

# This script assumes the Category and Attribute Prediction benchmark
# is in the working directory, in a subdirectory called 'DATA', and
# completely uncompressed

# This generates a test sample of the data for the Top/Bottom/Full-body task,
# as a tsv file

import os
import sys
import random

DATA_DIRECTORY = 'image-processing/DATA'

LIST_CATEGORY_IMG_FILE = os.path.join(DATA_DIRECTORY, 'Anno', 'list_category_img.txt')
LIST_CATEGORY_CLOTH_FILE = os.path.join(DATA_DIRECTORY, 'Anno', 'list_category_cloth.txt')

LIST_ATTR_IMG_FILE = os.path.join(DATA_DIRECTORY, 'Anno', 'list_attr_img.txt')
LIST_ATTR_CLOTH_FILE = os.path.join(DATA_DIRECTORY, 'Anno', 'list_attr_cloth.txt')

TSV_FILE_TRAIN = 'sample_category_img_train.txt'
TSV_FILE_VALIDATION = 'sample_category_img_validation.txt'

class Cloth:

	def __init__(self, img_file, cat_type):
		self.img_file = img_file
		self.cat_type = cat_type
		self.attr_v = []
		self.attr_label = {}

	def get_cat_type(self):
		return self.cat_type

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
				temp = {i+1:attr_type[int(i+1)]}
				self.attr_label.update(temp)

	def __str__(self):
		img_file_s = "img_file: " + str(self.img_file) + "\n"
		cat_type_s = "cat_type: " + str(self.cat_type) + "\n"
		attr_label_s = "attr_label: " + str(self.attr_label) + "\n"
		attr_v_s = "attr_v: " + str(self.attr_v) + "\n"

		return img_file_s + cat_type_s + attr_label_s + attr_v_s

def get_category_types():

	cat_type = {}

	with open(LIST_CATEGORY_CLOTH_FILE) as f:
		for i, line in enumerate(f.readlines()[2:]):
			_, typ = line.split()
			cat_type[i + 1] = int(typ)

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

# def get_category(category_type):
#   with open(LIST_CATEGORY_IMG_FILE) as f:
#       lines = f.readlines()
#       for i, line in enumerate(lines[2:]):
#           imgfile, cat = line.split()
#           temp = Cloth(imgfile, category_type[int(cat)])
#           # temp.set_img_file(imgfile)
#           # temp.set_cat_type(category_type[int(cat)])
#           cloths_list.append(temp)

# def get_attrbute_label(attr_type):
#   with open(LIST_ATTR_IMG_FILE) as f:
#       lines = f.readlines()

#       for i, line in enumerate(lines[2:]):
#           break_index = line.find(' ')
#           imgfile = line[:break_index+1]

#           attr_v_s = line[break_index:]
#           attr_v_s = attr_v_s.replace('0', '0.5')
#           attr_v_s = attr_v_s.replace('-1', '0')

#           attr_v = attr_v_s.strip().split()
#           cloths_list[i].set_attr_v(attr_v, attr_type)

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

				temp = Cloth(cat_imgfile, category_type[int(cat)])
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

	cat_types = get_category_types()
	attr_types = get_attr_types()
	get_category_attribute_label(cat_types, attr_types)
	
	a = random.randint(0, len(cloths_list))
	cloth_a = cloths_list[a]

	with open(TSV_FILE_VALIDATION, 'w') as f:
		for i in range(0, len(cloths_list)):
			
			cloth_b = cloths_list[i]
			sim = get_item_similarity(cloth_a, cloth_b)
			f.write("Comparing: " + cloth_a.get_img_file() + ", " + cloth_b.get_img_file() + "\n Similarity: " + str(sim) + '\n')

	print("Done")


