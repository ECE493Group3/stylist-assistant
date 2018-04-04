import os
import sys

import tensorflow as tf

import cnn_vgg16
import nn_config

IMAGE_PROCESSING_DIR = 'image-processing'
DEFAULT_IMG_CATEGORIES_FILE = os.path.join(IMAGE_PROCESSING_DIR, 'DATA', \
                                           'Anno', 'list_category_cloth.txt')
DEFAULT_IMG_ATTR_FILE = os.path.join(IMAGE_PROCESSING_DIR, 'DATA', \
                                     'Anno', 'list_attr_cloth.txt')
DEFAULT_CATEGORY_MODEL_DIR = os.path.join(IMAGE_PROCESSING_DIR, 'category_convnet_model')
DEFAULT_ATTRIBUTE_MODEL_DIR = os.path.join(IMAGE_PROCESSING_DIR, 'attribute_tagging_convnet_model')
DEFAULT_THRESHOLD = 0.7

class ImageProcessor(object):

    def __init__(self,
                 category_model_dir=DEFAULT_CATEGORY_MODEL_DIR,
                 attribute_model_dir=DEFAULT_ATTRIBUTE_MODEL_DIR,
                 attribute_threshold=DEFAULT_THRESHOLD,
                 category_name_file=DEFAULT_IMG_CATEGORIES_FILE,
                 attribute_name_file=DEFAULT_IMG_ATTR_FILE):

        if not os.path.exists(category_model_dir):
            error_msg = "Category model directory ({}) does not exist"
            raise ValueError(error_msg.format(category_model_dir))

        self.category_classifier = tf.estimator.Estimator(
                                   model_fn=cnn_vgg16.category_classifier_model,
                                   model_dir=category_model_dir)

        self.attribute_classifier = tf.estimator.Estimator(
                                    model_fn=cnn_vgg16.attribute_tagging_model,
                                    model_dir=attribute_model_dir)

        self.attribute_threshold = attribute_threshold

        self.category_name = [name for name, number in nn_config.SELECTED_CATEGORIES]
        self.attribute_name = ImageProcessor._get_names(attribute_name_file)

    @staticmethod
    def _get_names(filename):
        if not os.path.exists(filename):
            raise RuntimeError("Name file ({}) does not exist".format(filename))

        lines = []
        with open(filename) as f:
            lines = f.readlines()

        def _get_name_from_line(line):
            words = line.split()
            all_but_last = words[:-1]
            return " ".join(all_but_last)

        return [_get_name_from_line(line) for line in lines[2:]]

    @staticmethod
    def _build_neural_net_input(img_filename):
        dataset = tf.data.Dataset.from_tensor_slices([img_filename])
        return dataset.map(cnn_vgg16.pre_process_image_filename)

    def predict_category(self, img_filename):
        input_fn = lambda: ImageProcessor._build_neural_net_input(img_filename)
        category_spec = self.category_classifier.predict(input_fn=input_fn)
        predictions = [p for p in category_spec]
        img_class = None
        try:
            img_class = predictions[0]["classes"]
        except KeyError:
            raise RuntimeError("Prediction dictionary is malformed: " + str(predictions[0]))

        img_class = int(img_class)
        if img_class not in range(len(self.category_name)):
            raise RuntimeError("Predicted an invalid class: {}".format(img_class))

        return img_class, self.category_name[img_class]

    def predict_attributes(self, img_filename):
        input_fn = lambda: ImageProcessor._build_neural_net_input(img_filename)
        attribute_spec = self.attribute_classifier.predict(input_fn=input_fn)
        attribute_spec_results = [p for p in attribute_spec]
        attribute_probabilities = attribute_spec_results[0].get("probabilities", [])

        attributes = [i for i, p in enumerate(attribute_probabilities)
                      if p >= self.attribute_threshold]

        attribute_names = [self.attribute_name[a] for a in attributes]

        return attributes, attribute_names

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Pass in the image filepath")
        exit(1)

    if len(sys.argv) > 2:
        image_processor = ImageProcessor(attribute_threshold=float(sys.argv[2]))
    else:
        image_processor = ImageProcessor()

    img_path = sys.argv[1]
    category, category_name = image_processor.predict_category(img_path)

    output_msg = "The predicted category for image " \
                 "{} is {} ({})".format(img_path, category, category_name)
    print(output_msg)

    attributes, names = image_processor.predict_attributes(img_path)
    output_msg = "The predicted attributes are " \
                 "{} ({})".format(attributes, names)
    print(output_msg)

