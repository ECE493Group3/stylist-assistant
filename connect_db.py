import pymongo
from pymongo import MongoClient

import os

from cloth import Cloth

db_host = "localhost"
db_port = 12707

DATA_DIRECTORY = 'image-processing/DATA'

LIST_CATEGORY_IMG_FILE = os.path.join(DATA_DIRECTORY, 'Anno', 'list_category_img.txt')
LIST_CATEGORY_CLOTH_FILE = os.path.join(DATA_DIRECTORY, 'Anno', 'list_category_cloth.txt')

LIST_ATTR_IMG_FILE = os.path.join(DATA_DIRECTORY, 'Anno', 'list_attr_img.txt')
LIST_ATTR_CLOTH_FILE = os.path.join(DATA_DIRECTORY, 'Anno', 'list_attr_cloth.txt')


def write_to_db(input_list):

	# Connect to Mongodb
	client = MongoClient(db_host, db_port)
	
	# Getting DB
	db = client['stylist_db']
	
	# Getting Collection
	collection = db['stylist']
	cloths_length = collection.count()

	if(input_list != 0):
		for i, cloth in enumerate(input_list):
			input_cloth = {
				"_id": str(i),
				"img_file": cloth.get_img_file(),
				"cat_type": cloth.get_cat_type(),
				"cat_label": cloth.get_cat_label(),
				"attr_label": cloth.get_attr_label(),
			}
			collection.insert_one(input_cloth)

	print("Finish uploading to DB")

def fetch_cloth(img_file):

	# Connect to Mongodb
	client = MongoClient(db_host, db_port)
	
	# Getting DB
	db = client['stylist_db']
	
	# Getting Collection
	collection = db['stylist']

	doc = collection.find_one({"img_file":"img_file"})

	cloth = Cloth(doc['img_file'], doc['cat_type'], doc['cat_label'], doc['attr_label'])

	return cloth

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
			# break_index = line.rfind(' ')
			line = line.strip()
			typ = line[-1:]
			
			attr_type[i + 1] = int(typ)

	return attr_type

def get_attr_labels(attr_v, attr_type):
	attr_label = {}

	for i, attr in enumerate(attr_v):
		if(attr == "1"):                
			temp = {str(i+1):attr_type[int(i+1)]}
			attr_label.update(temp)

	return attr_label

def get_category_attribute_label(category_type, attr_type, cloths_list):
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

				attr_label = get_attr_labels(attr_v, attr_type)
				temp = Cloth(cat_imgfile, category_type[int(cat)][0], category_type[int(cat)][1], attr_label)
				# temp.set_attr_v(attr_v, attr_type)
				cloths_list.append(temp)


