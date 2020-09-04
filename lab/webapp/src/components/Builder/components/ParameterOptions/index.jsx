/* ~This file is part of the PennAI library~

Copyright (C) 2017 Epistasis Lab, University of Pennsylvania

PennAI is maintained by:
    - Heather Williams (hwilli@upenn.edu)
    - Weixuan Fu (weixuanf@pennmedicine.upenn.edu)
    - William La Cava (lacava@upenn.edu)
    - and many other generous open source contributors

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

*/
import React from 'react';
import { Grid, Segment, Header, Popup, Button, Icon } from 'semantic-ui-react';
import { formatParam } from 'utils/formatter';

function ParameterOptions({
  params,
  currentParams,
  setParamValue
}) {
  const calcCols = (choices) => choices.length > 2 ? 2 : 1;

  const isActive = (info, param, i) => currentParams[param] === getReturnValue(info, i);

  const getReturnValue = (info, i) => info.ui.values ? info.ui.values[i] : info.ui.choices[i];

  return (
    <Grid.Row>
      {params && Object.entries(params).map(([param, info]) => (
        <Grid.Column
          key={param}
          mobile={16}
          tablet={8}
          computer={8}
          widescreen={8}
          largeScreen={8}
        >
          <Segment inverted attached="top" className="panel-header">
            <Popup
              on="click"
              position="top center"
              header={formatParam(info.alias || param)}
              content={info.description}
              trigger={
                <Icon
                  inverted
                  size="large"
                  color="blue"
                  name="info circle"
                  className="info-icon float-right"
                />
              }
            />
            <Header
              as="h2"
              inverted
              color="blue"
              content={formatParam(info.alias || param)}
              className="param-name"
            />
          </Segment>
          <Segment inverted attached="bottom">
            <Grid columns={calcCols(info.ui.choices)} className="compressed">
            {info.ui.choices.map((choice, i) => (
               <Grid.Column key={choice}>
                  <Button
                       fluid
                       inverted
                       color="blue"
                       content={choice.toString()}
                       active={isActive(info, param, i)}
                       onClick={() => setParamValue(param, getReturnValue(info, i))}
                   />
              </Grid.Column>
            ))}
            </Grid>
          </Segment>
        </Grid.Column>
      ))}
    </Grid.Row>
  );
}

export default ParameterOptions;
