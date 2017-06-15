require('es6-promise').polyfill();
import fetch from 'isomorphic-fetch';
import { fromJS } from 'immutable';
import { 
    requestResults,
    receiveResults
} from './actions';

export const fetchResults = (experimentId) => {
    const route = `api/userdatasets/${experimentId}`;

    return function(dispatch) {
        dispatch(requestResults());
        return fetch(route, {
          credentials: 'include'
        })

            .then(response => response.json())
            .then(json =>
                dispatch(receiveResults(fromJS(json)))
            );
    }
};
