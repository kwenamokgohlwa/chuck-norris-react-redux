import axios from "axios";
import React from "react";

function createStore(reducer, initialState) {
  let state = initialState;
  const listeners = [];

  const subscribe = listener => listeners.push(listener);

  const getState = () => state;

  const dispatch = action => {
    state = reducer(state, action);
    listeners.forEach(l => l());
  };

  return {
    subscribe,
    getState,
    dispatch
  };
}

function reducer(state, action) {
  if (action.type === "ADD_FACT") {
    return {
      facts: state.facts.concat(action.fact)
    };
  } else if (action.type === "DELETE_FACT") {
    return {
      facts: [
        ...state.facts.slice(0, action.index),
        ...state.facts.slice(action.index + 1, state.facts.length)
      ]
    };
  } else {
    return state;
  }
}

const initialState = {
  facts: []
};

const store = createStore(reducer, initialState);

class App extends React.Component {
  componentDidMount() {
    store.subscribe(() => this.forceUpdate());
  }

  render() {
    const facts = store.getState().facts;

    return (
      <div className="ui segment">
        <CategoryInput />
        <FactView facts={facts} />
      </div>
    );
  }
}

class CategoryInput extends React.Component {
  state = {
    activeCategory: "Select a Category",
    categories: ["Science", "Religeon"]
  };

  componentDidMount() {
    fetch("https://api.chucknorris.io/jokes/categories")
      .then(response => response.json())
      .then(data => this.setState({ categories: data }))
      .catch(error => console.warn(error));
  }

  onClick = e => {
    this.setState({
      activeCategory: e.target.textContent
    });
  };

  handleSubmit = () => {
    if (this.state.activeCategory !== "Select a Category") {
      axios
        .get("https://api.chucknorris.io/jokes/random")
        .then(response => {
          store.dispatch({
            type: "ADD_FACT",
            fact: response.data.value
          });

          this.setState({ activeCategory: "Select a Category" });
        })
        .catch(error => {
          console.warn(error);
        });
    }
  };

  render() {
    const categories = this.state.categories.map((category, index) => (
      <div className="item" onClick={e => this.onClick(e)} key={index}>
        {category}
      </div>
    ));

    return (
      <div className="ui input">
        <div className="ui compact menu">
          <div className="ui simple dropdown item">
            {this.state.activeCategory}
            <i className="dropdown icon" />
            <div className="menu">{categories}</div>
          </div>
        </div>

        <button
          onClick={() => this.handleSubmit()}
          className="ui primary button"
          type="submit"
          value="Submit"
        >
          Submit
        </button>
      </div>
    );
  }
}

class FactView extends React.Component {
  handleClick = index => {
    store.dispatch({
      type: "DELETE_FACT",
      index: index
    });
  };

  render() {
    const facts = this.props.facts.map((fact, index) => (
      <div
        className="comment"
        key={index}
        onClick={() => this.handleClick(index)}
      >
        {fact}
      </div>
    ));
    return (
      <div className="ui center aligned basic segment">
        <div className="ui comments">{facts}</div>
      </div>
    );
  }
}

export default App;
