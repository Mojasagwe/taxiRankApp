const React = require('react');
const DatePicker = jest.fn().mockImplementation(props => {
  return React.createElement('DatePicker', props, props.children);
});

module.exports = DatePicker; 