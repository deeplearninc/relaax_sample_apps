[Back to contents](../README.md#contents)

[BipedalWalker](https://gym.openai.com/envs/BipedalWalker-v2/) is an OpenAI Gym environment:

> Reward is given for moving forward, total 300+ points up to the far end. If the robot falls, it gets -100. Applying motor torque costs a small amount of points, more optimal agent will get better score. State consists of hull angle speed, angular velocity, horizontal speed, vertical speed, position of joints and joints angular speed, legs contact with ground, and 10 lidar rangefinder measurements. There's no coordinates in the state vector.

It allows to run several algorithms for this environment:

### 1) Continuous TRPO:
To run it navigate to this directory and start `relaax run -c trpo.yaml -n num_of_agents`.
It takes a couple of hours to converge. Wait for 2-3M steps to get maximum score.
Use `tensorboard --logdir logs/metrics` to follow progress.
Episode reward will be around 300 and it should be looks like as
[follows](https://github.com/deeplearninc/relaax/blob/master/docs/Algorithms.md#performance-on-gyms-bipedalwalker)

### 2) Continuous DA3C (with LSTM):
To run it navigate to this directory and start `relaax run -c da3c.yaml`.
It takes a couple of hours to converge. Wait for 2-3M steps to get maximum score.
Use `tensorboard --logdir logs/metrics` to follow progress.
Episode reward will be around 300 and it should be looks like as
[follows](https://github.com/deeplearninc/relaax/blob/master/docs/Algorithms.md#performance-on-some-continuous-control-tasks)
