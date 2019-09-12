import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fetchDatasets } from '../../../../data/datasets/actions';
import { uploadDataset } from '../../../../data/datasets/dataset/actions';
import SceneHeader from '../../../SceneHeader';
import FileInputField from '../FileInputField';
import AccordionFormInput from '../AccordionFormInput';
import DependentColumnInput from '../DependentColumnInput';
import CategoricalFeatInput from '../CategoricalFeatInput';
import OrdinalFeatInput from '../OrdinalFeatInput';
import OrdinalDropdown from '../OrdinalDropdown';
import DataTablePreview from '../DataTablePreview';
import { Header, Form, Segment, Popup, Button } from 'semantic-ui-react';
import Papa from 'papaparse';

class FileUploadForm extends Component {

  constructor(props) {
    super(props);
    this.state = {
      fileFormStuff: 'stuff',
      selectedFile: null,
      activeAccordionIndexes: [],
      openFileTypePopup: false,
      datasetPreview: null,
      dependentCol: '',
      catFeatures: '',
      ordinalFeatures: {},
      showOrdModal: false,
      currentSelection: []
    };

    this.getDataKeys = this.getDataKeys.bind(this);
    this.handleSelectedFile = this.handleSelectedFile.bind(this);
    this.depColDropDownClickHandler = this.depColDropDownClickHandler.bind(this);
    this.catDropDownClickHandler = this.catDropDownClickHandler.bind(this);
    this.ordDropDownClickHandler = this.ordDropDownClickHandler.bind(this);
    this.ordModalClose = this.ordModalClose.bind(this);
    this.updateOrdFeatFromModlCallback = this.updateOrdFeatFromModlCallback.bind(this);

    this.getSelectDropDown = this.getSelectDropDown.bind(this);
  }

  componentDidMount() {
  }

  /**
  * Get list of keys/column names from data preview
  * @returns {Array} - column names/keys
  */
  getDataKeys() {
    const { datasetPreview } = this.state;
    let dataKeys = [];
    if(datasetPreview) {
      //dataKeys = Object.keys(datasetPreview);
      dataKeys = datasetPreview.meta.fields;
    }
    return dataKeys;
  }

  /**
  * Select from available column keys, store in comma seperated list of categorical
  * features
  */
  catDropDownClickHandler(e, d) {
    const { catFeatures, dependentCol, ordinalFeatures } = this.state;
    window.console.log('catDropDownClickHandler');
    let tempKeys = this.getDataKeys();
    //let selectedKey = d.text;
    //let selectedKey = e.target.innerText;
    // get list of all selected options
    // https://stackoverflow.com/questions/5866169/how-to-get-all-selected-values-of-a-multiple-select-box
    let dropdownOptions = e.target.options;
    let selectedOpts = [];
    for(var opt in dropdownOptions) {
      dropdownOptions[opt].selected && dropdownOptions[opt].value !== "" ? selectedOpts.push(dropdownOptions[opt].value) : null;
    }
    window.console.log('selectedOpts (before checking other fields): ', selectedOpts);

    let selectedKey = e.target.value;
    let catFeatList;
    let ordKeysList = [];
    // if categorical features is not empty, try to split on comma
    catFeatures !== '' ? catFeatList = catFeatures.split(',') : catFeatList = [];
    // keep track of if currently selected category is already in list
    let catIndex = catFeatList.indexOf(selectedKey);
    // if category already in list, remove it, else add it
    catIndex > -1 ? catFeatList.splice(catIndex, 1) : catFeatList.push(selectedKey);


    if(typeof ordinalFeatures !== 'string' && this.isJson(ordinalFeatures)) {
      ordKeysList = Object.keys(ordinalFeatures);
    } else if(ordinalFeatures !== ""){ // else try to parse and get keys
      let tempObj;
      try {
          tempObj = JSON.parse(ordinalFeatures);
          ordKeysList = Object.keys(tempObj);
      } catch (e) {
          window.console.error(' uh o ----> ', e);
          //return false;
      }
    }

    //let inDepCol = catFeatList.includes(dependentCol);
    let inDepCol = selectedOpts.includes(dependentCol);

    if (inDepCol) {
      let depColIndex = selectedOpts.indexOf(dependentCol);
      depColIndex > -1 ? selectedOpts.splice(depColIndex, 1) : null;
    }
    ordKeysList.forEach(ordKey => {
      let ordFeatIndex = selectedOpts.indexOf(ordKey);
      ordFeatIndex > -1 ? selectedOpts.splice(ordFeatIndex, 1) : null;
    })

    // let inOrdinalFeatures = ordKeysList.includes(selectedKey);
    // let catFeatIndex = tempSelection.indexOf(selectedKey);
    //
    // if(catFeatIndex === -1 && !inDepCol && !inOrdinalFeatures) {
    //   tempSelection.push(selectedKey)
    // } else if (inOrdinalFeatures) {
    //   let ordFeatIndex = selectedOpts.indexOf(selectedKey);
    //   ordFeatIndex > -1 ? selectedOpts.splice(ordFeatIndex, 1) : null;
    // }

    //window.console.log('currentSelection: ', tempSelection);
    //window.console.log('catFeatList: ', catFeatList);
    window.console.log('selectedOpts (after checking other fields): ', selectedOpts);
    this.setState({
      catFeatures: selectedOpts.join()
    });
  }

