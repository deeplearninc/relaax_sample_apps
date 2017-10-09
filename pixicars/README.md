[Back to contents](../README.md#contents)

PixiCars is JavaScript environment hosted in browser. 2D cars runs in scene filled with obstacles. The observation for a car is distances from the car to 58 directions (kind of one dimensional lidar map). The action is two numbers in range \[-1, 1\] (full throttle - emergency breaking, steering from left to right). The aim is to run the car fast avoiding obstacles. TODO: what is reward?

## <a name="da3c"></a>DA3C
To run it navigate to this directory and start `relaax run -c da3c.yaml`. Use `tensorboard --logdir logs/metrics` to follow progress. TODO: converges?

## <a name="dppg"></a>DPPG
To run it navigate to this directory and start `relaax run -c ddpg.yaml`. Use `tensorboard --logdir logs/metrics` to follow progress. TODO: converges?

## <a name="trpo"></a>TRPO
To run it navigate to this directory and start `relaax run -c trpo.yaml`. Use `tensorboard --logdir logs/metrics` to follow progress. TODO: converges?
