#! /usr/bin/env python
"""Implementation of VGG-16 for Top/Bottom/Full-body task."""

import tensorflow as tf

SIZE = 224
N_LABELS = 3

def vgg16(features, labels, mode):
    """Model function for CNN."""

    input_layer = features

    # 1st stack of convolutional layers
    conv3_64_0 = tf.layers.conv2d(
            inputs=input_layer,
            filters=64,
            kernel_size=[3, 3],
            padding="same",
            activation=tf.nn.relu)

    conv3_64_1 = tf.layers.conv2d(
            inputs=conv3_64_0,
            filters=64,
            kernel_size=[3, 3],
            padding="same",
            activation=tf.nn.relu)

    maxpool_0 = tf.layers.max_pooling2d(
            inputs=conv3_64_1,
            pool_size=[2, 2],
            strides=2)

    # 2nd stack of convolutional layers
    conv3_128_0 = tf.layers.conv2d(
            inputs=maxpool_0,
            filters=128,
            kernel_size=[3, 3],
            padding="same",
            activation=tf.nn.relu)

    conv3_128_1 = tf.layers.conv2d(
            inputs=conv3_128_0,
            filters=128,
            kernel_size=[3, 3],
            padding="same",
            activation=tf.nn.relu)

    maxpool_1 = tf.layers.max_pooling2d(
            inputs=conv3_128_1,
            pool_size=[2, 2],
            strides=2)

    # 3rd stack of convolutional layers
    conv3_256_0 = tf.layers.conv2d(
            inputs=maxpool_1,
            filters=256,
            kernel_size=[3, 3],
            padding="same",
            activation=tf.nn.relu)

    conv3_256_1 = tf.layers.conv2d(
            inputs=conv3_256_0,
            filters=256,
            kernel_size=[3, 3],
            padding="same",
            activation=tf.nn.relu)

    conv1_256_0 = tf.layers.conv2d(
            inputs=conv3_256_1,
            filters=256,
            kernel_size=[1, 1],
            padding="same",
            activation=tf.nn.relu)

    maxpool_2 = tf.layers.max_pooling2d(
            inputs=conv1_256_0,
            pool_size=[2, 2],
            strides=2)

    # 4th stack of convolutional layers
    conv3_512_0 = tf.layers.conv2d(
            inputs=maxpool_2,
            filters=512,
            kernel_size=[3, 3],
            padding="same",
            activation=tf.nn.relu)

    conv3_512_1 = tf.layers.conv2d(
            inputs=conv3_512_0,
            filters=512,
            kernel_size=[3, 3],
            padding="same",
            activation=tf.nn.relu)

    conv1_512_0 = tf.layers.conv2d(
            inputs=conv3_512_1,
            filters=512,
            kernel_size=[1, 1],
            padding="same",
            activation=tf.nn.relu)

    maxpool_3 = tf.layers.max_pooling2d(
            inputs=conv1_512_0,
            pool_size=[2, 2],
            strides=2)

    # 5th stack of convolutional layers
    conv3_512_2 = tf.layers.conv2d(
            inputs=maxpool_3,
            filters=512,
            kernel_size=[3, 3],
            padding="same",
            activation=tf.nn.relu)

    conv3_512_3 = tf.layers.conv2d(
            inputs=conv3_512_2,
            filters=512,
            kernel_size=[3, 3],
            padding="same",
            activation=tf.nn.relu)

    conv1_512_1 = tf.layers.conv2d(
            inputs=conv3_512_3,
            filters=512,
            kernel_size=[1, 1],
            padding="same",
            activation=tf.nn.relu)

    maxpool_4 = tf.layers.max_pooling2d(
            inputs=conv1_512_1,
            pool_size=[2, 2],
            strides=2)

    # Flatten tensor for dense layers
    size_after_maxpool_4 = SIZE // 2
    new_size = size_after_maxpool_4 * size_after_maxpool_4 * 512
    maxpool_4_flat = tf.reshape(features, [-1, new_size])

    # Dense layers
    fc_4096_0 = tf.layers.dense(
            inputs=maxpool_4_flat,
            units=4096,
            activation=tf.nn.relu)

    fc_4096_1 = tf.layers.dense(
            inputs=fc_4096_0,
            units=4096,
            activation=tf.nn.relu)

    # Logits layer
    logits = tf.layers.dense(inputs=fc_4096_1, units=3)

    # Softmax
    softmax = tf.nn.softmax(logits, name="softmax_tensor")

    predictions = {
      # Generate predictions (for PREDICT and EVAL mode)
      "classes": tf.argmax(input=logits, axis=1),
      # Add `softmax_tensor` to the graph. It is used for PREDICT and by the
      # `logging_hook`.
      "probabilities": softmax
    }

    if mode == tf.estimator.ModeKeys.PREDICT:
        return tf.estimator.EstimatorSpec(mode=mode, predictions=predictions)

    # Calculate Loss (for both TRAIN and EVAL modes)
    loss = tf.losses.sparse_softmax_cross_entropy(labels=labels, logits=logits)

    # Configure the Training Op (for TRAIN mode)
    if mode == tf.estimator.ModeKeys.TRAIN:
        optimizer = tf.train.GradientDescentOptimizer(learning_rate=0.001)
        train_op = optimizer.minimize(loss=loss, global_step=tf.train.get_global_step())
        return tf.estimator.EstimatorSpec(mode=mode, loss=loss, train_op=train_op)

    # Add evaluation metrics (for EVAL mode)
    eval_metric_ops = {
            "accuracy": tf.metrics.accuracy(
                labels=labels,
                predictions=predictions["classes"])
            }

    return tf.estimator.EstimatorSpec(mode=mode, loss=loss, eval_metric_ops=eval_metric_ops)
