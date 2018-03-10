#! /usr/bin/env python

# This script assumes the Category and Attribute Prediction benchmark
# is in the working directory, in a subdirectory called 'DATA', and
# completely uncompressed

"""Draft Convolutional Neural Network Estimator for Top/Bottom/Full-body task, built with tf.layers."""

import os
import cv2
import cnn_model
import numpy as np
import tensorflow as tf

tf.logging.set_verbosity(tf.logging.INFO)

DATA_DIRECTORY = os.path.join('DATA', 'Img')
RESCALE_SIZE = (224, 224)
SAMPLE_CATEGORY_IMG_FILE_TRAIN = "sample_category_img_train.txt"
SAMPLE_CATEGORY_IMG_FILE_VALIDATION = "sample_category_img_validation.txt"

def load_images(img_filename):
    """Prepares dataset from img files"""

    images = []
    labels = []
    with open(img_filename, 'r') as tsv_f:
        for line in tsv_f.readlines():
            imgfile, cat = line.split('\t')
            labels.append(int(cat) - 1)

            imgfullpath = os.path.join(DATA_DIRECTORY, imgfile)
            img = cv2.imread(imgfullpath)
            if img is not None:
                processed = cv2.resize(img, RESCALE_SIZE)
                images.append(np.asarray(processed.flatten(), np.float32))
            else:
                print("Could not read image " + imgfullpath)

    return np.asarray(images), np.asarray(labels)

def main(_):
    # Load training and eval data
    train_data, train_labels = load_images(SAMPLE_CATEGORY_IMG_FILE_TRAIN)
    eval_data, eval_labels = load_images(SAMPLE_CATEGORY_IMG_FILE_VALIDATION)

    # Create the Estimator
    mnist_classifier = tf.estimator.Estimator(model_fn=cnn_model.cnn_model_fn, model_dir="/tmp/top_bottom_convnet_model")

    # Set up logging for predictions
    # Log the values in the "Softmax" tensor with label "probabilities"
    tensors_to_log = {"probabilities": "softmax_tensor"}
    logging_hook = tf.train.LoggingTensorHook(
          tensors=tensors_to_log, every_n_iter=50)

    # Train the model
    train_input_fn = tf.estimator.inputs.numpy_input_fn(
            x={'x': train_data},
            y=train_labels,
            batch_size=100,
            num_epochs=None,
            shuffle=True)

    mnist_classifier.train(
            input_fn=train_input_fn,
            steps=20000,
            hooks=[logging_hook])

    # Evaluate the model and print results
    eval_input_fn = tf.estimator.inputs.numpy_input_fn(
            x={"x": eval_data},
            y=eval_labels,
            num_epochs=1,
            shuffle=False)

    eval_results = mnist_classifier.evaluate(input_fn=eval_input_fn)
    print(eval_results)

if __name__=="__main__":
    tf.app.run()

