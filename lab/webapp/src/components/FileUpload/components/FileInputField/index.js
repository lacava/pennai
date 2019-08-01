import React, { Component } from 'react';
import { connect } from 'react-redux';
import SceneHeader from '../../../SceneHeader';
import { Header, Form, Segment, Input, Popup } from 'semantic-ui-react';

class FileInputField extends Component {

  constructor(props) {
    super(props);
    this.state = {
      fileFormStuff: 'stuff'
    };
  }

  componentDidMount() {
  }

  /**
   * Event handler for selecting files, takes user file from html file input, stores
   * selected file in component react state, generates file preview and stores that
   * in the state as well. If file is valid does the abovementioned, else error
   * is generated
   * @param {Event} event - DOM Event from user interacting with UI text field
   * @returns {void} - no return value
   */
  handleSelectedFile = event => {
    const fileExtList = ['csv', 'tsv'];

  }

  render() {
    const { openFileTypePopup, selectedFileCallback } = this.props;
    //let openFileTypePop = false;
    let fileInputElem = (
      <Input
        style={{width: '65%', backgroundColor: '#2185d0'}}
        type="file"
        label={
          <div style={{color: 'white', paddingRight: '10px', paddingLeft: '5px'}}>
            <p>Please select new dataset
            <br/>
            Supported file types: (<i>csv, tsv</i>)</p>
          </div>
        }
        id="upload_dataset_file_browser_button"
        onChange={selectedFileCallback}
      />
    );

    return (
      <div>
        <SceneHeader header="Upload Datasets"/>
        <Popup
          open={openFileTypePopup}
          header="Please check file type"
          content="Unsupported file extension detected"
          trigger={fileInputElem}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({

});

export { FileInputField };
export default connect(mapStateToProps)(FileInputField);
