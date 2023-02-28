import React from "react";
import Head from "next/head";
import Image from "next/image";

// Image
import logoImg from "../public/logo.png";

// Components
import TextAreaInput from "../components/text_area_input";
import NumberInput from "../components/number_input";
import OptionalTextInput from "../components/text_input";
import Alert from "../components/alert";

class RouteViewInput extends React.Component {
  render() {
    return (
      <div className="flex flex-col gap-3">
        <div className="my-4">
          <label className="text-xl font-medium">Query</label>
        </div>
        <TextAreaInput
          title="Prefixes"
          name="prefix_input"
          placeholder={"98.98.98.0/24\n128.1.0.0/24\n..."}
          handle_change={this.props.handle_change}
          value={this.props.prefix_list_value}
          error={this.props.prefix_list_error}
          tip={this.props.prefix_list_tip}
        />
        <div className="flex gap-4">
          <NumberInput
            title="Viewpoint ASN"
            name="asn_input"
            placeholder="AS Number"
            handle_change={this.props.handle_change}
            value={this.props.viewpoint_asn_value}
            error={this.props.viewpoint_asn_error}
            tip={this.props.viewpoint_asn_tip}
          />
          <NumberInput
            title="Rare path threshold"
            name="filter_input"
            placeholder="0 ~ 100"
            handle_change={this.props.handle_change}
            value={this.props.count_filter_value}
            error={this.props.count_filter_error}
            tip={this.props.count_filter_tip}
          />
        </div>
        <OptionalTextInput
          title="Verify upstream ASN"
          toggle_name="upstream_asn_list_toggle"
          name="upstream_asn_list_input"
          placeholder="Comma-separated list of ASNs, e.g. 1229,2914"
          handle_change={this.props.handle_change}
          value={this.props.upstream_asn_list_value}
          error={this.props.upstream_asn_list_error}
          tip={this.props.upstream_asn_list_tip}
          enabled={this.props.upstream_asn_list_enabled}
        />
        <div className="py-2">
          <div className="basis-auto relative">
            <button
              name="query_button"
              className={"btn" + (this.props.query_loading ? " loading" : "")}
              onClick={this.props.handle_click}
            >
              Query
            </button>
          </div>
        </div>
      </div>
    );
  }
}

class RouteViewOutCanvas extends React.Component {
  render() {
    return (
      <div className="flex flex-col gap-2">
        {this.props.route_view_out_list.map((route_view_out) => (
          <div key={route_view_out.prefix} className="mt-2">
            <div className="flex gap-2">
              <div className="basis-1/2">
                <label className="font-medium">{route_view_out.prefix}</label>
                <div className="mt-4">
                  <div className="inline-grid gap-x-4 grid-cols-2 grid-rows-2 text-sm">
                    <span className="text-gray-500">Total path</span>
                    <span>{route_view_out.total_asp}</span>
                    <span className="text-gray-500">Origin ASN</span>
                    <span>{route_view_out.src_asn_list.join(", ")}</span>
                    <span className="text-gray-500">First multihome ASN</span>
                    <span>
                      {route_view_out.first_mh_asn == 0
                        ? "MOAS"
                        : route_view_out.first_mh_asn}
                    </span>
                    {route_view_out.verify_upstream_asn ? (
                      <>
                        <span className="text-gray-500">
                          Upstream ASN validation
                        </span>
                        <span
                          className={
                            route_view_out.upstream_asn_status == "fail"
                              ? "text-error"
                              : ""
                          }
                        >
                          {route_view_out.upstream_asn_status
                            .charAt(0)
                            .toUpperCase() +
                            route_view_out.upstream_asn_status.slice(1)}
                        </span>
                        <span className="text-gray-500">Upstream ASN diff</span>
                        <span>
                          {route_view_out.upstream_asn_diff_list.join(", ")}
                        </span>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="basis-1/2">
                <table className="table table-compact w-full">
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
            <div className="divider"></div>
          </div>
        ))}
      </div>
    );
  }
}

class RouteViewOutput extends React.Component {
  render() {
    return (
      <div className="flex flex-col gap-2">
        <div className="my-4 basis-auto">
          <label className="text-lg font-medium">Result</label>
        </div>
        <RouteViewOutCanvas
          route_view_out_list={this.props.route_view_out_list}
        />

        <div className="py-2">
          <div className="basis-auto relative">
            <button
              name="back_button"
              className="btn"
              onClick={this.props.handle_click}
            >
              Back
            </button>
          </div>
        </div>
        <div className="h-16"></div>
      </div>
    );
  }
}

class RouteView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // UI mode
      ui_mode: "input",
      alert_display: false,
      alert_tip: "",

      // RouteViewInput state
      // form data
      prefix_list: ["98.98.98.0/24", "128.1.0.0/24"],
      viewpoint_asn: 21859,
      count_filter: 5,
      upstream_asn_list: [],
      // input value
      prefix_list_value: "98.98.98.0/24\n128.1.0.0/24\n...",
      viewpoint_asn_value: "21859",
      count_filter_value: "5",
      upstream_asn_list_value: "",
      // input error status
      prefix_list_error: false,
      viewpoint_asn_error: false,
      count_filter_error: false,
      upstream_asn_list_error: "",
      // input error tip
      prefix_list_error_tip: "",
      viewpoint_asn_error_tip: "",
      count_filter_error_tip: "",
      upstream_asn_list_error_tip: "",
      // toggle status
      verify_upstream_asn: false,
      // button status
      query_loading: false,

      // RouteViewOutput state
      route_view_out_list: [],
    };

