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
    activeAccordionIndexes.includes(1)
      ? ordIconClass = "file-upload-ord-with-cat-help-icon"
      : ordIconClass = "file-upload-ordinal-help-icon";
    activeAccordionIndexes.includes(0)
      ? ordIconClass = "file-upload-just-ordinal-help-icon" : null;
    activeAccordionIndexes.includes(1) && activeAccordionIndexes.includes(0)
      ? ordIconClass = "file-upload-ord-and-cat-help-icon" : null;

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
             Enter Categorical Features
           </Accordion.Title>
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
              Enter Ordinal Features
            </Accordion.Title>
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
