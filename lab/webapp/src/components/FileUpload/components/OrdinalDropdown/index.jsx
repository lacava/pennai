import React, { Component } from 'react';
import { connect } from 'react-redux';
import SceneHeader from '../../../SceneHeader';
import SortableList from '../SortableList';
import { Header, Dropdown, Form, Popup, Icon, Segment, Modal } from 'semantic-ui-react';

class OrdinalFeatInput extends Component {

  constructor(props) {
    super(props);
    this.state = {
      showOrdModal: false
    };

    this.makeOrdModalContent = this.makeOrdModalContent.bind(this);
    this.dropDwnHandler = this.dropDwnHandler.bind(this);

    this.ordFeatHelpText = (<p>Ordinal features have a discrete number of categories,
    and the categories have a logical order. Some examples include size ("small",
    "medium", "large"), or rank results ("first", "second", "third").
    <br/><br/>
    Describe these features using a json map. The map key is the name of the field,
     and the map value is an ordered list of the values the field can take:
    <i>{"{\"rank\":[\"first\", \"second\", \"third\"], \"size\":[\"small\", \"medium\", \"large\"]}"}</i></p>);

    //this.depColDropDownClickHandler = this.depColDropDownClickHandler.bind(this);
  }

  dropDwnHandler(e, d) {
    window.console.log('ord drop down handler', e.target.innerText);
    window.console.log('ord drop down handler', d);
  }

  makeOrdModalContent() {
    const { ordinalFeatures, updateOrdFeatFromModlCallback } = this.props;
    let ordModalContent = [];

    Object.keys(ordinalFeatures).forEach(selectedOrdKey => {
      ordModalContent.push( (
          <div key={selectedOrdKey}>
            <h3>Select order for: {selectedOrdKey}</h3>
            <br/>
             {<Segment>
               <p>{selectedOrdKey}</p>
               <SortableList
                 items={
                   ordinalFeatures[selectedOrdKey]
                   && Array.isArray(ordinalFeatures[selectedOrdKey])
                     ? ordinalFeatures[selectedOrdKey] : []
                 }
                 onChange={(items_test) => {
                   let tempOrdState = {...ordinalFeatures};
                   tempOrdState[selectedOrdKey] = items_test;
                   window.console.log('new order', tempOrdState);
                   //this.setState({ordinalFeatures: tempOrdState})
                   //this.setState({items_test});
                   updateOrdFeatFromModlCallback(tempOrdState)
                 }}
               />
             </Segment>}
          </div>
        )
      )
    })

    return ordModalContent;
  }

// className="file-upload-categorical-help-icon"
  render() {
    const {
      ordDropdown,
      showOrdModal,
      ordModalCloseCallback,
      ordDropDownClickHandler,
      ordinalFeatures,
      dropdwnKeys,
      ordDropdownTest
    } = this.props;

    let ordModalContent = this.makeOrdModalContent();
    let ordKeys = Object.keys(ordinalFeatures);
    return (
      <div>
          {/*<Dropdown
            style={{
              backgroundColor: "white",
              width: '65%'
            }}
            text="Select ordinal features"
            search={(dropdwnList, userInput) => {
              //window.console.log('handling ord search', userInput);
              let tempDropdwnVals = dropdwnList.filter(i => {
                //window.console.log('mapped value', i);
                return i.value.toLowerCase().includes(userInput);
              });
              //let findInput = tempDropdwnVals.includes(userInput);
              window.console.log('search user input', tempDropdwnVals);
              return tempDropdwnVals;
            }}
            multiple
            selection
            options={ordDropdown}
            onChange={ordDropDownClickHandler}
          >
          </Dropdown>*/}
          <select
            style={{
              width: '65%'
            }}
            name='plain_dropdown_ordinal'
            multiple
            onChange={ordDropDownClickHandler}
          >
            <option value="" disabled>--Please select ordinal features--</option>
            {ordDropdownTest}
          </select>
          <Modal
             size="small"
             open={showOrdModal}
             style={{ marginTop:"0px" }}
             onClose={ordModalCloseCallback}
          >
            <Modal.Header>
             Ordinal Feature Order
             <h3>Drag and Drop - arrange list items in desired order</h3>
            </Modal.Header>
            <Modal.Content>
             {ordModalContent}
             {JSON.stringify(ordinalFeatures, null, 2)}
            </Modal.Content>
          </Modal>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({

});

export { OrdinalFeatInput };
export default connect(mapStateToProps)(OrdinalFeatInput);
