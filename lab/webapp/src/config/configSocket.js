/* This file is part of the PennAI library.

Copyright (C) 2017 Epistasis Lab, University of Pennsylvania

PennAI is maintained by:
    - Heather Williams (hwilli@upenn.edu)
    - Weixuan Fu (weixuanf@pennmedicine.upenn.edu)
    - William La Cava (lacava@upenn.edu)
    - and many other generous open source contributors

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

*/
import io from 'socket.io-client';
import { updateAI, updateDataset } from 'data/datasets/dataset/actions';
import { addExperiment, updateExperiment } from 'data/experiments/actions';
import { fetchRecommender} from 'data/recommender/actions';

let socket = io(`${location.protocol}//${location.hostname}:${location.port}`);
/**
* Based on various network events, emit/dispatch corresponding redux action
*
*/
const configSocket = (store) => {
  socket.on('updateAIToggle', data => {
    const parsed = JSON.parse(data);
    store.dispatch(updateAI(parsed._id, parsed.nextAIState));
  });

  socket.on('updateDataset', data => {
    const dataset = JSON.parse(data)[0];
    store.dispatch(updateDataset(dataset));
  });

  socket.on('updateExperiment', data => {
    const experiment = JSON.parse(data)[0];
    store.dispatch(updateExperiment(experiment));
  });

  socket.on('addExperiment', data => {
    const experiment = JSON.parse(data)[0];
    store.dispatch(addExperiment(experiment));
  });

  socket.on('updateRecommender', data => {
    store.dispatch(fetchRecommender());
  });
};

export default configSocket;
