[Back to contents](../README.md#contents)

[Boxing](https://gym.openai.com/envs/Boxing-v0/) is an OpenAI Gym environment. This is classic Atari 2660 game. The observation is RGB image of screen. The action is discrete from [0, 17] range.

## DA3C
To run it navigate to this directory and start `relaax run -c da3c.yaml -n 8`.  It takes days to converge. Wait for 15M steps.  Use `tensorboard --logdir logs/metrics` to follow progress. At the end episode reward will be more than 60.
