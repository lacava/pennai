import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Accordion, Dropdown, Form, Popup, Icon } from 'semantic-ui-react';


class AccordionFormInput extends Component {

  constructor(props) {
    super(props);
    this.state = {
      activeAccordionIndexes: []
    };

    this.handleAccordionClick = this.handleAccordionClick.bind(this);

    this.catFeatHelpText = (<p>Categorical features have a discrete number of categories that do not have an intrinsic order.
    Some examples include sex ("male", "female") or eye color ("brown", "green", "blue"...).
    <br/><br/>
    Describe these features using a comma separated list of the field names:
    <i>sex, eye_color</i></p>);

    this.ordFeatHelpText = (<p>Ordinal features have a discrete number of categories,
    and the categories have a logical order. Some examples include size ("small",
    "medium", "large"), or rank results ("first", "second", "third").
    <br/><br/>
    Describe these features using a json map. The map key is the name of the field,
     and the map value is an ordered list of the values the field can take:
    <i>{"{\"rank\":[\"first\", \"second\", \"third\"], \"size\":[\"small\", \"medium\", \"large\"]}"}</i></p>);

  }

  /**
   * Accordion click handler which updates active index for different text areas
   * in dataset upload form, use react state to keep track of which indicies are
   * active & also clear any error message
   */
  handleAccordionClick = (e, titleProps) => {
     const { index } = titleProps;
     const { activeAccordionIndexes } = this.state;
     const newIndex = [...activeAccordionIndexes];  // make copy of array in state
     const currentIndexPosition = activeAccordionIndexes.indexOf(index);

     if (currentIndexPosition > -1) {
       newIndex.splice(currentIndexPosition, 1);
     } else {
       newIndex.push(index);
     }

     this.setState({
       activeAccordionIndexes: newIndex,
       errorResp: undefined
     })

   }

  render() {
    const { activeAccordionIndexes } = this.state;
    const { accordionStuff } = this.props;

    let ordIconClass; // CSS class to position help icon
    // determine which combos of accordions are open and set respective CSS class
    activeAccordionIndexes.includes(0)
      ? ordIconClass = "file-upload-ord-with-cat-help-icon-standalone"
      : ordIconClass = "file-upload-ordinal-help-icon-standalone";
    activeAccordionIndexes.includes(1)
      ? ordIconClass = "file-upload-just-ordinal-help-icon-standalone" : null;
    activeAccordionIndexes.includes(0) && activeAccordionIndexes.includes(0)
      ? ordIconClass = "file-upload-ord-and-cat-help-icon-standalone" : null;

    return (
      <div>
        <Accordion fluid exclusive={false}>
           <Accordion.Title
             className="file-upload-categorical-accord-title"
             active={activeAccordionIndexes.includes(0)}
             index={0}
             onClick={this.handleAccordionClick}
            >
             <Icon name='dropdown' />
             Select Categorical Features
           </Accordion.Title>
           <Popup
             on="click"
             position="right center"
             header="Categorical Features Help"
             content={
               <div className="content">
                {this.catFeatHelpText}
               </div>
             }
             trigger={
               <Icon
                 className="file-upload-categorical-help-icon-standalone"
                 inverted
                 size="large"
                 color="orange"
                 name="info circle"
               />
             }
           />
           <Accordion.Content
             active={activeAccordionIndexes.includes(0)}
            >
              {accordionStuff[0] ? accordionStuff[0] : null}
            </Accordion.Content>
            <Accordion.Title
              className="file-upload-categorical-accord-title"
              active={activeAccordionIndexes.includes(1)}
              index={1}
              onClick={this.handleAccordionClick}
             >
              <Icon name='dropdown' />
              Select Ordinal Features
            </Accordion.Title>
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
                  className={ordIconClass}
                />
              }
            />
            <Accordion.Content
              active={activeAccordionIndexes.includes(1)}
             >
               {accordionStuff[1] ? accordionStuff[1] : null}
             </Accordion.Content>
          </Accordion>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
});

export { AccordionFormInput };
export default connect(mapStateToProps)(AccordionFormInput);
