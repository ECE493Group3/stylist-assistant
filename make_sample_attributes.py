#! /usr/bin/env python

# This script assumes the Category and Attribute Prediction benchmark
# is in the working directory, in a subdirectory called 'DATA', and
# completely uncompressed

# This generates a sample of the data for the attribute tagging task,
# as two tsv files

import os
import sys
import random

import make_sample

ANNOTATION_FILE = os.path.join('DATA', 'Anno', 'list_attr_img.txt')
TSV_FILE_TRAIN = 'sample_attribute_img_train.txt'
TSV_FILE_VALIDATION = 'sample_attribute_img_validation.txt'

def make_sample_table(sample_size, previous_images):

    attr_table = []

    value_convert = {
            '-1' : '0.0',
            '0' : '0.5',
            '1' : '1.0',
            }

    print("Reading attributes from file")
    lines = []
    with open(ANNOTATION_FILE, 'r') as f:
        lines = f.readlines()

    for line in lines[2:]:
        elems = line.split()
        filename = elems[0]

        if filename in previous_images:
            continue

        attr = elems[1:]
        converted_attr = [value_convert[val] for val in attr]
        attr_table.append(tuple([filename] + converted_attr))

    print("Done reading attributes from file")

    random.seed()

    sample = random.sample(attr_table, min(sample_size, len(attr_table)))

    return sample

if __name__=="__main__":

    if not len(sys.argv) == 2:
        print("Pass in the sample size")
        exit(1)

    sample_size = int(sys.argv[1])
    previous_images = make_sample.get_previous_images(TSV_FILE_TRAIN, TSV_FILE_VALIDATION)
    table = make_sample_table(sample_size, previous_images)
    make_sample.make_tsvs(table, TSV_FILE_TRAIN, TSV_FILE_VALIDATION)

    print("Done")
