import os
import sys
import random
import collections

from nn_config import SELECTED_CATEGORIES

LIST_CATEGORY_CLOTH_FILE = os.path.join('DATA', 'Anno', 'list_category_cloth.txt')
LIST_CATEGORY_IMG_FILE = os.path.join('DATA', 'Anno', 'list_category_img.txt')
TRAIN_OUTPUT_FILE = "sample_equal_numbers_train.txt"
VALIDATION_OUTPUT_FILE = "sample_equal_numbers_validation.txt"

def make_sample(points_per_category=300):

    category_lines = []
    with open(LIST_CATEGORY_CLOTH_FILE) as f:
        category_lines = f.readlines()

    category_name = {}
    for i, line in enumerate(category_lines[2:]):
        name, _ = line.split()
        category_name[str(i+1)] = name

    lines = []
    with open(LIST_CATEGORY_IMG_FILE) as f:
        lines = f.readlines()

    cats_to_use_set = set(name for name, num in SELECTED_CATEGORIES)

    sample_dict = collections.defaultdict(list)
    for line in lines[2:]:
        img, cat_number = line.split()
        cat_name = category_name[cat_number]
        if cat_name in cats_to_use_set:
            sample_dict[cat_name].append((img, cat_number))

    points_per_validation = points_per_category // 20
    points_per_training = points_per_category - points_per_validation
    train_sample = []
    validation_sample = []

    for name, l in sample_dict.items():
        selected = random.sample(l, points_per_category)
        train_sample.extend(selected[:points_per_training])
        validation_sample.extend(selected[points_per_training:])

    cat_to_index = {row[1]: i for i, row in enumerate(SELECTED_CATEGORIES)}
    train_sample_with_indices = [(img, cat_to_index[num]) for img, num in train_sample]
    validation_sample_with_indices = [(img, cat_to_index[num])
                                       for img, num in validation_sample]

    # validate the sample
    sample = validation_sample + train_sample
    sample_with_indices = validation_sample_with_indices + train_sample_with_indices
    for img, cat in sample:
        assert cat in category_name
        assert category_name[cat] in img

    count = collections.Counter(cat for _, cat in sample)
    used = {category_name[key] for key in count.keys()}
    assert used == cats_to_use_set

    for _, cnt in count.items():
        assert cnt == points_per_category

    assert {i for img, i in sample_with_indices} == set(range(len(SELECTED_CATEGORIES)))

    # write output
    with open(TRAIN_OUTPUT_FILE, 'w') as f:
        for img, cat in random.sample(train_sample_with_indices,
                                     len(train_sample_with_indices)):
            f.write("{}\t{}\n".format(img, cat))

    with open(VALIDATION_OUTPUT_FILE, 'w') as f:
        for img, cat in random.sample(validation_sample_with_indices,
                                     len(validation_sample_with_indices)):
            f.write("{}\t{}\n".format(img, cat))

    print("Done")


if __name__ == "__main__":
    if len(sys.argv) > 1:
        make_sample(points_per_category=int(sys.argv[1]))
    else:
        make_sample()