  /**
  * simple click handler for selecting dependent column
  */
  depColDropDownClickHandler(e, d) {
    const { dependentCol, catFeatures, ordinalFeatures} = this.state;

    let userInput = e.target.innerText;
    let ordKeysList = [];

    // check other keys to see if already used for other options
    if(typeof ordinalFeatures !== 'string' && this.isJson(ordinalFeatures)) {
      ordKeysList = Object.keys(ordinalFeatures);
    } else if(ordinalFeatures !== ""){ // else try to parse and get keys
      let tempObj;
      try {
          tempObj = JSON.parse(ordinalFeatures);
          ordKeysList = Object.keys(tempObj);
      } catch (e) {
          window.console.error(' uh o ----> ', e);
          //return false;
      }
    }
    let inOrdFeats = ordKeysList.includes(userInput);

    let catFeatList;
    catFeatures !== '' && catFeatures.includes(',')
      ? catFeatList = catFeatures.split(',')
      : catFeatList = [catFeatures];
    let inCatFeats = catFeatList.includes(userInput);
    window.console.log('dependentCol: ', dependentCol);
    // only set state if new user input not being used in other fields
    if(!inOrdFeats && !inCatFeats) {
      this.setState({
        dependentCol: userInput
      });
    }
  }

  updateOrdFeatFromModlCallback(newOrdFeats) {
    this.setState({
      ordinalFeatures: newOrdFeats
    });
  }

  ordDropDownClickHandler_ORIGINAL(e, d) {
    const { datasetPreview, ordinalFeatures } = this.state;

    let selectedKey = e.target.innerText;
    let tempOrdKeys = [];
    let oldOrdFeats = {};

    let dropdownOptions = e.target.options;
    let selectedOpts = [];
    for(var opt in dropdownOptions) {
      dropdownOptions[opt].selected && dropdownOptions[opt].value !== "" ? selectedOpts.push(dropdownOptions[opt].value) : null;
    }
    window.console.log('selectedOpts for ordinal', selectedOpts);
    // if ordinalFeatures is proper json, can get keys
    if(typeof ordinalFeatures !== 'string' && this.isJson(ordinalFeatures)) {
     tempOrdKeys = Object.keys(ordinalFeatures);
     // keep track of previously selected ordinal keys - will either add or remove
     // current user selection
     oldOrdFeats = ordinalFeatures;
    } else if(ordinalFeatures !== ""){ // else try to parse and get keys
     window.console.log('trying to parse', ordinalFeatures);
     let tempObj;
     try {
         tempObj = JSON.parse(ordinalFeatures);
         oldOrdFeats = tempObj;
         tempOrdKeys = Object.keys(tempObj)
     } catch (e) {
         window.console.error(' uh o ----> ', e);
         //return false;
     }
    }

    let tempOrdFeats = {};
    let ordIndex = tempOrdKeys.indexOf(selectedKey);
    // keep track of currently selected ordinal feature(s)
    ordIndex > -1 ? tempOrdKeys.splice(ordIndex, 1) : tempOrdKeys.push(selectedKey);
    tempOrdKeys.forEach(ordKey => {
     let tempVals = [];
     datasetPreview.data.forEach(row => {
       //tempOrdFeats[ordKey] = row[ordKey];
       let oldOrdKeys = Object.keys(oldOrdFeats);

       if(oldOrdKeys.includes(ordKey)) {
         tempVals = oldOrdFeats[ordKey];
       } else {
         !tempVals.includes(row[ordKey]) && row[ordKey] ? tempVals.push(row[ordKey]) : null;
       }
     })
     tempOrdFeats[ordKey] = tempVals;
    });
    window.console.log('temp ord feats list for dropdown', tempOrdFeats);
    this.setState({
     ordKeys: tempOrdKeys,
     ordinalFeatures: tempOrdFeats,
     showOrdModal: true
    });
  }

