[Back to contents](../README.md#contents)

[BipedalWalker](https://gym.openai.com/envs/BipedalWalker-v2/) is an OpenAI Gym environment:

> Reward is given for moving forward, total 300+ points up to the far end. If the robot falls, it gets -100. Applying motor torque costs a small amount of points, more optimal agent will get better score. State consists of hull angle speed, angular velocity, horizontal speed, vertical speed, position of joints and joints angular speed, legs contact with ground, and 10 lidar rangefinder measurements. There's no coordinates in the state vector.

We run Continuous DA3C with LSTM to resolve this environment.
To run it navigate to this directory and start `relaax run -c da3c.yaml`.
It takes several hours to converge. Wait for 4-5M steps to get maximum score.
Use `tensorboard --logdir logs/metrics` to follow progress.
Episode reward will be around 300.
