import os
import sys
import cnn_vgg16

import numpy as np
import tensorflow as tf

tf.logging.set_verbosity(tf.logging.INFO)

DATA_DIRECTORY = os.path.join('DATA', 'Img')
RESCALE_SIZE = [224, 224]
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

            imgfile = os.path.join(DATA_DIRECTORY, imgfile)
            _, image_f = image_reader.read(tf.train.string_input_producer([imgfile]))
            image = tf.image.decode_jpeg(image_f, channels=3)
            resized_image = tf.image.resize_images(image, RESCALE_SIZE)
            images.append(resized_image)

    return tf.convert_to_tensor(images), tf.convert_to_tensor(labels)
    # return tf.train.batch(images, 100), tf.train.batch(labels, 100)

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
                steps=20000,
                hooks=[logging_hook])

    eval_results = top_bottom_classifier.evaluate(
            input_fn=lambda: parse_images(SAMPLE_CATEGORY_IMG_FILE_VALIDATION))

    print(eval_results)

if __name__=="__main__":
    tf.app.run()