  ordDropDownClickHandler(e, d) {
    const { datasetPreview, ordinalFeatures, dependentCol, catFeatures } = this.state;

    let selectedKey = e.target.innerText;
    let tempOrdKeys = [];
    let oldOrdFeats = {};

    let dropdownOptions = e.target.options;
    let selectedOpts = [];
    for(var opt in dropdownOptions) {
      dropdownOptions[opt].selected && dropdownOptions[opt].value !== "" ? selectedOpts.push(dropdownOptions[opt].value) : null;
    }
    window.console.log('selectedOpts for ordinal (before checking other fields)', selectedOpts);
    // if ordinalFeatures is proper json, can get keys
    if(typeof ordinalFeatures !== 'string' && this.isJson(ordinalFeatures)) {
     tempOrdKeys = Object.keys(ordinalFeatures);
     // keep track of previously selected ordinal keys - will either add or remove
     // current user selection
     oldOrdFeats = ordinalFeatures;
    } else if(ordinalFeatures !== ""){ // else try to parse and get keys
     window.console.log('trying to parse', ordinalFeatures);
     let tempObj;
     try {
         tempObj = JSON.parse(ordinalFeatures);
         oldOrdFeats = tempObj;
         tempOrdKeys = Object.keys(tempObj)
     } catch (e) {
         window.console.error(' uh o ----> ', e);
         //return false;
     }
    }
    // if one of currently selected option is used as dependentCol, can not use
    // that input for ordinal features
    let inDepCol = selectedOpts.includes(dependentCol);
    if(inDepCol) {
      let depColIndex = selectedOpts.indexOf(selectedKey);
      depColIndex > -1 ? selectedOpts.splice(depColIndex, 1) : null;
    }
    // convert currently selected options list and categorical_features list in react state
    // to Sets and get intersection - if intersection is not empty remove those items
    // i.e prevent user from selecting option already in use elsewhere
    // if categorical features is not empty, try to split on comma
    let catFeatList;
    catFeatures !== '' && catFeatures.includes(',')
      ? catFeatList = catFeatures.split(',')
      : catFeatList = [catFeatures];
    let catSet = new Set(catFeatList);
    let ordOptSet = new Set(selectedOpts);
    let catOrdOverlap = this.getIntersection(catSet, ordOptSet);
    window.console.log('catOrdOverlap', catOrdOverlap);

    catOrdOverlap.forEach(opt => ordOptSet.delete(opt));
    window.console.log('selectedOpts for ordinal (after checking other fields)', Array.from(ordOptSet));
    //let inCategorical = selectedOpts.includes(dependentCol);

    let tempOrdFeats = {};
    let ordIndex = tempOrdKeys.indexOf(selectedKey);
    // keep track of currently selected ordinal feature(s)
    ordIndex > -1 ? tempOrdKeys.splice(ordIndex, 1) : tempOrdKeys.push(selectedKey);
    tempOrdKeys.forEach(ordKey => {
     let tempVals = [];
     datasetPreview.data.forEach(row => {
       //tempOrdFeats[ordKey] = row[ordKey];
       let oldOrdKeys = Object.keys(oldOrdFeats);

       if(oldOrdKeys.includes(ordKey)) {
         tempVals = oldOrdFeats[ordKey];
       } else {
         !tempVals.includes(row[ordKey]) && row[ordKey] ? tempVals.push(row[ordKey]) : null;
       }
     })
     tempOrdFeats[ordKey] = tempVals;
    });
    let tempOrdFeatsTest = {};
    Array.from(ordOptSet).forEach(ordKey => {
     let tempVals = [];
     datasetPreview.data.forEach(row => {
       //tempOrdFeats[ordKey] = row[ordKey];
       let oldOrdKeys = Object.keys(oldOrdFeats);

       if(oldOrdKeys.includes(ordKey)) {
         tempVals = oldOrdFeats[ordKey];
       } else {
         !tempVals.includes(row[ordKey]) && row[ordKey] ? tempVals.push(row[ordKey]) : null;
       }
     })
     tempOrdFeatsTest[ordKey] = tempVals;
    });
    window.console.log('temp ord feats list for dropdown', tempOrdFeatsTest);
    this.setState({
     ordKeys: tempOrdKeys,
     ordinalFeatures: tempOrdFeatsTest,
     showOrdModal: true
    });
  }

  /**
  * use to close popup when select
  */
  ordModalClose() {
    this.setState({ showOrdModal: false });
  }

