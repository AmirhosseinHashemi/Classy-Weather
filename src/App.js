import React from "react";

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      location: "kashan",
    };
  }

  render() {
    return (
      <div className="app">
        <h1>Classy Weather</h1>

        <div>
          <input
            type="text"
            value={this.state.location}
            onChange={(e) =>
              this.setState({
                location: e.target.value,
              })
            }
          ></input>
        </div>

        <button>Get Weather</button>
      </div>
    );
  }
}

export default App;
