import React from "react";

export default class NumberInput extends React.Component {
  render() {
    return (
      <div className="flex flex-col gap-2">
        <div className="basis-auto">
          <label className="text-base">{this.props.title}</label>
        </div>
        <div className="basis-auto relative">
          <input
            name={this.props.name}
            type="number"
            className={
              "input input-bordered w-full" +
              (this.props.error ? " input-error" : "")
            }
            autoComplete="off"
            placeholder={this.props.placeholder}
            value={this.props.value}
            onChange={this.props.handle_change}
          ></input>
          <label className="label">
            <span
              className={
                "text-xs" +
                (this.props.error ? " text-error" : " text-base-300")
              }
            >
              {this.props.tip}
            </span>
          </label>
        </div>
      </div>
    );
  }
}
