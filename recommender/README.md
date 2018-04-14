# Recommender

This directory contains a collection of scripts whose purpose
is to recommend a list of outfits to the user.

At the end of the operations, all the recommended outfits categories
and images will be upload to firebase and display on the app.

Each file can be run and test independently.

# DEPENDENCIES

These scripts use Python (version 2.7).

Install the following Python packages:

- anytree (https://pypi.python.org/pypi/anytree)
- firebase_admin (https://firebase.google.com/docs/admin/setup)
>sudo pip install anytree --user
>sudo pip install firebase_admin


We recommend using a virtual environment (https://virtualenv.pypa.io/en/stable/)

# Cloth piece and Outfit Similarity
## cloth_hierarchy.py
create the cloth hierarchy for cloth piece simiarlity comparison

## cloth_similarity.py
calculate the cloth_pice and outfit similarity based on cloth hierarchy

## cloth.py
cloth.py contain cloth and outfit classes.

### Cloth 
Each cloth object represent one cloth piece. It contain the cloth piece image, the type(fullbody, top, bottom) and its categories

### Outfit
Each outfit object represent an outfit. It either be a single piece fullbody or a two piece(top, bottom) combinations.

# Recommender
## recommender.py
- Build the possible outfits from the input wardrobe
- Assign similarity rating to each wardrobe outfits to the reference outfits
- Output 10 outfits with the highest similarity rating

# Update Firebase
## connect_firebase.py
- Retrieve user wardrobe from firebase
- update new wardrobe item to firebase
- retrieve stylist reference from firebase
