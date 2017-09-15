import React from 'react';
import PropTypes from 'prop-types';

import ReportStep from './ReportStep';
import ReportErrorMessage from './ReportErrorMessage';

import Grid from 'react-bootstrap/lib/Grid';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';

const propTypes = {
  report: PropTypes.any
};

function Report(props) {
  if (!props.report) {
    return null;
  }

  const report = props.report;

  return (
    <Row>
      <Col>
        {report.map((rep, i) => {
          let haveBackground = false;
          let scenarioElementsIndex = 0;

          if (rep.elements[0].type === 'background') {
            haveBackground = true;
            scenarioElementsIndex = 1;
          }

          return (
            <Grid fluid style={{ paddingTop: '4px', paddingBottom: '8px' }} key={i}
              onClick={(e) => e.stopPropagation()}
            >
              {rep.elements[scenarioElementsIndex].before
                && rep.elements[scenarioElementsIndex].before.map((before, j) => {
                  return (
                    <div key={j}>
                      <ReportStep key={j} type='before' step={before}/>
                      <ReportErrorMessage errorMessage={before.result.error_message}/>
                    </div>
                  );
                })
              }
              {haveBackground && rep.elements[0].steps.map((step, j) => {
                return (
                  <div key={j}>
                    <ReportStep type='step' step={step}/>
                    <ReportErrorMessage errorMessage={step.result.error_message}/>
                  </div>
                );
              })}
              {rep.elements[scenarioElementsIndex].steps.map((step, j) => {
                return (
                  <div key={j}>
                    <ReportStep type='step' step={step}/>
                    <ReportErrorMessage errorMessage={step.result.error_message}/>
                  </div>
                );
              })}
              {rep.elements[scenarioElementsIndex].after
                && rep.elements[scenarioElementsIndex].after.map((after, j) => {
                  return (
                    <div key={j}>
                      <ReportStep type='after' step={after}/>
                      <ReportErrorMessage errorMessage={after.result.error_message}/>
                    </div>
                  );
                })
              }
            </Grid>
          );
        })}
      </Col>
    </Row>
  );
}

Report.propTypes = propTypes;

export default Report;
