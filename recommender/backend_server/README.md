# Back-End Server

Run this inside our Cybera instance to serve the app.
$> python server.py

This directory contains a collection of scripts whose purpose is to 
handle custom POST request from the application.

# DEPENDENCIES
These scripts use Python (version 2.7).

Install the following Python packages:
 - tensorflow (or tensorflow-gpu)

>sudo pip install tensorflow

We recommend using a virtual environment.

# Setting up the neural network

To run the neural network, training data needs to be provided.
Put the two directories `category_convnet_model` and `attribute_tagging_convnet_model`
created by training into the directory `image-processing`.