    this.regexp_prefix = new RegExp(
      "(" +
        "(?:(?:(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9]).){3,3}(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9]))/(?:3[012]|[12][0-9]|[1-9])" +
        "|" +
        "(?:(?:(?:(?:(?:[0-9a-fA-F]){1,4}):){1,4}:[^s:](?:(?:(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9]).){3,3}(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9])))|(?:::(?:ffff(?::0{1,4}){0,1}:){0,1}[^s:](?:(?:(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9]).){3,3}(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9])))|(?:fe80:(?::(?:(?:[0-9a-fA-F]){1,4})){0,4}%[0-9a-zA-Z]{1,})|(?::(?:(?::(?:(?:[0-9a-fA-F]){1,4})){1,7}|:))|(?:(?:(?:[0-9a-fA-F]){1,4}):(?:(?::(?:(?:[0-9a-fA-F]){1,4})){1,6}))|(?:(?:(?:(?:[0-9a-fA-F]){1,4}):){1,2}(?::(?:(?:[0-9a-fA-F]){1,4})){1,5})|(?:(?:(?:(?:[0-9a-fA-F]){1,4}):){1,3}(?::(?:(?:[0-9a-fA-F]){1,4})){1,4})|(?:(?:(?:(?:[0-9a-fA-F]){1,4}):){1,4}(?::(?:(?:[0-9a-fA-F]){1,4})){1,3})|(?:(?:(?:(?:[0-9a-fA-F]){1,4}):){1,5}(?::(?:(?:[0-9a-fA-F]){1,4})){1,2})|(?:(?:(?:(?:[0-9a-fA-F]){1,4}):){1,6}:(?:(?:[0-9a-fA-F]){1,4}))|(?:(?:(?:(?:[0-9a-fA-F]){1,4}):){1,7}:)|(?:(?:(?:(?:[0-9a-fA-F]){1,4}):){7,7}(?:(?:[0-9a-fA-F]){1,4})))/(?:12[0-8]|1[01][0-9]|[1-9][0-9]|[1-9])" +
        ")"
    );

    this.extract_prefix = this.extract_prefix.bind(this);

    this.handle_change = this.handle_change.bind(this);
    this.handle_click = this.handle_click.bind(this);

