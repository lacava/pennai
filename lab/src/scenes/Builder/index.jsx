import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setDataset, setAlgorithm, setParamValue, resetParams } from './data/actions';
import { fetchDataset, submitJob } from './data/api';
import { Header, Grid, Button } from 'semantic-ui-react';
import { SelectedAlgorithm } from './components/SelectedAlgorithm';
import { Parameters } from './components/Parameters';
import { Launch } from './components/Launch';

export class Builder extends React.Component {
	componentDidMount() {
		const { 
			datasets,
			algorithms,
			fetchDataset,
			setDataset,
			setAlgorithm,
			setParamValue
		} = this.props;

		const datasetId = this.props.params.id;

		const findDatasetById = (dataset) => {
			return dataset.get('_id') === datasetId;
		};

		let dataset = datasets.find(findDatasetById);
		let algorithm = algorithms.first();

		if(dataset) {
			setDataset(dataset);
		} else {
			fetchDataset(datasetId);
		}

		setAlgorithm(algorithm);
		algorithm.get('params').entrySeq().forEach(([key, value]) => {
			setParamValue(key, value.get('default'));
		});
	}

	render() {

		const {
			builder,
			algorithms,
			setAlgorithm,
			setParamValue,
			submitJob,
			resetParams
		} = this.props;

		return (
			<div className="builder-scene">
				<div className="page-title">
					<Header 
						inverted 
						size="huge" 
						content={`Experiment Builder: ${builder.getIn(['dataset', 'item', 'name']) || ''}`}
					/>
				</div>
				{builder.getIn(['dataset', 'item']) ? (
					<div>
						<Grid stretched>
							<SelectedAlgorithm
								algorithms={algorithms}
								currentAlgorithm={builder.get('algorithm')}
								setCurrentAlgorithm={setAlgorithm}
								setParamValue={setParamValue}
							/>
							<Parameters 
								params={builder.getIn(['algorithm', 'params'])}
								currentParams={builder.get('params')}
								setParamValue={setParamValue}
							/>
						</Grid>
						<Button 
							color="blue" 
							content="Launch Experiment"
							onClick={() => submitJob(builder.getIn(['dataset', 'item', '_id']), builder.getIn(['algorithm', '_id']), builder.get('params'))}
						/>
						<Button color="grey" onClick={() => resetParams()}>Reset</Button>
					</div>
					) : (
						<Header inverted size='small'>
							The specified dataset does not exist.
						</Header>
					)};
			</div>
		);
	}
}

function mapStateToProps(state) {
	return {
		isFetching: state.preferences.get('isFetching'),
		algorithms: state.preferences.getIn(['preferences', 'Algorithms']),
		datasets: state.datasets.get('items'),
		builder: state.builder
	};
}

function mapDispatchToProps(dispatch) {
	return {
		fetchDataset: bindActionCreators(fetchDataset, dispatch),
		setDataset: bindActionCreators(setDataset, dispatch),
		setAlgorithm: bindActionCreators(setAlgorithm, dispatch),
		setParamValue: bindActionCreators(setParamValue, dispatch),
		submitJob: bindActionCreators(submitJob, dispatch),
		resetParams: bindActionCreators(resetParams, dispatch)
	};
}

export const BuilderContainer = connect(mapStateToProps, mapDispatchToProps)(Builder);