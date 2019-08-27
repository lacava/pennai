//require('es6-promise').polyfill();
//import fs = require('fs');
import fetch from 'isomorphic-fetch';
import { connect } from 'react-redux';
import React, { Component } from 'react';
import { getSortedDatasets } from '../../data/datasets';
import { fetchDatasets } from '../../data/datasets/actions';
import { uploadDataset } from '../../data/datasets/dataset/actions';
import FileUploadForm from './components/FileUploadForm'
import SceneHeader from '../SceneHeader';
import SortableList from './components/SortableList';
import { put } from '../../utils/apiHelper';
import Papa from 'papaparse';
import {
  Button,
  Input,
  Form,
  Segment,
  Table,
  Popup,
  Checkbox,
  Header,
  Accordion,
  Icon,
  Label,
  Dropdown,
  Modal
} from 'semantic-ui-react';

class FileUpload extends Component {
  /**
 * FileUpload reac component - UI form for uploading datasets
 * @constructor
 */
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <FileUploadForm />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  dataset: state.dataset
});

export { FileUpload };
export default connect(mapStateToProps, { })(FileUpload);
