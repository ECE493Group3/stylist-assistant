# DESCRIPTION

This repository contains a collection of scripts whose purpose
is to train a neural network and provide training data to be used
in predictions.

At the end of the operations described here, you will have two
directories with training data, named category_convnet_model
and attribute_tagging_model. These can be used as data for a
tensorflow Estimator in order to run predictions of Categories
and Attributes of images respectively (see "Data Description"
section for details).

It also contains an ImageProcessor class and script which can run
predictions for quick testing or be imported into for use in external
applications (see "Image Processor" section for details).

# DATA DESCRIPTION

The neural networks described here use DeepFashion for reference in both
data formats and training data. In the DeepFashion schema, each image
is associated with one of 50 mutually exclusive categories and tagged with
zero or more of 1000 non-mutually-exclusive attributes.

We use only 23 of these categories (listed in "nn_config.py").

# DEPENDENCIES

These scripts use Python (version 3.5).

Install the following Python packages:
- tensorflow (https://pypi.python.org/pypi/tensorflow)
- opencv-python (https://pypi.python.org/pypi/opencv-python/3.4.0.12)

We recommend using a virtual environment (https://virtualenv.pypa.io/en/stable/)

# RUNNING THE SCRIPTS

## 1 - Downloading training data

Download the "Clothes Images" file from the Category and Attribute Prediction
Benchmark section of the DeepFashion website
(http://mmlab.ie.cuhk.edu.hk/projects/DeepFashion/AttributePrediction.html).

Unzip the file completely into a directory called "DATA", in the same directory
as the other scripts. Make sure to also unzip the "img.zip" file inside the "Img"
subdirectory.

After this step, you should have a directory called "DATA", with subdirectories
"Anno", "Eval", and "Img" and a README file. The "Anno" subdirectory should have
several list*.txt files and the "Img" subdirectory should have an "img"
subdirectory with image directories inside it.

## 2 - Compressing data

For simplicity, the scripts use pre-resized versions of the images (though this
is not strictly necessary according for the neural network architecture). Use the
"compress_images.py" script, as such:

$> python3 compress_images.py

This will create a directory "DATA/Img_compressed" with all the images in the
dataset resized to 224x224 pixels.
You can also pass in the flag "-o" to overwrite images that have already been
compressed.

## 3 - Making sample files

The training scripts use sample files - text files that contain a random selection
of the tagged data to be used for training and evalutation.

The script "make_sample_attributes.py" generates sample files for the attribute
tagging task. Run it as such:

$> python3 make_sample_attributes.py [SAMPLE SIZE]

This will select <SAMPLE SIZE> images from the dataset, along with their attributes,
and generate two files, one with the training data (called
"sample_attribute_img_train.txt") and one with evaluation data (called
"sample_attribute_img_validation.txt"). The evaluation set will have 1500 images or
10% of the sample, whichever is lower.

Each of these sample files is a TSV with an image path and attribute tags in each line.

For the category tagging task, use the "make_equal_sample_category.py" script, like so:

$> python3 make_equal_sample_category.py [DATA POINTS PER CATEGORY]

This will also generate sample files similar to the ones described above, called
"sample_equal_numbers_train.txt" and "sample_equal_numbers_validation.txt". This script is
slightly different in that it selects a sample with the same number of data points in each
category, to balance out skewedness in the DeepFashion data.

Note that these sample file contain paths to the images, and not the iamges themselves. The
files will be read during training and evaluation.

## 4 - Training

To train the category tagging neural network, use the "category_tagging_nn.py" script:

$> python3 category_tagging_nn.py

This script has the following options:
-t [TRAINING FILE] : specify training sample file. Defaults to "sample_equal_numbers_train.txt"
-v [TRAINING FILE] : specify validation sample file. Defaults to "sample_equal_numbers_validation.txt"
-e [EPOCHS] : specify number of epochs through the sample set. Defaults to 1.
--just-eval : Do not train, just run an evaluation on existing data.

If there is already a "category_convnet_model" directory, this script will use that as starting point,
otherwise it will create the directory.

Once this script finishes running, it will display evaluation results, in this format (example numbers):
{'accuracy': 0.32753623, 'loss': 5.0201564, 'global_step': 37401}

To train the attribute tagging neural network, use the "attribute_tagging_nn.py" script:

$> python3 attribute_tagging_nn.py

This script has the following options:
-t [TRAINING FILE] : specify training sample file. Defaults to "sample_equal_numbers_train.txt"
-v [TRAINING FILE] : specify validation sample file. Defaults to "sample_equal_numbers_validation.txt"
--just-eval : Do not train, just run an evaluation on existing data.

The output of the evaluation is similar to the other script, but with root-mean-squared-error instead
of accuracy.

# IMAGE PROCESSOR

To run predictions on the command line, you can use the image_processor.py script.

$> python3 image_processor.py /path/to/image

Assuming the training directories are in the same directory, this will output
the predicted category and attributes to stdout.

# UNUSED SCRIPTS

This repository includes some scripts that are not used anymore but were used in the past.
They are preserved if you want to use them.

## make_sample_top_bottom.py and top_bottom_nn.py

These are similar to the sample-making and training scripts for categories, but the neural network it
produces only classifies images between the Top, Bottom, and Full-body types of clothes.

## make_sample_attributes.py

This script has the same interface as the sample-making script for attribute tagging, but it generates
samples for category tagging. This isn't used anymore because the sample it generates does not have an
equal number of data points per category and thus it is vulnerable to biases in the dataset.
