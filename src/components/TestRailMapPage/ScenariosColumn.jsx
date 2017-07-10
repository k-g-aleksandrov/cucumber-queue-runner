import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Grid, Row, Col } from 'react-bootstrap';

const propTypes = {
  scenarios: PropTypes.array
};

class ScenariosColumn extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    const { scenarios } = this.props;

    return (
      <Col md={8}>
        <Grid fluid>
          <Row>
            {scenarios.map((scenario, i) => {
              return (
                <Col md={12} key={i}>
                  <span>
                    <b>{scenario.project}</b>&nbsp;→&nbsp;
                    <b>{scenario.featureName}</b>:&nbsp;
                    {scenario.scenarioName} (:{scenario.scenarioLine})<br/>
                  </span>
                  Current scope: <b>{scenario.filters.filter((e) => e !== 'full')}</b>&nbsp;
                  (tags: <span style={{ fontStyle: 'italic' }}>{scenario.tags.join(', ')}</span>)
                </Col>
              );
            })}
          </Row>
        </Grid>
      </Col>
    );
  }
}

ScenariosColumn.propTypes = propTypes;

export default ScenariosColumn;
