import os
import sys
import cv2

DATA_DIRECTORY = os.path.join('DATA', 'Img')
COMPRESSED_DATA_DIRECTORY = os.path.join('DATA', 'Img_compressed')
IMG_FILENAMES_FILE = os.path.join('DATA', 'Anno', 'list_category_img.txt')
SIZE = 224

if __name__=="__main__":

    overwrite = len(sys.argv) > 1 and sys.argv[1] == '-o'

    if not os.path.exists(COMPRESSED_DATA_DIRECTORY):
        os.mkdir(COMPRESSED_DATA_DIRECTORY)
        print("Created compressed images directory: %s" % COMPRESSED_DATA_DIRECTORY)

    file_contents = []
    with open(IMG_FILENAMES_FILE) as f:
        file_contents = f.readlines()

    n_images = int(file_contents[0])

    file_contents = file_contents[2:]

    if n_images != len(file_contents):
        print("The number of images (%d) doesn't match the number of lines (%d)" % \
                (n_images, len(file_contents)))

    img_filenames = [line.split()[0] for line in file_contents]

    count = 0
    print("Compressing...")
    for img_filename in img_filenames:
        from_file = os.path.join(DATA_DIRECTORY, img_filename)
        to_file = os.path.join(COMPRESSED_DATA_DIRECTORY, img_filename)

        if overwrite or not os.path.exists(to_file):
            img = cv2.imread(from_file)
            if img is None:
                print("Could not read file %s" % img_filename)
                exit(1)

            to_dir = os.path.dirname(to_file)
            if not os.path.exists(to_dir):
                os.makedirs(to_dir)
                print("Created directory %s" % to_dir)

            resized_image = cv2.resize(img, (SIZE, SIZE))

            result = cv2.imwrite(to_file, resized_image)
            if not result:
                print("Could not write file %s: %d" % (img_filename, result))
                exit(result)

            count += 1

            if count % 100 == 0:
                print("Compressed %d images" % count)

    print("Done compressing")
