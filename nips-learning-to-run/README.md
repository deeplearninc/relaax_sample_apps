[Back to contents](../README.md#contents)

# NIPS2017: Learning to run

This application trains physiologically-based human model to navigate a complex obstacle course as quickly as possible. More details are [here](https://www.crowdai.org/challenges/nips-2017-learning-to-run).

## Getting started

* Anaconda is required to run this application. Anaconda will create a virtual environment with all the necessary libraries, to avoid conflicts with libraries installed in your operating system. Please follow this [link](https://www.continuum.io/downloads) to install Anaconda.

* Install osim-rl following these [steps](https://github.com/stanfordnmbl/osim-rl#getting-started).

* We assume you have RELAAX installed.

* Start training with `relaax run -c da3c.yaml --show-ui -n 3`.

TODO: Does it converge? How long does it take to converge? What is target reward?
