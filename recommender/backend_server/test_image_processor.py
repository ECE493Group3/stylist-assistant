import os

from image_processor import ImageProcessor, DEFAULT_IMG_ATTR_FILE

TEST_DIR = 'test_images'

def get_list_of_attributes():
	with open(DEFAULT_IMG_ATTR_FILE) as f:
		return set(line.split()[0] for line in f.readlines()[2:])

def test_image_processor():
	ip = ImageProcessor()
	test_img_paths = os.listdir('test_images')

	for i, img in enumerate(os.listdir(TEST_DIR)):
		typ = ip.predict_type(os.path.join(TEST_DIR, img))
		result = "passed" if typ in ('Top', 'Bottom', 'Full-body') else "failed"
		print("Type prediction test %d %s" % ((i+1), result))

	possible_attributes = get_list_of_attributes()
	for i, img in enumerate(os.listdir(TEST_DIR)):
		_, attrs = ip.predict_attributes(os.path.join(TEST_DIR, img))
		result = "passed" if all(a in possible_attributes for a in attrs) else "failed"
		print("Attribute prediction test %d %s" % ((i+1), result))


if __name__ == "__main__":
	print("Make sure the DATA directory is set up and the training data is available before running this test")
	test_image_processor()
