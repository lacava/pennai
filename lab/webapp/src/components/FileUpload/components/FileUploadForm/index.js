import React, { Component } from 'react';
import { connect } from 'react-redux';
import SceneHeader from '../../../SceneHeader';
import FileInputField from '../FileInputField';
import { Header, Form, Segment } from 'semantic-ui-react';
import Papa from 'papaparse';

class FileUploadForm extends Component {

  constructor(props) {
    super(props);
    this.state = {
      fileFormStuff: 'stuff',
      selectedFile: null,
      openFileTypePopup: false
    };
    this.handleSelectedFile = this.handleSelectedFile.bind(this);
  }

  componentDidMount() {
  }

  /**
  * Callback for handling selected file, pass to child component
  */
  handleSelectedFile = event => {
    window.console.log('got file', event.target.files);
    const fileExtList = ['csv', 'tsv'];
    let papaConfig = {
      header: true,
      preview: 5,
      complete: (result) => {
        //window.console.log('preview of uploaded data: ', result);
        this.setState({datasetPreview: result});
      }
    };

    // check for selected file
    if(event.target.files && event.target.files[0]) {
      // immediately try to get dataset preview on file input html element change
      // need to be mindful of garbage data/files
      //console.log(typeof event.target.files[0]);
      //console.log(event.target.files[0]);
      let uploadFile = event.target.files[0]
      let fileExt = uploadFile.name.split('.').pop();

      //Papa.parse(event.target.files[0], papaConfig);
      // check file extensions
      if (fileExtList.includes(fileExt)) {
        // use try/catch block to deal with potential bad file input when trying to
        // generate file/csv preview, use filename to check file extension
        try {
          Papa.parse(uploadFile, papaConfig);
        }
        catch(error) {
          console.error('Error generating preview for selected file:', error);
          this.setState({
            selectedFile: undefined,
            errorResp: JSON.stringify(error),
            datasetPreview: null,
            openFileTypePopup: false,
            dependentCol: '',
            catFeatures: '',
            ordinalFeatures: '',
            ordKeys: []
          });
        }
        // set state with file preview if parse successful, reset form input
        this.setState({
          selectedFile: event.target.files[0],
          errorResp: undefined,
          datasetPreview: null,
          openFileTypePopup: false,
          dependentCol: '',
          catFeatures: '',
          ordinalFeatures: '',
          ordKeys: []
        });
      } else {
        // reset state as fallback if no file type is not supported
        console.warn('Filetype not csv or tsv:', uploadFile);
        this.setState({
          selectedFile: null,
          datasetPreview: null,
          errorResp: undefined,
          openFileTypePopup: true,
          dependentCol: '',
          catFeatures: '',
          ordinalFeatures: '',
          ordKeys: []
        });
      }
    } else {
      // reset state as fallback if no file selected
      this.setState({
        selectedFile: null,
        datasetPreview: null,
        errorResp: undefined,
        openFileTypePopup: false,
        dependentCol: '',
        catFeatures: '',
        ordinalFeatures: '',
        ordKeys: []
      });
    }
  }

  render() {
    const { propStuff, selectedFile } = this.props;
    const { openFileTypePopup } = this.state;
    return (
      <div>
        <SceneHeader header="Upload Datasets"/>
        <Form inverted>
          <Segment className="file-upload-segment">
            <FileInputField
              selectedFileCallback={this.handleSelectedFile}
              openFileTypePopup={openFileTypePopup}
            />
            <h1 style={{color: 'purple'}} >
              depCol
            </h1>
            <h1 style={{color: 'yellow'}} >
              cat features
            </h1>
            <h1 style={{color: 'red'}} >
              ordinal features
            </h1>
          </Segment>
        </Form>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({

});

export { FileUploadForm };
export default connect(mapStateToProps)(FileUploadForm);
