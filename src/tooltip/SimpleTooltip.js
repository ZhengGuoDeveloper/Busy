import React, { Component } from 'react';
import Tooltip from './Tooltip';
import './SimpleTooltip.scss';

const TOOLTIP_MARGIN = 10;

const getTooltipOnBottomStyle = (position, tooltipWidth) => ({
  position: 'absolute',
  top: `${position.bottom + TOOLTIP_MARGIN}px`,
  left: `${(position.left + (position.width / 2)) - (tooltipWidth / 2)}px`,
});

export default class SimpleTooltip extends Component {
  constructor(props) {
    super(props);
    this.state = {
      el: null,
    };
  }

  handleRef = (e) => {
    if (!this.state.el) {
      this.setState({ el: e });
    }
  };

  render() {
    const { pos, className } = this.props;
    const { message } = this.props.value;
    const tooltipWidth = this.state.el ? this.state.el.clientWidth : 0;

    const style = getTooltipOnBottomStyle(pos, tooltipWidth);

    return (
      <div className={className} style={style} ref={this.handleRef}>
        { message }
      </div>
    );
  }
}

export const SimpleTooltipOrigin = ({ message, children }) => (
  <Tooltip value={{ message }} TemplateComp={SimpleTooltip}>
    {children}
  </Tooltip>
);
