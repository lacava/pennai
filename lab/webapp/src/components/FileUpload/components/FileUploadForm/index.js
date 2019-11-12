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
import PlainDropdown from '../PlainDropdown';
import PlainCategoryDropdown from '../PlainCategoryDropdown';
import PlainDependentDropdown from '../PlainDependentDropdown';
import PlainOrdinalDropdown from '../PlainOrdinalDropdown';
import { Header, Form, Segment, Popup, Button } from 'semantic-ui-react';
import Papa from 'papaparse';

/**
*  Parent component for dataset/file upload form
*   - use list of columns from selected file/dataset to get list of keys, these
*     keys are used as options in the form fields
*   - keep track of user selected keys in react state
*   - each field/input type is managed as separate list of keys
*   - desired behavior: options of different fields are mutually exclusive
*     (can only select keys per field/type)
*/
class FileUploadForm extends Component {

  constructor(props) {
    super(props);
    //
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
      currentSelection: [],
      freeKeys: []
    };

    this.getFreeKeys = this.getFreeKeys.bind(this);
    this.getDataKeys = this.getDataKeys.bind(this);
    this.handleSelectedFile = this.handleSelectedFile.bind(this);
    this.ordModalClose = this.ordModalClose.bind(this);
    this.updateOrdFeatFromModlCallback = this.updateOrdFeatFromModlCallback.bind(this);

