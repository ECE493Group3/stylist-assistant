class Cloth:

	def __init__(self, img_file, cat_type, cat_label, attr_label={}):
		self.img_file = img_file
		self.cat_type = cat_type
		self.cat_label = cat_label
		# self.attr_v = attr_v
		self.attr_label = attr_label

	def get_cat_type(self):
		return self.cat_type

	def get_cat_label(self):
		return self.cat_label

	def get_attr_label(self):
		return self.attr_label

	def get_img_file(self):
		return self.img_file

	def __str__(self):
		img_file_s = "img_file: " + str(self.img_file) + "\n"
		cat_type_s = "cat_type: " + str(self.cat_type) + "\n"
		cat_label_s = "cat_label: " + str(self.cat_label) + "\n"
		attr_label_s = "attr_label: " + str(self.attr_label) + "\n"
		# attr_v_s = "attr_v: " + str(self.attr_v) + "\n"

		return img_file_s + cat_type_s + cat_label_s + attr_label_s
