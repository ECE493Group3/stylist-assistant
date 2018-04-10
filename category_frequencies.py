import os
import collections

LIST_CATEGORY_IMG_FILE = os.path.join('DATA', 'Anno', 'list_category_img.txt')
LIST_CATEGORY_CLOTH_FILE = os.path.join('DATA', 'Anno', 'list_category_cloth.txt')

def calculate_frequencies():
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

    cats = [line.split()[1] for line in lines[2:]]
    cat_names = [category_name[c] for c in cats]

    count = collections.Counter(cats)
    name_counter = collections.Counter(cat_names)


    print("Counts for each category")
    print(sorted(name_counter.items(), key=lambda item: item[1], reverse=True))

    count_array = [c for _, c in sorted(count.items())]
    total = sum(count_array)
    print("The total amount of data points is %d" % total)

    weights = [float(c)/total for c in count_array]
    print("Weights:")
    print(weights)

if __name__ == "__main__":
    calculate_frequencies()
