import os
import sys

import tensorflow as tf

import cnn_vgg16

DEFAULT_IMG_CATEGORIES_FILE = os.path.join('DATA', 'Anno', 'list_category_cloth.txt')
DEFAULT_CATEGORY_MODEL_DIR = "category_convnet_model"
DEFAULT_ATTRIBUTE_MODEL_DIR = "attribute_tagging_convnet_model"

class ImageProcessor(object):

    def __init__(self, category_model_dir=DEFAULT_CATEGORY_MODEL_DIR):

        if not os.path.exists(category_model_dir):
            error_msg = "Category model directory ({}) does not exist"
            raise ValueError(error_msg.format(category_model_dir))

        self.category_classifier = tf.estimator.Estimator(
                                   model_fn=cnn_vgg16.category_classifier_model,
                                   model_dir=category_model_dir)

    @staticmethod
    def get_category_names(categories_file=DEFAULT_IMG_CATEGORIES_FILE):
        lines = []
        with open(categories_file) as f:
            lines = f.readlines()

        return [line.split()[0] for line in lines[2:]]

    def _build_neural_net_input(self, img_filename):
        dataset = tf.data.Dataset.from_tensor_slices([img_filename])
        return dataset.map(cnn_vgg16.pre_process_image_filename)

    def predict(self, img_filename):
        input_fn = lambda: self._build_neural_net_input(img_filename)
        category_spec = self.category_classifier.predict(input_fn=input_fn)
        predictions = [p for p in category_spec]
        predicted_class = predictions[0].get("classes", None)
        return predicted_class, None


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Pass in the image filepath")
        exit(1)

    img_path = sys.argv[1]
    category_names = ImageProcessor.get_category_names()
    image_processor = ImageProcessor()
    category, attributes = image_processor.predict(img_path)

    output_msg = "The predicted category for image " \
                 "{} is {} ({})".format(img_path, category, category_names[category])

    print(output_msg)
