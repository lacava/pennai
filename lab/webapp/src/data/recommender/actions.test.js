/* ~This file is part of the PennAI library~

Copyright (C) 2017 Epistasis Lab, University of Pennsylvania

PennAI is maintained by:
    - Heather Williams (hwilli@upenn.edu)
    - Weixuan Fu (weixuanf@upenn.edu)
    - William La Cava (lacava@upenn.edu)
    - Michael Stauffer (stauffer@upenn.edu)
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

(Autogenerated header, do not modify)

*/
import * as actions from './actions'

import 'isomorphic-fetch'
import fetchMock from 'fetch-mock'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)
fetchMock.config.sendAsJson = true

describe ('async actions', () => {
	afterEach(() => {
		fetchMock.restore()
	})

	it('create FETCH_RECOMMENDER_SUCCESS when fetching recommender has been done', () => {
		const recObject = {
			    "_id": "5e8bdb51cb325e6349a450c9",
			    "type": "recommender",
			    "status": "disabled"
			}

		fetchMock.getOnce('path:/api/recommender', {
			body: recObject
		})

		const expectedActions = [
			{ type: actions.FETCH_RECOMMENDER_REQUEST},
			{ type: actions.FETCH_RECOMMENDER_SUCCESS, payload: recObject }
		]
		const store = mockStore()

	    return store.dispatch(actions.fetchRecommender()).then(() => {
	      // return of async actions
	      expect(store.getActions()).toEqual(expectedActions)
	    })
	})

})