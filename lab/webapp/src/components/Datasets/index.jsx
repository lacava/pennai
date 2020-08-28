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
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getSortedDatasets } from 'data/datasets';
import { fetchDatasets } from 'data/datasets/actions';
import { fetchRecommender } from 'data/recommender/actions';
import SceneHeader from '../SceneHeader';
import FileUpload from '../FileUpload';
import ResponsiveGrid from '../ResponsiveGrid';
import DatasetCard from './components/DatasetCard';
import FetchError from '../FetchError';
import { Header, Loader } from 'semantic-ui-react';


/**
* This is the main 'Datasets' page - contains button to add/upload new datasets
* and 0 or more dataset 'cards' with info about each dataset and UI for interacting
* with each dataset: toggle AI recommender, view current experiment status, or build
* new experiment
*/
class Datasets extends Component {
  /**
  * react lifecycle method, when component is done loading, after it is mounted in
  * DOM, use dataset action creator, fetchDatasets, to request retrieval of all
  * datasets
  */
  componentDidMount() {
    this.props.fetchDatasets();
    this.props.fetchRecommender();
  }

  render() {
    const { datasets, recommender, isFetching, error, fetchDatasets, fetchRecommender } = this.props;

    if(isFetching) {
      return (
        <Loader active inverted size="large" content="Retrieving your datasets..." />
      );
    }

    if(error) {
      return (
        <FetchError
          message={datasets.error}
          onRetry={() => fetchDatasets()}
        />
      );
    }

    return (
      <div>
        {/*<FileUpload />*/}
        <SceneHeader header="Datasets" btnText="Add new" btnIcon="plus" linkText='/upload_datasets' />
        {datasets.length > 0 ? (
          <ResponsiveGrid mobile={1} tablet={2} desktop={3} lgscreen={4}>
            {datasets.map(dataset => (
              <DatasetCard
                key={dataset._id}
                recommender={recommender}
                dataset={dataset}
              />
            ))}
          </ResponsiveGrid>
        ) : (
          <Header inverted size="small" content="You have no datasets uploaded yet." />
        )}
      </div>
    );
  }
}

const mapDispatchToProps = {
  fetchDatasets,
  fetchRecommender
}

const mapStateToProps = (state) => ({
  datasets: getSortedDatasets(state),
  recommender: state.recommender.data,
  isFetching: state.datasets.isFetching,
  error: state.datasets.error
});

export { Datasets };
export default connect(mapStateToProps, mapDispatchToProps)(Datasets);
