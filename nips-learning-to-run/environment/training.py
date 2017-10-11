from __future__ import print_function
from builtins import range

import logging
from osim.env import RunEnv

from relaax.environment.config import options
from relaax.environment.training import TrainingBase

log = logging.getLogger(__name__)


class Training(TrainingBase):

    def __init__(self):
        super(Training, self).__init__()
        self.env = RunEnv(visualize=options.get('show_ui', False))
        self.steps = options.get('environment/steps', 200)

    def episode(self, number):
        # get initial state from environment
        observation = self.env.reset(difficulty=0)
        print('initial observation: ', observation)
        # get first action from agent
        action = self.agent.update(reward=None, state=observation)
        print('action: %s' % str(action))
        # update agent with state and reward
        episode_reward = 0
        for step in range(self.steps):
            observation, reward, done, info = self.env.step(action)
            print('done: ', done)
            action = self.agent.update(reward=reward, state=observation, terminal=done)
            log.info('step: %s, reward: %s' % (step, reward))
            episode_reward += reward
        # return episode reward for it to be stored to metrics as game_score
        return episode_reward

if __name__ == '__main__':
    Training().run()
