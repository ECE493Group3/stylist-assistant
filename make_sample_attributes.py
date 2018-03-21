#! /usr/bin/env python

# This script assumes the Category and Attribute Prediction benchmark
# is in the working directory, in a subdirectory called 'DATA', and
# completely uncompressed

# This generates a sample of the data for the attribute tagging task,
# as two tsv files

import os
import sys
import random

ANNOTATION_FILE = os.path.join('DATA', 'Anno', 'list_attr_img.txt')
TSV_FILE_TRAIN = 'sample_attribute_img_train.txt'
TSV_FILE_VALIDATION = 'sample_attribute_img_validation.txt'

def make_sample_table(sample_size):

    attr_table = []
    lines = []

    print("Reading attributes from file")
    with open(ANNOTATION_FILE, 'r') as f:
        lines = f.readlines()

    random.seed()

    n_images = int(lines[0])

    if (len(lines) - 2) != n_images:
        raise RuntimeError("The len of the attribute table (%d) is different from " \
                "the number of images (%d)" % (len(lines)-2, n_images))

    images_to_be_used = set(random.sample(range(n_images), sample_size))

    value_convert = {
            '-1' : '0.0',
            '0' : '0.5',
            '1' : '1.0',
            }

    for line in (line for i, line in enumerate(lines[2:]) if i in images_to_be_used):
        elems = line.split()
        filename = elems[0]
        attr = elems[1:]
        converted_attr = [value_convert[val] for val in attr]
        attr_table.append([filename] + converted_attr)

    print("Done reading attributes from file")
    shuffled = random.sample(attr_table, len(attr_table))
    return shuffled

def make_tsvs(table):
    print("Making TSVs")

    train_size = len(table) // 10 * 9
    in_train = set(random.sample(range(len(table)), train_size))

    train_table = [row for i, row in enumerate(table) if i in in_train]
    validation_table = [row for i, row in enumerate(table) if i not in in_train]

    for filename, table in zip([TSV_FILE_TRAIN, TSV_FILE_VALIDATION], [train_table, validation_table]):
        with open(filename, 'w') as f:
            f.writelines("%s\n" % '\t'.join(row) for row in table)

if __name__=="__main__":

    if not len(sys.argv) == 2:
        print("Pass in the sample size")
        exit(1)

    sample_size = int(sys.argv[1])
    table = make_sample_table(sample_size)
    make_tsvs(table)

    print("Done")
