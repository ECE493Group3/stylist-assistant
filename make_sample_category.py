#! /usr/bin/env python

# This script assumes the Category and Attribute Prediction benchmark
# is in the working directory, in a subdirectory called 'DATA', and
# completely uncompressed

# This generates a test sample of the data for the Top/Bottom/Full-body task,
# as two tsv files

import os
import sys
import random

LIST_CATEGORY_IMG_FILE = os.path.join('DATA', 'Anno', 'list_category_img.txt')
TSV_FILE_TRAIN = 'sample_category_img_train.txt'
TSV_FILE_VALIDATION = 'sample_category_img_validation.txt'

def make_sample_table(sample_size):

    random.seed()

    with open(LIST_CATEGORY_IMG_FILE) as f:

        lines = f.readlines()
        n_images = int(lines[0])
        images_to_be_used = set(random.sample(range(n_images), sample_size))

        result = []
        for i, line in enumerate(lines[2:]):
            if i in images_to_be_used:
                imgfile, cat = line.split()
                result.append((imgfile, cat))

        shuffled = random.sample(result, len(result))

        return shuffled

def make_tsvs(table):

    train_size = len(table) // 10 * 9
    in_train = set(random.sample(range(len(table)), train_size))

    train_table = [row for i, row in enumerate(table) if i in in_train]
    validation_table = [row for i, row in enumerate(table) if i not in in_train]

    for filename, table in zip([TSV_FILE_TRAIN, TSV_FILE_VALIDATION], [train_table, validation_table]):
        with open(filename, 'w') as f:
            f.writelines("{}\t{}\n".format(img, cat) for img, cat in table)

if __name__=="__main__":

    if not len(sys.argv) == 2:
        print("Pass in the sample size")
        exit(1)

    print("Making tsv")
    sample_size = int(sys.argv[1])
    table = make_sample_table(sample_size)
    make_tsvs(table)

    print("Done")