    this.route_view = this.route_view.bind(this);
  }

  extract_prefix(raw_prefix_list) {
    let prefix_list = [];
    for (let line of raw_prefix_list) {
      let re_out_prefix_list = this.regexp_prefix.exec(line);
      if (re_out_prefix_list) {
        prefix_list.push(re_out_prefix_list[0]);
      }
    }
    return prefix_list;
  }

  extract_asn(raw_asn_input) {
    let asn_list = [];
    let raw_asn_list = raw_asn_input
      .replace(/[^0-9]/g, ",")
      .replace(/,,+/g, ",")
      .split(",");
    for (let raw_asn of raw_asn_list) {
      let asn = Number(raw_asn);
      if (asn && Number.isInteger(asn) && asn >= 1 && asn <= 4294967295) {
        asn_list.push(asn);
      }
    }
    return asn_list;
  }

  handle_change(event) {
    switch (event.target.name) {
      case "prefix_input":
        {
          let value = event.target.value;
          let prefix_list = this.extract_prefix(value.split("\n"));
          let error;
          let error_tip;
          if (value && prefix_list.length > 0) {
            error = false;
            error_tip = "";
          } else {
            error = true;
            error_tip = "Please enter at least one valid prefix, one per line";
          }
          this.setState({
            prefix_list: prefix_list,
            prefix_list_value: value,
            prefix_list_error: error,
            prefix_list_error_tip: error_tip,
          });
        }
        break;
      case "asn_input":
        {
          let value = event.target.value;
          let viewpoint_asn = Number(value);
          let error;
          let error_tip;
          if (
            value &&
            Number.isInteger(viewpoint_asn) &&
            viewpoint_asn >= 1 &&
            viewpoint_asn <= 4294967295
          ) {
            error = false;
            error_tip = "";
          } else {
            error = true;
            error_tip = "Please input a valid ASN (1 ~ 2^32)";
          }
          this.setState({
            viewpoint_asn: viewpoint_asn,
            viewpoint_asn_value: value,
            viewpoint_asn_error: error,
            viewpoint_asn_error_tip: error_tip,
          });
        }
        break;
      case "filter_input":
        {
          let value = event.target.value;
          let count_filter = Number(value);
          let error;
          let error_tip;
          if (
            value &&
            Number.isInteger(count_filter) &&
            count_filter >= 0 &&
            count_filter <= 100
          ) {
            error = false;
            error_tip = "";
          } else {
            error = true;
            error_tip = "Please input a valid number (0 ~ 100)";
          }
          this.setState({
            count_filter: count_filter,
            count_filter_value: value,
            count_filter_error: error,
            count_filter_error_tip: error_tip,
          });
        }
        break;
      case "upstream_asn_list_toggle":
        {
          this.setState({
            verify_upstream_asn: this.state.verify_upstream_asn ? false : true,
          });
        }
        break;
      case "upstream_asn_list_input":
        {
          let value = event.target.value;
          let upstream_asn_list = this.extract_asn(value);
          let error;
          let error_tip;
          if (value && upstream_asn_list.length > 0) {
            error = false;
            error_tip = "";
          } else {
            error = true;
            error_tip =
              "Please enter at least one valid asn, separated by commas";
          }
          this.setState({
            upstream_asn_list: upstream_asn_list,
            upstream_asn_list_value: value,
            upstream_asn_list_error: error,
            upstream_asn_list_error_tip: error_tip,
          });
        }
        break;
    }
  }

  async handle_click(event) {
    switch (event.currentTarget.getAttribute("name")) {
      case "query_button":
        this.setState({ query_loading: true });
        await this.route_view();
        this.setState({ query_loading: false });
        break;
      case "back_button":
        this.setState({ ui_mode: "input" });
        break;
      case "alert_button":
        this.setState({ alert_display: false });
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
          verify_upstream_asn: this.state.verify_upstream_asn,
          upstream_asn_list: this.state.upstream_asn_list,
        }),
      });
      let json_response = await response.json();
      if (json_response.status == "success") {
        this.setState({
          route_view_out_list: json_response.route_view_out_list,
          ui_mode: "output",
          alert_display: false,
          alert_tip: "",
        });
      } else {
        if (json_response.reason == "form_error") {
          this.setState({
            ...json_response.detail,
            ui_mode: "input",
          });
        } else {
          this.setState({
            ui_mode: "input",
            alert_display: true,
            alert_tip: "Unknown error, please try again later",
          });
        }
      }
    } catch (error) {
      this.setState({
        ui_mode: "input",
        alert_display: true,
        alert_tip: "Unknown error, please try again later",
      });
    }
  }

  render() {
    return (
      <>
        <div className="navbar bg-base-100 shadow-sm">
          <div className="container mx-auto px-2">
            <div className="flex-1">
              <Image className="w-36" alt="logo" src={logoImg} priority />
            </div>
          </div>
        </div>
        <div className="container mx-auto px-2">
          {this.state.ui_mode == "input" ? (
            <RouteViewInput
              route_view={this.route_view}
              handle_change={this.handle_change}
              handle_click={this.handle_click}
              // input value
              prefix_list_value={this.state.prefix_list_value}
              viewpoint_asn_value={this.state.viewpoint_asn_value}
              count_filter_value={this.state.count_filter_value}
              upstream_asn_list_value={this.state.upstream_asn_list_value}
              // input error status
              prefix_list_error={this.state.prefix_list_error}
              viewpoint_asn_error={this.state.viewpoint_asn_error}
              count_filter_error={this.state.count_filter_error}
              upstream_asn_list_error={this.state.upstream_asn_list_error}
              // input error tip
              prefix_list_tip={
                this.state.prefix_list_error
                  ? this.state.prefix_list_error_tip
                  : "Extracted prefix: " + this.state.prefix_list.length
              }
              viewpoint_asn_tip={
                this.state.viewpoint_asn_error
                  ? this.state.viewpoint_asn_error_tip
                  : ""
              }
              count_filter_tip={
                this.state.count_filter_error
                  ? this.state.count_filter_error_tip
                  : ""
              }
              upstream_asn_list_tip={
                this.state.upstream_asn_list_error
                  ? this.state.upstream_asn_list_error_tip
                  : "Extracted ASN: " + this.state.upstream_asn_list.length
              }
              // toggle status
              upstream_asn_list_enabled={this.state.verify_upstream_asn}
              // button status
              query_loading={this.state.query_loading}
            />
          ) : null}
          {this.state.ui_mode == "output" ? (
            <RouteViewOutput
              handle_click={this.handle_click}
              route_view_out_list={this.state.route_view_out_list}
            />
          ) : null}
        </div>
        {this.state.alert_display ? (
          <div className="fixed bottom-4 w-full">
            <div className="container mx-auto px-2">
              <Alert
                value={this.state.alert_tip}
                button_name="alert_button"
                handle_click={this.handle_click}
              />
            </div>
          </div>
        ) : null}
        <div className="h-16"></div>
      </>
    );
  }
}

export default function Home() {
  return (
    <>
      <Head>
        <title>Route View</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, user-scalable=no"
        />
      </Head>
      <main>
        <RouteView />
      </main>
    </>
  );
}
