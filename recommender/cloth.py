import os


FULLBODY = 0
COMBINATIONS = 1

TOP_CLOTH = "1"
BOTTOM_CLOTH = "2"
FULLBODY_CLOTH = "3"

DATA_DIRECTORY = 'image-processing/DATA'

LIST_CATEGORY_CLOTH_FILE = os.path.join(DATA_DIRECTORY, 'Anno', 'list_category_cloth.txt')


class Cloth:

	def __init__(self, img_file, cat_type, cat_label, attr_label={}, img_id = ""):
		self.img_file = img_file
		if cat_type == "":
			cat_type = self.get_category_type(cat_label)
		self.cat_type = str(cat_type)

		self.cat_label = cat_label
		self.attr_label = attr_label
		self.img_id = img_id

	def get_cat_type(self):
		return self.cat_type

	def get_cat_label(self):
		return self.cat_label

	def get_attr_label(self):
		return self.attr_label

	def get_img_file(self):
		return self.img_file

	def get_img_id(self):
		return self.img_id

	def set_cat_label(cat_label):
		self.cat_label = cat_label

	def set_attr_label(attr_label):
		self.attr_label = attr_label

	def get_category_type(self, cat_label):

		with open(LIST_CATEGORY_CLOTH_FILE) as f:
			for i, line in enumerate(f.readlines()[2:]):
				label, typ = line.split()
				if label == cat_label:
					return typ

		return cat_type


	def __str__(self):
		img_file_s = "img_file: " + str(self.img_file) + "\n"
		cat_type_s = "cat_type: " + str(self.cat_type) + "\n"
		cat_label_s = "cat_label: " + str(self.cat_label) + "\n"
		attr_label_s = "attr_label: " + str(self.attr_label) + "\n"
		# attr_v_s = "attr_v: " + str(self.attr_v) + "\n"

		return img_file_s + cat_type_s + cat_label_s + attr_label_s

class Outfit:

	def __init__(self, cloth_a, cloth_b = "", type = FULLBODY):
		if(type == FULLBODY):
			self.fullbody = cloth_a
			self.top = ""
			self.bottom = ""
			self.type = FULLBODY
		elif(type == COMBINATIONS):
			self.top = cloth_a
			self.bottom = cloth_b
			self.fullbody = ""
			self.type = COMBINATIONS

	def __str__(self):
		if(self.type == FULLBODY):
			type_s = "Type: FULLBODY \n"
			fullbody_s = "Fullbody:" + str(self.fullbody) + "\n"
			return type_s + fullbody_s
		elif(self.type == COMBINATIONS):
			type_s = "Type: COMBINATIONS \n"
			top_s = "Tops: " + str(self.top) + "\n"
			bottom_s = "Bottoms: " + str(self.bottom) + "\n"
			return type_s + top_s + bottom_s

	def __eq__(self, other):
		if(self.get_type() != other.get_type()):
			return False

		cloth_self = self.get_cloths()
		cloth_other = other.get_cloths()

		return all(cs.get_img_id() == co.get_img_id() for cs, co in zip(cloth_self, cloth_other))

	def get_type(self):
		return self.type

	def get_full_body(self):
		return self.fullbody

	def get_top(self):
		return self.top

	def get_bottom(self):
		return self.bottom

	def get_cloths(self):
		if(self.type == FULLBODY):
			return [self.fullbody]
		if(self.type == COMBINATIONS):
			return [self.top, self.bottom]










