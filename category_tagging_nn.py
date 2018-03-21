import os
import sys

import tensorflow as tf

import cnn_vgg16

tf.logging.set_verbosity(tf.logging.INFO)

DATA_DIRECTORY = os.path.join('DATA', 'Img_compressed')
SAMPLE_CATEGORY_IMG_FILE_TRAIN = "sample_category_img_train.txt"
SAMPLE_CATEGORY_IMG_FILE_VALIDATION = "sample_category_img_validation.txt"

def parse_images(filename):
    images = []
    labels = []
    with open(filename, 'r') as tsv_f:
        for line in tsv_f.readlines():
            imgfile, cat = line.split('\t')
            labels.append(int(cat) - 1)

            full_path = os.path.join(DATA_DIRECTORY, imgfile)
            images.append(full_path)

    dataset = tf.data.Dataset.from_tensor_slices((images, labels))
    return dataset.shuffle(len(images) + 1).map(cnn_vgg16.pre_process_image_file).batch(20)


def main(argv):

    should_train = '--just-eval' not in argv

    train_file = SAMPLE_CATEGORY_IMG_FILE_TRAIN
    validation_file = SAMPLE_CATEGORY_IMG_FILE_VALIDATION

    if '-t' in argv:
        train_file = argv[argv.index('-t') + 1]

    if '-v' in argv:
        validation_file = argv[argv.index('-v') + 1]

    print()
    if should_train:
        print("Using training sample file %s" % train_file)
    else:
        print("Not training")

    print("Using validation sample file %s" % validation_file)
    print()

    # Create the Estimator
    top_bottom_classifier = tf.estimator.Estimator(
            model_fn=cnn_vgg16.category_classifier_model,
            model_dir="category_convnet_model")

    # Set up logging for predictions
    # Log the values in the "Softmax" tensor with label "probabilities"
    tensors_to_log = {"probabilities": "softmax_tensor"}
    logging_hook = tf.train.LoggingTensorHook(
          tensors=tensors_to_log, every_n_iter=50)

    if should_train:
        top_bottom_classifier.train(
                input_fn=lambda: parse_images(train_file),
                hooks=[logging_hook])

    eval_results = top_bottom_classifier.evaluate(
            input_fn=lambda: parse_images(validation_file))

    print(eval_results)

if __name__ == "__main__":
    tf.app.run(argv=sys.argv)
