"use strict";

class PrefixInput extends React.Component {
  render() {
    return (
      <div className="block">
        <div className="block">
          <label className="title is-5">Prefixes</label>
        </div>
        <div className="block">
          <textarea
            type="text"
            name="prefix_input"
            className={
              "textarea" +
              (this.props.task_arg_validity_map.prefix_list ? "" : " is-danger")
            }
            rows="25"
            autoComplete="off"
            placeholder="192.168.0.0/24"
            value={this.props.prefix_list.join("\n")}
            onChange={this.props.handle_change}
          ></textarea>
        </div>
      </div>
    );
  }
}

class ASNInput extends React.Component {
  render() {
    return (
      <div className="block">
        <div className="block">
          <label className="title is-5">Viewpoint ASN</label>
        </div>
        <div className="block">
          <input
            type="number"
            name="asn_input"
            className={
              "input" +
              (this.props.task_arg_validity_map.viewpoint_asn
                ? ""
                : " is-danger")
            }
            autoComplete="off"
            placeholder="21859"
            value={this.props.viewpoint_asn}
            onChange={this.props.handle_change}
          ></input>
        </div>
      </div>
    );
  }
}

class FilterInput extends React.Component {
  render() {
    return (
      <div className="block">
        <div className="block">
          <label className="title is-5">Omit path count less then</label>
        </div>
        <div className="block">
          <input
            type="number"
            name="filter_input"
            className={
              "input" +
              (this.props.task_arg_validity_map.count_filter
                ? ""
                : " is-danger")
            }
            autoComplete="off"
            placeholder="5"
            min="0"
            value={this.props.count_filter}
            onChange={this.props.handle_change}
          ></input>
        </div>
      </div>
    );
  }
}

class InputControl extends React.Component {
  render() {
    return (
      <div className="block">
        <div className="block">
          <label className="title is-5">Operation</label>
        </div>
        <div className="block">
          <button
            name="start_button"
            className={
              "button is-info" + (this.props.loading ? " is-loading" : "")
            }
            onClick={this.props.handle_click}
          >
            Observe
          </button>
        </div>
      </div>
    );
  }
}

class RouteViewInput extends React.Component {
  render() {
    if (this.props.ui_mode == "input") {
      return (
        <div className="block">
          <div className="block pt-5">
            <PrefixInput
              handle_change={this.props.handle_change}
              prefix_list={this.props.prefix_list}
              task_arg_validity_map={this.props.task_arg_validity_map}
            />
          </div>
          <div className="block pt-5">
            <div className="columns">
              <div className="column is-one-quarter">
                <ASNInput
                  handle_change={this.props.handle_change}
                  viewpoint_asn={this.props.viewpoint_asn}
                  task_arg_validity_map={this.props.task_arg_validity_map}
                />
              </div>
              <div className="column is-one-quarter">
                <FilterInput
                  handle_change={this.props.handle_change}
                  count_filter={this.props.count_filter}
                  task_arg_validity_map={this.props.task_arg_validity_map}
                />
              </div>
            </div>
          </div>
          <div className="block pt-5">
            <InputControl
              handle_click={this.props.handle_click}
              loading={this.props.loading}
            />
          </div>
        </div>
      );
    } else {
      return <div className="block"></div>;
    }
  }
}