   /**
   * Callback for handling selected file, pass to child component
   */
   handleSelectedFile = event => {
     //window.console.log('got file', event.target.files);
     const fileExtList = ['csv', 'tsv'];
     let papaConfig = {
       header: true,
       complete: (result) => {
         window.console.log('preview of uploaded data: ', result);
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

   /**
    * Helper method to consolidate user input to send with file upload form
    * @returns {FormData} - FormData object containing user input data
    */
   generateFileData = () => {
     const data = new FormData();
     this.setState({errorResp: undefined});
     let depCol = this.state.dependentCol;
     let ordFeatures = this.state.ordinalFeatures;
     let catFeatures = this.state.catFeatures;
     let selectedFile = this.state.selectedFile;
     let tempOrdinalFeats = '';
     if(selectedFile && selectedFile.name) {

       // try to parse ord features input as JSON if not empty
       if(ordFeatures !== '' ) {
         try {
           // only try to parse input with JSON.parse() if string
           if(typeof ordFeatures === 'string') {
             tempOrdinalFeats = JSON.parse(ordFeatures);
           } else if(this.isJson(ordFeatures)) {
             tempOrdinalFeats = ordFeatures;
           }
         } catch(e) {
           // if expecting oridinal stuff, return error to stop upload process
           return { errorResp: e.toString() };
         }
       }

       if(catFeatures !== '') {
         // remove all whitespace
         catFeatures = catFeatures.replace(/ /g, '');
         // parse on comma
         catFeatures = catFeatures.split(',');
         // if input contains empty items - ex: 'one,,two,three'
         // filter out resulting empty item
         catFeatures = catFeatures.filter(item => {
           return item !== ''
         })
       }

       // keys specified for server to upload repsective fields
       let metadata =  JSON.stringify({
                 'name': this.state.selectedFile.name,
                 'username': 'testuser',
                 'timestamp': Date.now(),
                 'dependent_col' : depCol,
                 'categorical_features': catFeatures,
                 'ordinal_features': tempOrdinalFeats
               });

       data.append('_metadata', metadata);
       data.append('_files', this.state.selectedFile);

     } else {
       window.console.log('no file available');
     }

     return data;
   }

   /**
    * Starts download process, takes user input, creates a request payload (new html Form)
    * and sends data to server through redux action, uploadDataset, which is a promise.
    * When promise resolves update UI or redirect page depending on success/error.
    * Upon error display error message to user, on success redirect to dataset page
    * @returns {void} - no return value
    */
   handleUpload = () => {
     const { uploadDataset } = this.props;
     // only attempt upload if there is a selected file with a filename
     if(this.state.selectedFile && this.state.selectedFile.name) {
       let data = this.generateFileData(); // should be FormData
       // if trying to create FormData results in error, don't attempt upload
       if (data.errorResp) {
         this.setState({errorResp: data.errorResp});
       } else {
         // after uploading a dataset request new list of datasets to update the page
         window.console.log('uploading data', data);
         uploadDataset(data).then(stuff => {
           //window.console.log('FileUpload props after download', this.props);


           //let resp = Object.keys(this.props.dataset.fileUploadResp);
           let resp = this.props.dataset.fileUploadResp;
           let errorRespObj = this.props.dataset.fileUploadError;

           // if no error message and successful upload (indicated by presence of dataset_id)
           // 'refresh' page when upload response from server is not an error and
           // redirect to dataset page, when error occurs set component state
           // to display popup containing server/error response
           if (!errorRespObj && resp.dataset_id) {
             this.props.fetchDatasets();
             window.location = '#/datasets';
           } else {
             this.setState({
                errorResp: errorRespObj.errorResp.error || "Something went wrong"
               })
           }
         });
       }


     } else {
       window.console.log('no file available');
       this.setState({
         errorResp: 'No file available'
       });
     }

   }

   /*
   * Basic helper to test for JSON
   * https://stackoverflow.com/questions/9804777/how-to-test-if-a-string-is-json-or-not
   */
   isJson(item) {
       item = typeof item !== 'string'
           ? JSON.stringify(item)
           : item;

       try {
           item = JSON.parse(item);
       } catch (e) {
           return false;
       }

       if (typeof item === 'object' && item !== null) {
           return true;
       }

       return false;
   }

   // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
   getIntersection(setA, setB) {
       var _intersection = new Set();
       for (var elem of setB) {
           if (setA.has(elem)) {
               _intersection.add(elem);
           }
       }
       return _intersection;
   }

   /****************************************************************************/
   /*        Helper methods to create inputs & form elements                   */
   /****************************************************************************/

   /**
   * create dropdown menu of data column dataKeys, pass in callback for each item
   */
   getDropDown() {
       //window.console.log('making dropdown');
       let tempKeys = this.getDataKeys();
       let dropDownObjList = [];
       tempKeys.forEach((key, i) =>{
           dropDownObjList.push({
             key: key + '_' + i,
             value: key,
             text: key
           })
         }
       );
       return dropDownObjList;
   }

   getSelectDropDown() {
     let tempKeys = this.getDataKeys();
     let dropDownObjList = [];
     tempKeys.forEach((key, i) =>{
         dropDownObjList.push(
           <option
            key={key + '_' + i}
            value={key}
           >
            {key}
           </option>
         )
       }
     );
     return dropDownObjList;
   }


  render() {

    const {
      openFileTypePopup,
      selectedFile,
      dependentCol,
      errorResp,
      catFeatures,
      ordinalFeatures,
      showOrdModal,
      datasetPreview
    } = this.state;

    let errorContent;
    let depColDropdown = this.getDropDown();
    let catDropdown = this.getDropDown();
    let catDropdownTest = this.getSelectDropDown();
    let ordDropdownTest = this.getSelectDropDown();
    let ordDropdown = this.getDropDown();
    // default to hidden until a file is selected, then display input areas
    let formInputClass = "file-upload-form-hide-inputs";

    // check if file with filename has been selected, if so then use css to show form
    selectedFile && selectedFile.name
      ? formInputClass = "file-upload-form-show-inputs" : null;

    if (errorResp) {
      errorContent = ( <p style={{display: 'block'}}> {errorResp} </p> );
      window.setTimeout(this.errorPopupTimeout, 4555);
    }

    // let accordionStuff = [
    //     (
    //       <CategoricalFeatInput
    //         catFeatCallback={this.catDropDownClickHandler}
    //         catDropdown={catDropdown}
    //         catDropdownTest={catDropdownTest}
    //         catFeatures={catFeatures}
    //       />
    //     ),
    //     (
    //       <OrdinalFeatInput
    //         ordDropdown={ordDropdown}
    //         ordinalFeatures={ordinalFeatures}
    //         showOrdModal={showOrdModal}
    //         ordDropDownClickHandler={this.ordDropDownClickHandler}
    //         updateOrdFeatFromModlCallback={this.updateOrdFeatFromModlCallback}
    //         ordModalCloseCallback={this.ordModalClose}
    //         ordDropdownTest={ordDropdownTest}
    //       />
    //     )
    // ];

    let accordionStuff = [
        (
          <CategoricalFeatInput
            catFeatCallback={this.catDropDownClickHandler}
            catDropdown={catDropdown}
            catDropdownTest={catDropdownTest}
            catFeatures={catFeatures}
          />
        ),
        (
          <OrdinalDropdown
            ordDropdown={ordDropdown}
            ordinalFeatures={ordinalFeatures}
            showOrdModal={showOrdModal}
            ordDropDownClickHandler={this.ordDropDownClickHandler}
            updateOrdFeatFromModlCallback={this.updateOrdFeatFromModlCallback}
            ordModalCloseCallback={this.ordModalClose}
            ordDropdownTest={ordDropdownTest}
          />
        )
    ];

    return (
      <div>
        <SceneHeader header="Upload Datasets"/>
        <Form inverted>
          <Segment className="file-upload-segment">
            <FileInputField
              selectedFileCallback={this.handleSelectedFile}
              openFileTypePopup={openFileTypePopup}
            />
            <div
              id="file-upload-form-input-area"
              className={formInputClass}
            >
              <DependentColumnInput
                depColDropdown={depColDropdown}
                depColCallback={this.depColDropDownClickHandler}
                dependentCol={dependentCol}
              />
              <AccordionFormInput
                accordionStuff={accordionStuff}
              />
              <Popup
                header="Error Submitting Dataset"
                content={errorContent}
                open={errorResp ? true : false}
                id="file_upload_popup_and_button"
                position='bottom left'
                flowing
                trigger={
                  <Button
                    inverted
                    color="blue"
                    compact
                    size="small"
                    icon="upload"
                    content="Upload Dataset"
                    onClick={this.handleUpload}
                  />
                }
              />
            </div>
          </Segment>
        </Form>
        <DataTablePreview
          dataPrev={datasetPreview}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  dataset: state.dataset
});

export { FileUploadForm };
export default connect(mapStateToProps, { fetchDatasets, uploadDataset })(FileUploadForm);
