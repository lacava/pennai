import React, { Component } from 'react';
import { connect } from 'react-redux';
import SortableList from '../SortableList';
import CurrentlySelectedKeys from '../CurrentlySelectedKeys';
import { Header, Popup, Icon, Segment, Modal } from 'semantic-ui-react';
class PlainOrdinalDropdown extends Component {

  constructor(props) {
    super(props);
    this.state = {};

    this.makeOrdModalContent = this.makeOrdModalContent.bind(this);
  }

  makeOrdModalContent() {
    const { ordValues, updateOrdFeatFromModlCallback } = this.props;
    let ordModalContent = [];

    Object.keys(ordValues).forEach(selectedOrdKey => {
      ordModalContent.push( (
          <div key={selectedOrdKey}>
            <h3>Select order for: {selectedOrdKey}</h3>
            <br/>
             {<Segment>
               <p>{selectedOrdKey}</p>
               <SortableList
                 items={
                   ordValues[selectedOrdKey]
                   && Array.isArray(ordValues[selectedOrdKey])
                     ? ordValues[selectedOrdKey] : []
                 }
                 onChange={(items_test) => {
                   let tempOrdState = {...ordValues};
                   tempOrdState[selectedOrdKey] = items_test;
                   window.console.log('new order', tempOrdState);
                   //this.setState({ordValues: tempOrdState})
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

  render() {
    const { options, fieldType, dropdownHandler, multiple, ordValues, ordModalCloseCallback, showOrdModal } = this.props;
    window.console.log('PlainOrdinalDropdown', options);
    window.console.log('PlainCategoryDropdown ordValues', ordValues);
    let ordModalContent = this.makeOrdModalContent();

    let ordSelectionToDisplay;
    if(ordValues !== ""){
      ordSelectionToDisplay = JSON.stringify(ordValues, null, 2);
    }
    let tempOpts = [];
    let ordKeys = Object.keys(ordValues);
    if( ordKeys.length && ordKeys[0] !== "" ){
      ordKeys.forEach(ord => {
        // check current category value in option prop list to prevent adding
        // same thing twice
        !options.includes(ord) && options.push(ord);
      });
    }
    options.sort();
    options.forEach((key, i) => {
    tempOpts.push(
      <option
       key={key + '_' + i}
       value={key}
      >
       {key}
      </option>)
    });
    return (
      <div>
        <label>
          PlainDropdown {fieldType}:
        </label>
        <Segment
          inverted
          compact
        >
          <select
            style={{
              width: '100%'
            }}
            name={'plain_dropdown_' + fieldType}
            multiple={multiple}
            onChange={dropdownHandler}
          >
            <option value="" disabled>--Please select {fieldType}--</option>
            {tempOpts}
          </select>
        </Segment>
        <CurrentlySelectedKeys
          fieldType="Ordinal"
          selectionToDisplay={ordSelectionToDisplay}
        />
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
           {JSON.stringify(ordValues, null, 2)}
          </Modal.Content>
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({});

export { PlainOrdinalDropdown };
export default connect(mapStateToProps)(PlainOrdinalDropdown);
