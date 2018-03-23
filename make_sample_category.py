#! /usr/bin/env python

# This script assumes the Category and Attribute Prediction benchmark
# is in the working directory, in a subdirectory called 'DATA', and
# completely uncompressed

# This generates a test sample of the data for the Top/Bottom/Full-body task,
# as two tsv files

import os
import sys
import random

import make_sample

LIST_CATEGORY_IMG_FILE = os.path.join('DATA', 'Anno', 'list_category_img.txt')
TSV_FILE_TRAIN = 'sample_category_img_train.txt'
TSV_FILE_VALIDATION = 'sample_category_img_validation.txt'

def make_sample_table(sample_size, previous_images):

    random.seed()

    with open(LIST_CATEGORY_IMG_FILE) as f:
        lines = f.readlines()

        result = []
        for i, line in enumerate(lines[2:]):
            imgfile, cat = line.split()
            if imgfile not in previous_images:
                result.append((imgfile, cat))

        sample = random.sample(result, min(sample_size, len(result)))

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
