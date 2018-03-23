import os
import sys
import random

def make_tsvs(table, train_file, validation_file):
    print("Making TSVs")

    train_size = len(table) // 10 * 9
    in_train = set(random.sample(range(len(table)), train_size))

    train_table = [row for i, row in enumerate(table) if i in in_train]
    validation_table = [row for i, row in enumerate(table) if i not in in_train]

    for filename, table in zip([train_file, validation_file], [train_table, validation_table]):
        with open(filename, 'w') as f:
            f.writelines("%s\n" % '\t'.join(row) for row in table)

    print("Done making TSVs")


def _backup_file(filename):
    count = 0
    backup_name = filename + '.' + str(count)

    while os.path.exists(backup_name):
        count += 1
        backup_name = filename + '.' + str(count)

    os.rename(filename, backup_name)


def get_previous_images(train_file, validation_file):
    res = set()

    for fil in (train_file, validation_file):
        if os.path.exists(fil):
            with open(fil) as f:
                for line in f.readlines():
                    img, _ = line.split(maxsplit=1)
                    res.add(img)

            _backup_file(fil)

    return res
