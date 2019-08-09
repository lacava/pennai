import React, { Component } from 'react';
import { connect } from 'react-redux';
import SceneHeader from '../../../SceneHeader';
import SortableList from '../SortableList';
import { Header, Dropdown, Form, Popup, Icon, Segment, Modal } from 'semantic-ui-react';
import Papa from 'papaparse';

class OrdinalFeatInput extends Component {

  constructor(props) {
    super(props);
    this.state = {
      showOrdModal: false
    };

    this.makeOrdModalContent = this.makeOrdModalContent.bind(this);

    this.ordFeatHelpText = (<p>Ordinal features have a discrete number of categories,
    and the categories have a logical order. Some examples include size ("small",
    "medium", "large"), or rank results ("first", "second", "third").
    <br/><br/>
    Describe these features using a json map. The map key is the name of the field,
     and the map value is an ordered list of the values the field can take:
    <i>{"{\"rank\":[\"first\", \"second\", \"third\"], \"size\":[\"small\", \"medium\", \"large\"]}"}</i></p>);

    //this.depColDropDownClickHandler = this.depColDropDownClickHandler.bind(this);
  }

  makeOrdModalContent() {
    const { ordinalFeatures, updateOrdFeatFromModlCallback } = this.props;

    let ordModalContent = [];

    Object.keys(ordinalFeatures).forEach(selectedOrdKey => {
      ordModalContent.push( (
          <div key={selectedOrdKey}>
             select order for: {selectedOrdKey}
             <br/>
             select_order_mock: {
                     <Segment>
                       <h3>test drag n' drop list</h3>
                       <SortableList
                         items={
                           ordinalFeatures[selectedOrdKey] && ordinalFeatures[selectedOrdKey].length
                             ? ordinalFeatures[selectedOrdKey] : []
                         }
                         onChange={(items_test) => {
                           let tempOrdState = {...ordinalFeatures};
                           tempOrdState[selectedOrdKey] = items_test;
                           window.console.log('new order', tempOrdState);
                           this.setState({ordinalFeatures: tempOrdState})
                           //this.setState({items_test});
                           updateOrdFeatFromModlCallback(tempOrdState)
                         }}
                       />
                     </Segment>
                 }
               )}
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
      ordTextAreaVal,
      ordFeatCallback,
      showOrdModal,
      ordModalCloseCallback,
      ordinalFeatures
    } = this.props;

    let ordModalContent = this.makeOrdModalContent();
    return (
      <div>
          <Dropdown
            style={{
              backgroundColor: "white",
              width: '65%'
            }}
            text="Select ordinal features"
            search
            multiple
            options={ordDropdown}
          >
          </Dropdown>
          <textarea
            style={{
              width: '65%'
            }}
            id="ordinal_features_text_area_input"
            label="Ordinal Features"
            value={ordTextAreaVal}
            placeholder={"{\"ord_feat_1\": [\"SHORT\", \"TALL\"], \"ord_feat_2\": [\"FIRST\", \"SECOND\", \"THIRD\"]}"}
            onChange={ordFeatCallback}
          />

          <Modal
             size="small"
             open={showOrdModal}
             style={{ marginTop:"0px" }}
             onClose={ordModalCloseCallback}
          >
            <Modal.Header>
             Test modal
            </Modal.Header>
            <Modal.Content>
             <h3>minmodal</h3>
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
/*
<Popup
  on="click"
  position="right center"
  header="Ordinal Features Help"
  content={
    <div className="content">
     {this.ordFeatHelpText}
    </div>
  }
  trigger={
    <Icon
      inverted
      size="large"
      color="orange"
      name="info circle"
    />
  }
/>
*/
