import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  report: PropTypes.any
};

function Report(props) {
  if (!props.report) {
    return null;
  }

  const report = props.report;

  return (
    <div>{report.map((rep, i) => {
      let haveBackground = false;
      let scenarioElementsIndex = 0;

      if (rep.elements[0].type === 'background') {
        haveBackground = true;
        scenarioElementsIndex = 1;
      }
      return (
        <div key={i} onClick={(e) => e.stopPropagation()}>
          {rep.elements[scenarioElementsIndex].before.map((before, j) => {
            return (
              <div key={j}><b>Before&nbsp;</b>{before.match.location}</div>
            );
          })}
          {haveBackground && rep.elements[0].steps.map((step, j) => {
            return (
              <div key={j}>
                <div className='row stepClass'>
                  <div className='col-md-10'><b>{step.keyword}</b><span>{step.name}</span></div>
                </div>
              </div>
            );
          })}
          {rep.elements[scenarioElementsIndex].steps.map((step, j) => {
            return (
              <div key={j}>
                <div className='row stepClass'>
                  <div className='col-md-10'><b>{step.keyword}</b><span>{step.name}</span></div>
                </div>
              </div>
            );
          })}
          }
        </div>
      );
    })}</div>
  );
}

Report.propTypes = propTypes;

export default Report;
