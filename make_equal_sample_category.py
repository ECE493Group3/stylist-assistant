import os
import sys
import random
import collections

LIST_CATEGORY_CLOTH_FILE = os.path.join('DATA', 'Anno', 'list_category_cloth.txt')
LIST_CATEGORY_IMG_FILE = os.path.join('DATA', 'Anno', 'list_category_img.txt')
OUTPUT_FILE = "sample_equal_numbers.txt"

CATEGORIES_TO_USE = [
'Sweater',
'Blazer',
'Bomber',
'Cardigan',
'Hoodie',
'Flannel',
'Jacket',
'Parka',
'Poncho',
'Tee',
'Top',
'Jersey',
'Button-Down',
'Tank',
'Henley',
'Jeans',
'Chinos',
'Joggers',
'Sweatpants',
'Shorts',
'Trunks',
'Sweatshorts',
'Coat',
# 'Cape',
]

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

    cats_to_use_set = set(CATEGORIES_TO_USE)

    sample_dict = collections.defaultdict(list)
    for line in lines[2:]:
        img, cat_number = line.split()
        cat_name = category_name[cat_number]
        if cat_name in cats_to_use_set:
            sample_dict[cat_name].append((img, cat_number))

    sample = []
    for name, l in sample_dict.items():
        selected = random.sample(l, points_per_category)
        sample.extend(selected)

    # validate
    for img, cat in sample:
        assert cat in category_name
        assert category_name[cat] in img

    count = collections.Counter(cat for _, cat in sample)
    used = {category_name[key] for key in count.keys()}
    assert used == cats_to_use_set

    for _, cnt in count.items():
        assert cnt == points_per_category

    # write output
    with open(OUTPUT_FILE, 'w') as f:
        for img, cat in random.sample(sample, len(sample)):
            f.write("{}\t{}\n".format(img, cat))

    print("Done")


if __name__ == "__main__":
    if len(sys.argv) > 1:
        make_sample(points_per_category=int(sys.argv[1]))
    else:
        make_sample()
