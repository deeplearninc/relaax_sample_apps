import numpy as np
import gym
from gym.spaces import Box

from relaax.environment.config import options
from state_transform import StateVelCentr


class OsimWrapper(gym.Wrapper):
    def __init__(self, env):
        gym.Wrapper.__init__(self, env)
        self.state_transform = StateVelCentr(
            obstacles_mode='standard',
            exclude_centr=True,
            vel_states=[])
        self.observation_space = Box(-1000, 1000, self.state_transform.state_size)
        self.skip_frames = options.get('environment/skip_frames', 5)     # 1
        self.reward_scale = options.get('environment/reward_scale', 5.)  # 1.
        self.fail_reward = options.get('environment/fail_reward', 0.)
        # [-1, 1] <-> [0, 1]
        action_mean = .5
        action_std = .5
        self.normalize_action = lambda x: (x - action_mean) / action_std
        self.denormalise_action = lambda x: x * action_std + action_mean

    def reset(self, **kwargs):
        return self._reset(**kwargs)

    def _reset(self, **kwargs):
        observation = self.env.reset(**kwargs)
        self.env_step = 0
        self.state_transform.reset()
        observation, _ = self.state_transform.process(observation)
        observation = self.observation(observation)
        return observation

    def _step(self, action):
        action = self.denormalise_action(action)
        total_reward = 0.
        for _ in range(self.skip_frames):
            observation, reward, done, _ = self.env.step(action)
            observation, obst_rew = self.state_transform.process(observation)
            total_reward += reward + obst_rew
            self.env_step += 1
            if done:
                if self.env_step < 1000:  # hardcoded
                    total_reward += self.fail_reward
                break

        observation = self.observation(observation)
        total_reward *= self.reward_scale
        return observation, total_reward, done, None

    def observation(self, observation):
        return self._observation(observation)

    def _observation(self, observation):
        observation = np.array(observation, dtype=np.float32)
        return observation
