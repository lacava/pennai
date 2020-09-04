/* ~This file is part of the PennAI library~

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
// mock api calls & data for testing

// use mock id as key, dataset info as value
const datasets = {
  1234321: {
    name: 'auto.csv',
    dependent_col : "class",
    categorical_features: "",
    ordinal_features: {}
  },
  7654321: {
    name: 'iris.csv',
    dependent_col : "class",
    categorical_features: "",
    ordinal_features: {}
  }
}

// hardcoded to only accept dependent_col of 'class'
export function uploadFile(requestPayload) {
  return new Promise((resolve, reject) => {
    //resolve(datasets[7654321]);
    process.nextTick(() =>
      requestPayload.dependent_col === 'class'
        ? resolve({ Success: 'File uploaded', id: 7654321})
        : reject({ error: 'dependent_col: ' +  requestPayload.dependent_col + ' invalid'})
      )
    // process.nextTick(() =>
    //   url
    //     ? resolve(datasets[7654321])
    //     : reject({ error: 'no url provided' })
    //   )
  })
}
