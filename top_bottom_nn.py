import os
import sys
import cv2
import cnn_vgg16

import numpy as np
import tensorflow as tf

tf.logging.set_verbosity(tf.logging.INFO)

DATA_DIRECTORY = os.path.join('DATA', 'Img')
SIZE = 224
SAMPLE_CATEGORY_IMG_FILE_TRAIN = "sample_category_img_train.txt"
SAMPLE_CATEGORY_IMG_FILE_VALIDATION = "sample_category_img_validation.txt"

def parse_images(filename):
    image_reader = tf.WholeFileReader()

    images = []
    labels = []
    with open(filename, 'r') as tsv_f:
        for line in tsv_f.readlines():
            imgfile, cat = line.split('\t')
            labels.append(int(cat) - 1)

            full_path = os.path.join(DATA_DIRECTORY, imgfile)
            image_f = cv2.imread(full_path)
            resized_image = cv2.resize(image_f, (SIZE, SIZE))
            normalized_image = tf.image.per_image_standardization(resized_image)
            images.append(normalized_image)

    slices = ((images, labels))
    ds = tf.data.Dataset.from_tensor_slices(slices)
    return ds.shuffle(len(images) + 1).batch(100)


def main(argv):
    # Create the Estimator
    top_bottom_classifier = tf.estimator.Estimator(model_fn=cnn_vgg16.vgg16, model_dir="/tmp/top_bottom_convnet_model")

    # Set up logging for predictions
    # Log the values in the "Softmax" tensor with label "probabilities"
    tensors_to_log = {"probabilities": "softmax_tensor"}
    logging_hook = tf.train.LoggingTensorHook(
          tensors=tensors_to_log, every_n_iter=50)

    if len(argv) > 1 and argv[1] == '-t':
        top_bottom_classifier.train(
                input_fn=lambda: parse_images(SAMPLE_CATEGORY_IMG_FILE_TRAIN),
                hooks=[logging_hook])

    eval_results = top_bottom_classifier.evaluate(
            input_fn=lambda: parse_images(SAMPLE_CATEGORY_IMG_FILE_VALIDATION))

    print(eval_results)

if __name__=="__main__":
    tf.app.run()
