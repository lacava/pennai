import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from './data/actions';
import { 
  getAllDatasets, 
  getIsFetching, 
  getErrorMessage 
} from './data';
import SceneWrapper from '../SceneWrapper';
import Datasets from './Datasets';

class DatasetsContainer extends Component {
  componentDidMount() {
    this.props.fetchDatasets();
  }

  render() {
    return (
      <SceneWrapper 
        headerContent="Datasets"
        btnContent="Add new"
        btnIcon="plus"
      >
        <Datasets {...this.props} />
      </SceneWrapper>
    );
  }
}

const mapStateToProps = (state) => ({
  datasets: getAllDatasets(state),
  isFetching: getIsFetching(state),
  errorMessage: getErrorMessage(state)
});

export default connect(
  mapStateToProps, 
  actions
)(DatasetsContainer);