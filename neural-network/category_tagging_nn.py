import os
import sys

import tensorflow as tf

import cnn_vgg16

tf.logging.set_verbosity(tf.logging.INFO)

DATA_DIRECTORY = os.path.join('DATA', 'Img_compressed')
SAMPLE_CATEGORY_IMG_FILE_TRAIN = "sample_equal_numbers_train.txt"
SAMPLE_CATEGORY_IMG_FILE_VALIDATION = "sample_equal_numbers_validation.txt"

LOG_FILE = "category_training.log"

BATCH_SIZE = 20

def parse_images(filename, n_epochs=1):
    images = []
    labels = []
    with open(filename, 'r') as tsv_f:
        for line in tsv_f.readlines():
            imgfile, cat_index = line.split('\t')
            labels.append(int(cat_index))

            full_path = os.path.join(DATA_DIRECTORY, imgfile)
            images.append(full_path)

    dataset = tf.data.Dataset.from_tensor_slices((images, labels))
    if n_epochs > 1:
        dataset = dataset.repeat(n_epochs - 1)

    dataset_shuffled = dataset.shuffle(len(images) * n_epochs)
    dataset_pre_processed = dataset_shuffled.map(cnn_vgg16.pre_process_training_data)
    return dataset_pre_processed.batch(BATCH_SIZE)


def log_results(n_epochs, eval_results):
    with open(LOG_FILE, 'a') as f:
        f.write("After {} more epochs:\n".format(n_epochs))
        f.write("{}\n".format(eval_results))


def main(argv):

    should_train = '--just-eval' not in argv

    train_file = SAMPLE_CATEGORY_IMG_FILE_TRAIN
    validation_file = SAMPLE_CATEGORY_IMG_FILE_VALIDATION
    n_epochs = 1

    if '-t' in argv:
        train_file = argv[argv.index('-t') + 1]

    if '-v' in argv:
        validation_file = argv[argv.index('-v') + 1]

    if '-e' in argv:
        n_epochs = int(argv[argv.index('-e') + 1])

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
    tensors_to_log = {"probabilities": cnn_vgg16.CATEGORY_LOGGING_TENSOR_NAME}
    logging_hook = tf.train.LoggingTensorHook(
          tensors=tensors_to_log, every_n_iter=50)

    if should_train:
        top_bottom_classifier.train(
                input_fn=lambda: parse_images(train_file, n_epochs),
                hooks=[logging_hook])

    eval_results = top_bottom_classifier.evaluate(
            input_fn=lambda: parse_images(validation_file))

    print(eval_results)
    if should_train:
        log_results(n_epochs, eval_results)

if __name__ == "__main__":
    tf.app.run(argv=sys.argv)
