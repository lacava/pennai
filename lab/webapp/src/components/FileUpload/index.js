import { connect } from 'react-redux';
import React, { Component } from 'react';
import FileUploadForm from './components/FileUploadForm'

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
