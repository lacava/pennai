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
      currentSelection: [],
      freeKeys: []
    };

    this.getFreeKeys = this.getFreeKeys.bind(this);
    this.getDataKeys = this.getDataKeys.bind(this);
    this.handleSelectedFile = this.handleSelectedFile.bind(this);
    this.depColDropDownClickHandler = this.depColDropDownClickHandler.bind(this);
    this.catDropDownClickHandler = this.catDropDownClickHandler.bind(this);
    this.ordDropDownClickHandler = this.ordDropDownClickHandler.bind(this);
    this.ordModalClose = this.ordModalClose.bind(this);
    this.updateOrdFeatFromModlCallback = this.updateOrdFeatFromModlCallback.bind(this);

    this.depColbasicHandler = this.depColbasicHandler.bind(this);
    this.catColbasicHandler = this.catColbasicHandler.bind(this);
    this.ordColbasicHandler = this.ordColbasicHandler.bind(this);
    this.getSelectDropDown = this.getSelectDropDown.bind(this);
  }

  componentDidMount() {
  }

  /**
  * basic click handler for selecting dependent column
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
          window.console.error('error parsing ordinal feature options ----> ', e);
      }
    }
    // is currently selected dependent column option already in use
    let inOrdFeats = ordKeysList.includes(userInput);
    // also need to check any currently selected categoical features
    let catFeatList;
    catFeatures !== '' && catFeatures.includes(',')
      ? catFeatList = catFeatures.split(',')
      : catFeatList = [catFeatures];
    let inCatFeats = catFeatList.includes(userInput);
    // only set state if new user input not being used in other fields
    if(!inOrdFeats && !inCatFeats) {
      this.setState({
        dependentCol: userInput
      });
    }
  }

  /**
  * basic click handler for selecting dependent column
  */
  depColbasicHandler(e, d) {
    const { dependentCol, currentSelection } = this.state;
    let userInput = e.target.value;
    let currentSelectionCopy = [...currentSelection];
    // check previous value of dependentCol, if present remove from currentSelection
    let oldIndex = currentSelectionCopy.indexOf(dependentCol);
    oldIndex > -1 ? currentSelectionCopy.splice(oldIndex, 1) : null;
    //window.console.log('depColbasicHandler', userInput);
    // is currently selected dependent column option (new user input) already in use
    let currSelIndex = currentSelectionCopy.indexOf(userInput);
    currSelIndex > -1 ? currentSelectionCopy.splice(currSelIndex, 1) : currentSelectionCopy.push(userInput);
    //window.console.log('currentSelectionCopy', currentSelectionCopy);
    //let tempFreeKeys = this.getFreeKeys(currentSelectionCopy);
    let tempKeys = this.getDataKeys();
    let tempFreeKeys = tempKeys.filter(key => !currentSelectionCopy.includes(key));
    //window.console.log('tempFreeKeys', tempFreeKeys)
    this.setState({
      dependentCol: userInput,
      currentSelection: currentSelectionCopy,
      freeKeys: tempFreeKeys
    });
  }

  catColbasicHandler(e, d) {
    const { currentSelection, catFeatures } = this.state;
    let currentSelectionCopy = [...currentSelection];
    let dropdownOptions = e.target.options;
    window.console.log('catColbasicHandler', dropdownOptions);
    let selectedOpts = [];
    for(var opt in dropdownOptions) {
      dropdownOptions[opt].selected && dropdownOptions[opt].value !== ""
        ? selectedOpts.push(dropdownOptions[opt].value) : null;
    }
    // check previous values of any selected categorical features in react state
    // (before handling current user input), if any previous options are in currentSelection
    // then remove them
    let oldCats = catFeatures.split(",");
    let oldIndexes = [];
    if(oldCats.length && oldCats[0] !== ""){
      oldCats.forEach(cat => {
        oldIndexes.push(currentSelectionCopy.indexOf(cat));
      })
    }
    window.console.log('oldIndexes', oldIndexes);

    window.console.log('catColbasicHandler selectedOpts', selectedOpts);
    // this.setState({
    //   catFeatures: selectedOpts.join()
    // });
  }


  ordColbasicHandler(e, d) {
    const { currentSelection } = this.state;
    let userInput = e.target.value;
    let currentSelectionCopy = [...currentSelection];
    window.console.log('ordColbasicHandler', userInput);
  }

  /**
  * Select from available column keys, store in comma seperated list of categorical
  * features in this react component's (FileUplodaForm) state
  */
  catDropDownClickHandler(e, d) {
    const { catFeatures, dependentCol, ordinalFeatures } = this.state;
    //window.console.log('catDropDownClickHandler');
    // get list of all selected options
    // https://stackoverflow.com/questions/5866169/how-to-get-all-selected-values-of-a-multiple-select-box
    let dropdownOptions = e.target.options;
    let selectedOpts = [];
    for(var opt in dropdownOptions) {
      dropdownOptions[opt].selected && dropdownOptions[opt].value !== ""
        ? selectedOpts.push(dropdownOptions[opt].value) : null;
    }
    // check other options to see if selected key is already being used
    let ordKeysList = [];
    if(typeof ordinalFeatures !== 'string' && this.isJson(ordinalFeatures)) {
      ordKeysList = Object.keys(ordinalFeatures);
    } else if(ordinalFeatures !== ""){ // else try to parse and get keys
      let tempObj;
      try {
          tempObj = JSON.parse(ordinalFeatures);
          ordKeysList = Object.keys(tempObj);
      } catch (e) {
          window.console.error('error parsing ordinal feature options ---->', e);
      }
    }
    // is currently selected category option(s) already in use?
    // if selected options already in use, remove it/prevent selection
    let inDepCol = selectedOpts.includes(dependentCol);
    if (inDepCol) {
      let depColIndex = selectedOpts.indexOf(dependentCol);
      depColIndex > -1 ? selectedOpts.splice(depColIndex, 1) : null;
    }
    ordKeysList.forEach(ordKey => {
      let ordFeatIndex = selectedOpts.indexOf(ordKey);
      ordFeatIndex > -1 ? selectedOpts.splice(ordFeatIndex, 1) : null;
    })

    //window.console.log('selectedOpts (after checking other fields): ', selectedOpts);
    this.setState({
      catFeatures: selectedOpts.join()
    });
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

    //let selectedKey = e.target.innerText;
    let oldOrdKeys = [];
    let oldOrdFeats = {};
    // get list of all selected options - check catDropDownClickHandler
    let dropdownOptions = e.target.options;
    let selectedOpts = [];
    for(var opt in dropdownOptions) {
      dropdownOptions[opt].selected && dropdownOptions[opt].value !== "" ? selectedOpts.push(dropdownOptions[opt].value) : null;
    }
    oldOrdKeys = Object.keys(ordinalFeatures);

    // if one of currently selected option is used as dependentCol, can not use
    // that input for ordinal features
    let inDepCol = selectedOpts.includes(dependentCol);
    if(inDepCol) {
      let depColIndex = selectedOpts.indexOf(dependentCol);
      depColIndex > -1 ? selectedOpts.splice(depColIndex, 1) : null;
    }
    // convert currently selected options list and categorical_features list in react state
    // to Sets and get intersection - if intersection is not empty remove those items
    // i.e. prevent user from selecting option already in use elsewhere
    let catFeatList;
    catFeatures !== '' && catFeatures.includes(',')
      ? catFeatList = catFeatures.split(',')
      : catFeatList = [catFeatures];
    let catSet = new Set(catFeatList);
    let ordOptSet = new Set(selectedOpts);
    let catOrdOverlap = this.getIntersection(catSet, ordOptSet);
    //window.console.log('catOrdOverlap', catOrdOverlap);

    catOrdOverlap.forEach(opt => ordOptSet.delete(opt));

    let tempOrdFeatsTest = {};
    let ordOptKeyList = Array.from(ordOptSet);
    ordOptKeyList.forEach(ordKey => {
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

    // TODO: work on comparing previous options with current selection, if a new item
    //       is being added perhaps toggle openning the modal

    // compare old options with new options, if new item is being added open model
    // to prompt user to specify order, otherwise do not open model
    // can use javascript Sets or arrays -
    // https://stackoverflow.com/questions/1723168/what-is-the-fastest-or-most-elegant-way-to-compute-a-set-difference-using-javas
    // let oldOrdOpts = new Set(oldOrdKeys);
    // let newOrdOpts = new Set(ordOptKeyList);
    // let oldOrdOverlap = new Set([...oldOrdOpts].filter(oldOpt => !newOrdOpts.has(oldOpt)));
    // let oldOrdOverlapList = ordOptKeyList.filter(opt => !oldOrdKeys.includes(opt));
    // window.console.log('oldOrdOverlap', oldOrdOverlap);
    // window.console.log('oldOrdOverlapList', oldOrdOverlapList);
    // let showOrdMod = false;
    this.setState({
     ordKeys: ordOptKeyList,
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
         // initialize freeKeys with every key, all options are valid at first
         // as user selects options, remove selected option from freeKeys
         let dataKeys = result.meta.fields;
         this.setState({
           datasetPreview: result,
           freeKeys: dataKeys
         });
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
    let availableKeys = [...freeKeys];
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

    // let accordionStuff = [
    //     (
    //       <CategoricalFeatInput
    //         catFeatCallback={this.catDropDownClickHandler}
    //         catDropdown={catDropdown}
    //         catDropdownTest={catDropdown}
    //         catFeatures={catFeatures}
    //       />
    //     ),
    //     (
    //       <OrdinalDropdown
    //         ordDropdown={ordDropdown}
    //         ordinalFeatures={ordinalFeatures}
    //         showOrdModal={showOrdModal}
    //         ordDropDownClickHandler={this.ordDropDownClickHandler}
    //         updateOrdFeatFromModlCallback={this.updateOrdFeatFromModlCallback}
    //         ordModalCloseCallback={this.ordModalClose}
    //         ordDropdownTest={ordDropdown}
    //       />
    //     )
    // ];

    let accordionStuff = [
        (
          <CategoricalFeatInput
            catFeatCallback={this.catDropDownClickHandler}
            catDropdown={catDropdown}
            catSelectOptions={categorySelectOpts}
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
            ordSelectOpts={ordinalSelectOpts}
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
              {/*<DependentColumnInput
                depColDropdown={depColDropdown}
                depColCallback={this.depColDropDownClickHandler}
                dependentCol={dependentCol}
              />
              <AccordionFormInput
                accordionStuff={accordionStuff}
              />*/}
              <PlainDependentDropdown
                fieldType="Dependent Column"
                dropdownHandler={this.depColbasicHandler}
                options={freeKeys}
                selectedValue={dependentCol}
                multiple={false}
              />
              {/*<PlainDropdown
                fieldType="Dependent Column"
                dropdownHandler={this.depColbasicHandler}
                options={freeKeys}
                multiple={false}
              />
              <PlainDropdown
                fieldType="Categorical Features"
                dropdownHandler={this.catColbasicHandler}
                options={availableKeys}
                multiple={true}
              />
              */}

              {<PlainCategoryDropdown
                fieldType="Categorical Features"
                dropdownHandler={this.catColbasicHandler}
                options={availableKeys}
                catValues={catFeatures}
                multiple={true}
              />}
              <PlainDropdown
                fieldType="Ordinal Features"
                dropdownHandler={this.ordColbasicHandler}
                options={availableKeys}
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
