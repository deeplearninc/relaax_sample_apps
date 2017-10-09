[Back to contents](../README.md#contents)

[Pendulum](https://gym.openai.com/envs/Pendulum-v0/) is an OpenAI Gym environment. A pendulum rotates around an actuated joint. The aim is to keep it upright applyng forces to the joint. Starting position is of random angle and velocity. The observation is triple of (sin(angle), cos(angle), angular velocity). The action is continuous of size 1 (joint effort in range [-2, 2]). Reward is negative and nears to zero when pendulum is upright with zero angular velocity and joint effort. The aim is keep episode reward is near to zero as possible.

## <a name="da3c"></a>DA3C
To run it navigate to this directory and start `relaax run -c da3c.yaml`. Use `tensorboard --logdir logs/metrics` to follow progress.

## <a name="dppg"></a>DPPG
To run it navigate to this directory and start `relaax run -c dppg.yaml -n 4`.  It will take about an hour to converge. Use `tensorboard --logdir logs/metrics` to follow progress. Episode reward will be above -150.
