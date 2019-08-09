import React, { Component } from 'react';
import { connect } from 'react-redux';
import SceneHeader from '../../../SceneHeader';
import { Header, Button, Segment, Input, Popup } from 'semantic-ui-react';

class FileInputField extends Component {

  constructor(props) {
    super(props);
    this.state = {
      fileFormStuff: 'stuff'
    };
    this.fakeFileClick = this.fakeFileClick.bind(this);
  }

  componentDidMount() {
  }

  fakeFileClick(e) {
    //const { openFileTypePopup, selectedFileCallback } = this.props;
    window.console.log('fake file upload click');
    document.getElementById("hidden-file-input-for-upload-form").click();
  }

  render() {
    const { openFileTypePopup, selectedFileCallback } = this.props;
    let openFileTypePop = false;
    let fileInputElem = (
      <Input
        style={{width: '65%', backgroundColor: '#2185d0', borderRadius: '.28571429rem'}}
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
    // let fileInputElem = (
    //   <Button
    //     style={{width: '65%'}}
    //     onClick={(e) => this.fakeFileClick(e)}
    //     label={
    //       <div style={
    //         {
    //           color: 'white',
    //           paddingRight: '10px',
    //           paddingLeft: '5px',
    //           backgroundColor: '#2185d0',
    //           borderRadius: '.28571429rem'
    //         }
    //       }>
    //         <p>
    //           Please select new dataset
    //           <br/>
    //           Supported file types: (<i>csv, tsv</i>)
    //         </p>
    //       </div>
    //     }
    //     labelPosition="left"
    //     id="upload_dataset_file_browser_button"
    //     content="Choose File"
    //   />
    // );

    return (
      <div>
        <Popup
          open={openFileTypePopup}
          header="Please check file type"
          content="Unsupported file extension detected"
          trigger={fileInputElem}
        />
        <input
          id="hidden-file-input-for-upload-form"
          style={{display: 'none'}}
          type="file"
          onClick={selectedFileCallback}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({

});

export { FileInputField };
export default connect(mapStateToProps)(FileInputField);
