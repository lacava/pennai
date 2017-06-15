import { 
	AI_TOGGLE_REQUEST, 
	AI_TOGGLE_SUCCESS, 
	AI_TOGGLE_FAILURE
} from './actions';

const dataset = (state = Map(), action) => {
	switch(action.type) {
		case AI_TOGGLE_REQUEST:
			return state.mergeIn([action.id], {
				isTogglingAI: true
			});
		case AI_TOGGLE_SUCCESS:
			return state.mergeIn([action.id], {
				ai: action.nextAIState,
				isTogglingAI: false
			});
		case AI_TOGGLE_FAILURE:
			return state.mergeIn([action.id], {
				//errorMessage: action.message,
				isTogglingAI: false
			});
		default:
			return state;	
	}
};

export const getIsTogglingAI = (state, id) =>
	state.getIn(['datasets', 'byId', id, 'isTogglingAI']);

export default dataset;	