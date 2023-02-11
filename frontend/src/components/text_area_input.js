import React from "react";

export default class TextAreaInput extends React.Component {
  render() {
    return (
      <div className="flex flex-col gap-2">
        <div className="basis-full">
          <label className="text-base">{this.props.title}</label>
        </div>
        <div className="basis-full relative">
          <textarea
            name={this.props.name}
            className={
              "textarea textarea-bordered w-full h-[35vh] md:h-[55vh]" +
              (this.props.error ? " textarea-error" : "")
            }
            autoComplete="off"
            placeholder={this.props.placeholder}
            value={this.props.value}
            onChange={this.props.handle_change}
          ></textarea>
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
