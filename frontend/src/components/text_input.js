import React from "react";

export default class OptionalTextInput extends React.Component {
  render() {
    return (
      <div className="flex flex-col gap-2">
        <div className="basis-auto">
          <div className="flex gap-8">
            <label className="text-base">{this.props.title}</label>
            <input
              name={this.props.toggle_name}
              type="checkbox"
              className="toggle toggle-sm self-center"
              checked={this.props.enabled ? true : ""}
              onChange={this.props.handle_change}
            />
          </div>
        </div>
        {this.props.enabled ? (
          <div className="basis-auto relative">
            <input
              name={this.props.name}
              type="text"
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
        ) : null}
      </div>
    );
  }
}