    this.depColbasicHandler = this.depColbasicHandler.bind(this);
    this.catColbasicHandler = this.catColbasicHandler.bind(this);
    this.ordColbasicHandler = this.ordColbasicHandler.bind(this);
    this.getSelectDropDown = this.getSelectDropDown.bind(this);
  }

  /**
  * Basic click handler for selecting dependent column - can only accept one value.
  * As such, first step involves checking for previously selected dep col in order
  * to 'clear' the old value from currentSelection. Then check new user input against
  * currentSelection. Then use currentSelection to determine which keys are 'free'
  * or otherwise available for use in other options/dropdowns
  */
  depColbasicHandler(e, d) {
    const { dependentCol, currentSelection, freeKeys } = this.state;
    // react state has previous user input, i.e. 'old' values, 'new' user input
    // is from html form field event
    let userInput = e.target.value;
    let currentSelectionCopy = [...currentSelection]; // keep track of which options are selected in entire form
    window.console.log('depColbasicHandler - old currentSelectionCopy ', currentSelectionCopy);
    // check previous value of dependentCol, if present remove from currentSelection
    let oldIndex = currentSelectionCopy.indexOf(dependentCol);
    oldIndex > -1 ? currentSelectionCopy.splice(oldIndex, 1) : null;
    //window.console.log('depColbasicHandler', userInput);
    // is currently selected dependent column option (new user input) already in use
    let currSelIndex = currentSelectionCopy.indexOf(userInput);
    // if new input in current selection, remove it, otherwise add it
    currSelIndex > -1 ? currentSelectionCopy.splice(currSelIndex, 1) : currentSelectionCopy.push(userInput);
    window.console.log('depColbasicHandler - new currentSelectionCopy ', currentSelectionCopy);
    //window.console.log('currentSelectionCopy', currentSelectionCopy);
    let tempKeys = this.getDataKeys(); // from given file/dataset metadata field
    //window.console.log('depColbasicHandler - old freeKeys ', freeKeys);
    // generate set of 'free' keys, i.e. everything not in currentSelection
    let tempFreeKeys = tempKeys.filter(key => !currentSelectionCopy.includes(key));
    //window.console.log('depColbasicHandler - new freeKeys ', tempFreeKeys);
    window.console.log('tempFreeKeys', tempFreeKeys)
    this.setState({
      dependentCol: userInput,
      currentSelection: currentSelectionCopy,
      freeKeys: tempFreeKeys
    });
  }

  /**
  * Slightly more complicated click handler for selecting categorical features
  * Can accept multiple values, similar process to managing keys as in click handler
  * function for dependent column - depColbasicHandler except need to manage one
  * or more user selected option
  */
  catColbasicHandler(e, d) {
    const { currentSelection, catFeatures } = this.state;
    let currentSelectionCopy = [...currentSelection];
    let dropdownOptions = e.target.options;
    let tempKeys = this.getDataKeys();
    //window.console.log('catColbasicHandler', dropdownOptions);
    window.console.log('catColbasicHandler - old currentSelectionCopy ', currentSelectionCopy);
    //window.console.log('catColbasicHandler - old freeKeys ', freeKeys);

    // check previous values of any selected categorical features in react state
    // (before handling current user input), if any previous options are in currentSelection
    // then remove them - attempting to 'reset' currentSelection by clearing it of old values
    let oldCats = catFeatures.split(",");
    if(oldCats.length && oldCats[0] !== ""){
      oldCats.forEach(cat => {
        let tempI = currentSelectionCopy.indexOf(cat);
        tempI > -1 ? currentSelectionCopy.splice(tempI, 1) : null;
      })
    }

    let selectedOpts = [];
    // check user input (list of selected options) against current selection, only
    // process valid options which are free/not in use. dropdownOptions from html
    // select field - event target options is list of every available key for this field
    for(var opt in dropdownOptions) {
      let optVal = dropdownOptions[opt].value;
      let optSelected = dropdownOptions[opt].selected;
      let optIndex = currentSelectionCopy.indexOf(optVal);
      dropdownOptions[opt].selected && optVal !== "" && !currentSelectionCopy.includes(optVal)
        ? selectedOpts.push(optVal)
        : null;
      // only look at selected options which are valid column keys
      if(dropdownOptions[opt].selected && tempKeys.includes(optVal)) {
        optIndex > -1
          ? currentSelectionCopy.splice(optIndex, 1)
          : currentSelectionCopy.push(optVal);
      }
    }

    window.console.log('catColbasicHandler - new currentSelectionCopy ', currentSelectionCopy);
    // currentSelection is now up to date with user input, find new freeKeys
    let tempFreeKeys = tempKeys.filter(key => !currentSelectionCopy.includes(key));
    window.console.log('catColbasicHandler - new freeKeys ', tempFreeKeys);

    //window.console.log('catColbasicHandler selectedOpts', selectedOpts);
    this.setState({
      catFeatures: selectedOpts.join(),
      currentSelection: currentSelectionCopy,
      freeKeys: tempFreeKeys
    });
  }

  /**
  * Fairly complicated click handler for selecting ordinal features but essentially
  * works in similar manner as other field click handlers - the complication comes
  * from managing key/value pairs of ordinal features. Each selected ordinal feature has
  * associated ordered list
  */
  ordColbasicHandler(e, d) {
    const { currentSelection, ordinalFeatures, datasetPreview } = this.state;
    let currentSelectionCopy = [...currentSelection];
    let tempKeys = this.getDataKeys();
    let oldOrdKeys = [];
    let oldOrdFeats = {...ordinalFeatures};
    let dropdownOptions = e.target.options;
    let selectedOpts = [];
    window.console.log('ordColbasicHandler - old currentSelectionCopy ', currentSelectionCopy);
    // for(var opt in dropdownOptions) {
    //   dropdownOptions[opt].selected && dropdownOptions[opt].value !== ""
    //     ? selectedOpts.push(dropdownOptions[opt].value) : null;
    // }
    oldOrdKeys = Object.keys(ordinalFeatures);
    let oldIndexes = [];
    if(oldOrdKeys.length && oldOrdKeys[0] !== ""){
      oldOrdKeys && oldOrdKeys.forEach(ord => {
        let tempOldI = currentSelectionCopy.indexOf(ord);
        tempOldI > -1
          ? currentSelectionCopy.splice(tempOldI, 1) : null;
      })
    }

    for(var opt in dropdownOptions) {
      let optVal = dropdownOptions[opt].value;
      let optSelected = dropdownOptions[opt].selected; // this is list of options when set as variable? or something weird like that
      let optIndex = currentSelectionCopy.indexOf(optVal);
      dropdownOptions[opt].selected && optVal !== "" && !currentSelectionCopy.includes(optVal)
        ? selectedOpts.push(optVal)
        : null;
      // only look at selected options which are valid column keys
      // if(dropdownOptions[opt].selected && tempKeys.includes(optVal)) {
      //   optIndex > -1
      //     ? currentSelectionCopy.splice(optIndex, 1)
      //     : currentSelectionCopy.push(optVal);
      // }
    }
    let tempOrdFeatsTest = {};
    let tempVals; // all values in dataset for given ordinal key
    selectedOpts.forEach(ordOpt => {
      tempVals = [];
      let tempI = currentSelectionCopy.indexOf(ordOpt);
      tempI > -1
        ? currentSelectionCopy.splice(tempI, 1)
        : currentSelectionCopy.push(ordOpt);
      if(oldOrdKeys.includes(ordOpt)) {
        tempVals = oldOrdFeats[ordOpt];
      }
      // let optIndex = datasetPreview.data.indexOf(ordOpt);
      // tempVals.push(datasetPreview.data[optIndex]);
      // window.console.log('ordColbasicHandler - tempVals ', tempVals);
      datasetPreview.data.forEach(row => {
        tempVals && row[ordOpt] && !tempVals.includes(row[ordOpt])
          ? tempVals.push(row[ordOpt]) : null;
      })
      window.console.log('ordColbasicHandler - tempVals ', tempVals);
      tempOrdFeatsTest[ordOpt] = tempVals;
    })
    let tempFreeKeys = tempKeys.filter(key => !currentSelectionCopy.includes(key));
    window.console.log('ordColbasicHandler - tempOrdFeatsTest ', tempOrdFeatsTest);
    window.console.log('ordColbasicHandler - selectedOpts ', selectedOpts);
    window.console.log('ordColbasicHandler - new currentSelectionCopy ', currentSelectionCopy);
    this.setState({
     currentSelection: currentSelectionCopy,
     ordinalFeatures: tempOrdFeatsTest,
     showOrdModal: true,
     freeKeys: tempFreeKeys
    });
  }

  updateOrdFeatFromModlCallback(newOrdFeats) {
    this.setState({
      ordinalFeatures: newOrdFeats
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
         // initialize freeKeys with every key, all options are valid at first
         // as user selects options, remove selected option from freeKeys
         let dataKeys = result.meta.fields;
         this.setState({
           datasetPreview: result,
           freeKeys: dataKeys
         });
       }
     };

     let stateTemplate = {
       selectedFile: undefined,
       errorResp: null,
       datasetPreview: null,
       openFileTypePopup: false,
       dependentCol: '',
       catFeatures: '',
       ordinalFeatures: '',
       currentSelection: []
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
           stateTemplate.errorResp = JSON.stringify(error);
           this.setState(formTemplate);
         }
         // set state with file preview if parse successful, reset form input
         stateTemplate.selectedFile = event.target.files[0];
         this.setState(stateTemplate);
       } else {
         // reset state as fallback if no file type is not supported
         console.warn('Filetype not csv or tsv:', uploadFile);
         stateTemplate.openFileTypePopup = true;
         this.setState(stateTemplate);
       }
     } else {
       // reset state as fallback if no file selected
       this.setState(stateTemplate);
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

   /****************************************************************************/
   /*                Basic helper/util methods                                 */
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

   getFreeKeys(currentSelection = []) {
     const { datasetPreview } = this.state;
     let dataKeys = [];
     if(datasetPreview) {
       //dataKeys = Object.keys(datasetPreview);
       dataKeys = datasetPreview.meta.fields;
     }
     currentSelection.forEach(usedKey => {
       let tempIndex = dataKeys.indexOf(usedKey);
       if(tempIndex > -1) {
         dataKeys.splice(tempIndex, 1);
       }
     })
     window.console.log('free keys', dataKeys);
     //this.setState({freeKeys: dataKeys})
     return dataKeys;
   }

   /*
   * test input for JSON, handles string or raw object
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

  render() {

    const {
      openFileTypePopup,
      selectedFile,
      dependentCol,
      errorResp,
      catFeatures,
      ordinalFeatures,
      showOrdModal,
      datasetPreview,
      freeKeys
    } = this.state;

    let errorContent;
    let depColDropdown = this.getDropDown();
    let catDropdown = this.getDropDown();
    let categorySelectOpts = this.getSelectDropDown();
    let ordinalSelectOpts = this.getSelectDropDown();
    let ordDropdown = this.getDropDown();
    //let availableKeys = this.getFreeKeys();
    //let availableKeys = [...freeKeys];
    // this is infuriating - I dont understand why this works
    // availableKeys in this component is correct when selecting other options but
    // when trying to pass this to other dropdowns they are not being updated correctly
    // i dont even know how to articulate this problem in terms of react concepts...
    // but using different copies of the same object works?
    let availableKeys = freeKeys.slice();
    let depKeys = freeKeys.slice();
    let catKeys = freeKeys.slice();
    let ordKeys = freeKeys.slice();
    window.console.log('freeKeys in render', freeKeys);
    window.console.log('availableKeys in render', availableKeys);
    // default to hidden until a file is selected, then display input areas
    let formInputClass = "file-upload-form-hide-inputs";

    // check if file with filename has been selected, if so then use css to show form
    selectedFile && selectedFile.name
      ? formInputClass = "file-upload-form-show-inputs" : null;

    if (errorResp) {
      errorContent = ( <p style={{display: 'block'}}> {errorResp} </p> );
      window.setTimeout(this.errorPopupTimeout, 4555);
    }

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
              <PlainDependentDropdown
                fieldType="Dependent Column"
                dropdownHandler={this.depColbasicHandler}
                options={depKeys}
                selectedValue={dependentCol}
                multiple={false}
              />
              <PlainCategoryDropdown
                fieldType="Categorical Features"
                dropdownHandler={this.catColbasicHandler}
                options={catKeys}
                catValues={catFeatures}
                multiple={true}
              />
              <PlainOrdinalDropdown
                fieldType="Ordinal Features"
                dropdownHandler={this.ordColbasicHandler}
                ordValues={ordinalFeatures}
                options={ordKeys}
                ordModalCloseCallback={this.ordModalClose}
                updateOrdFeatFromModlCallback={this.updateOrdFeatFromModlCallback}
                showOrdModal={showOrdModal}
                multiple={true}
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