class RouteViewOutCanvas extends React.Component {
  render() {
    return (
      <div className="block">
        <div className="block">
          <label className="title is-5">Result</label>
        </div>
        {this.props.route_view_out_list.map((route_view_out) => (
          <div key={route_view_out.prefix} className="block pt-5">
            <div className="block">
              <label className="subtitle is-5">{route_view_out.prefix}</label>
            </div>
            <div className="block pt-4">
              <div className="columns">
                <div className="column is-one-quarter">
                  <div className="content">
                    <p>
                      <strong>Total AS path found:</strong>{" "}
                      {route_view_out.total_asp}
                    </p>
                    <p>
                      <strong>Source ASN:</strong>{" "}
                      {route_view_out.src_asn_list.join(", ")}
                    </p>
                  </div>
                </div>
                <div className="column is-half">
                  <table className="table is-bordered is-hoverable is-fullwidth">
                    <thead>
                      <tr>
                        <th>AS Path</th>
                        <th>Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {route_view_out.obs_asp_list.map((obs_asp) => (
                        <tr key={obs_asp.obs_asp}>
                          <td>{obs_asp.obs_asp}</td>
                          <td>{obs_asp.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
}

class OutputControl extends React.Component {
  render() {
    return (
      <div className="block">
        <div className="block">
          <label className="title is-5">Operation</label>
        </div>
        <div className="block">
          <button
            name="back_button"
            className="button is-info"
            onClick={this.props.handle_click}
          >
            Back
          </button>
        </div>
      </div>
    );
  }
}

class RouteViewOutput extends React.Component {
  render() {
    if (this.props.ui_mode == "output") {
      return (
        <div className="block">
          <div className="block pt-5">
            <RouteViewOutCanvas
              route_view_out_list={this.props.route_view_out_list}
            />
          </div>
          <div className="block pt-5">
            <OutputControl handle_click={this.props.handle_click} />
          </div>
        </div>
      );
    } else {
      return <div className="block"></div>;
    }
  }
}

class RouteView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      prefix_list: [],
      viewpoint_asn: 21859,
      count_filter: 5,
      route_view_out_list: [],
      task_arg_validity_map: {
        prefix_list: true,
        viewpoint_asn: true,
        count_filter: true,
      },
      loading: false,
      ui_mode: "input",
    };

    this.handle_click = this.handle_click.bind(this);
    this.handle_change = this.handle_change.bind(this);
  }

  handle_click(event) {
    switch (event.currentTarget.getAttribute("name")) {
      case "start_button":
        this.setState({ loading: true });
        this.route_view();
        break;
      case "back_button":
        this.setState({
          ui_mode: "input",
        });
        break;
    }
  }

  handle_change(event) {
    switch (event.target.name) {
      case "prefix_input":
        this.setState({
          prefix_list: event.target.value.split("\n"),
          task_arg_validity_map: this.state.task_arg_validity_map.scanner_list
            ? this.state.task_arg_validity_map
            : { ...this.state.task_arg_validity_map, prefix_list: true },
        });
        break;
      case "asn_input":
        this.setState({
          viewpoint_asn: event.target.value,
          task_arg_validity_map: this.state.task_arg_validity_map.scanner_list
            ? this.state.task_arg_validity_map
            : { ...this.state.task_arg_validity_map, viewpoint_asn: true },
        });
        break;
      case "filter_input":
        this.setState({
          count_filter: event.target.value,
          task_arg_validity_map: this.state.task_arg_validity_map.scanner_list
            ? this.state.task_arg_validity_map
            : { ...this.state.task_arg_validity_map, count_filter: true },
        });
        break;
    }
  }

  async route_view() {
    try {
      let response = await fetch("/api/v1/route_view", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prefix_list: this.state.prefix_list,
          viewpoint_asn: this.state.viewpoint_asn,
          count_filter: this.state.count_filter,
        }),
      });
      let json_response = await response.json();
      if (json_response.event == "task_end") {
        this.setState({
          route_view_out_list: json_response.route_view_out_list,
          ui_mode: "output",
        });
      } else if (json_response.event == "task_arg_error") {
        this.setState({
          task_arg_validity_map: json_response.task_arg_validity_map,
        });
      }
    } catch (error) {
      this.setState({ route_view_out_list: [] });
    } finally {
      this.setState({ loading: false });
    }
  }

  render() {
    return (
      <div className="container">
        <RouteViewInput
          handle_click={this.handle_click}
          handle_change={this.handle_change}
          prefix_list={this.state.prefix_list}
          viewpoint_asn={this.state.viewpoint_asn}
          count_filter={this.state.count_filter}
          task_arg_validity_map={this.state.task_arg_validity_map}
          loading={this.state.loading}
          ui_mode={this.state.ui_mode}
        />
        <RouteViewOutput
          handle_click={this.handle_click}
          route_view_out_list={this.state.route_view_out_list}
          ui_mode={this.state.ui_mode}
        />
      </div>
    );
  }
}

ReactDOM.render(<RouteView />, document.querySelector("#route_view_root"));
