import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import StateDropdown from './stateDropdown.jsx';
import ItemInput from './iteminput.jsx';
import CurrentItemList from './currentItemList.jsx';
import ShoppingList from './shoppingList.jsx';
import SaveList from './savelist.jsx';
import Navigation from './navigation.jsx';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      state: 'CA',
      currentItems: [],
      newItemEntry: '',
      inputListName: '',
      savedListName: '',
      savedListsfromDB: ['List1', 'List2'],
    };
  }

  // makes get request to get saved shopping lists when component mounts
  componentDidMount() {
    this.getSavedLists();
  }

  // sets state for state(location) when item selected in dropdown
  selectState(e) {
    this.setState({ state: e.target.value });
  }

  // sets state for newItemEntry when user inputs item name
  updateNewItemEntry(e) {
    this.setState({ newItemEntry: e.target.value });
  }

  // adds new item to current list when "Add New Item" is clicked
  addNewItemToList(e) {
    e.preventDefault();
    this.state.currentItems.unshift({ name: this.state.newItemEntry, recalls: '' });
    this.setState({ currentItems: this.state.currentItems }, this.searchFDA);
    const form = document.getElementById('add-item');
    form.reset();
  }

  onKeyPress(e) {
    console.log('on keypress');
    if (e.keycode === 13) {
      this.addNewItemToList(e);
    }
  }

  // deletes item from list when "delete" is clicked next to item
  deleteItem(index, e) {
    this.state.currentItems.splice(index, 1);
    this.setState({ currentItems: this.state.currentItems });
  }

  // called when new items are added to the list, whether by user input or retreival of existent list from database
  // makes get request for each item to '/searchNewList' API endpoint
  searchFDA() {
    const scope = this.state.currentItems;
    const app = this;
    const newCurrentItems = [];
    const promises = [];
    for (let i = 0; i < this.state.currentItems.length; i++) {
      promises.push(axios.get('/searchNewList', { params: { item: scope[i], state: app.state.state } }));
    }
    axios.all(promises).then((recallData) => {
      recallData.forEach((response) => {
        const item = response.data[0];
        const value = response.data;
        const obj = {
          recalls: value,
          name: item,
        };
        response.data.shift();
        newCurrentItems.push(obj);
        app.setState({ currentItems: newCurrentItems });
      });
    });
  }

  // sets state for inputListName when user types in list name into input
  updateGrosseryListName(e) {
    this.setState({ inputListName: e.target.value });
  }

  // sets state savedListName to what was set in updateGrosseryListName, also calls submitNewList
  saveGrosseryListName(e) {
    e.preventDefault();
    this.setState({ savedListName: this.state.inputListName }, this.submitNewList);
    this.state.inputListName = '';
  }

  // called when "Save List" is clicked with a list name
  // makes post request to '/saveList' API endpoint and saves list name & items to database
  // calls getSavedList to get latest list of lists from database to render newest list
  submitNewList() {
    const app = this;
    axios.post('/saveList', {
      listName: app.state.savedListName,
      items: app.state.currentItems,
    })
      .then((response) => {
        console.log(response);
        console.log('list was saved');
        app.getSavedLists();
      });
  }

  // makes get request to '/getSavedLists' API endpoint to retrieve names of saved lsits
  // list of lists renders on page
  getSavedLists() {
    console.log('saved list');
    axios.get('/getSavedLists')
      .then((data) => {
        this.setState({ savedListsfromDB: data.data });
      })
      .catch((error) => {
      });
  }

  // when a saved list's list name is clicked, items of that list become currentItems and render on page
  getSavedListItems(listName) {
    console.log('getsavedlistitems has been called in shoppinglistentry');
    const newItems = [];
    axios.get('/getList', { params: { name: listName } })
      .then((response) => {
        const mapped = response.data[0].items.map((item) => {
          newItems.push({ name: item, recalls: '' });
        });
        this.setState({ currentItems: newItems, savedListName: listName }, this.searchFDA);
      });
  }

  render() {
    return (
      <div>
        <Navigation />
        <div className="container">
          <div className="row justify-content-md-center">
            <div className="col-12 col-md-auto">
            <StateDropdown
              selectstate={this.selectState.bind(this)}
              />
            <ItemInput
              updateNewItemEntry={this.updateNewItemEntry.bind(this)}
              newItemEntry={this.state.newitemEntry}
              onKeyPress={this.onKeyPress.bind(this)}
              addNewItemToList={this.addNewItemToList.bind(this)}
              />
            </div>
          </div>
          <div className="row justify-content-md-center">
            <div className="col-12 col-md-auto">
              <ShoppingList savedLists={this.state.savedListsfromDB} getSavedListItems={this.getSavedListItems.bind(this)} />
            </div>
          </div>
          <div className="row justify-content-md-center">
            <div className="col-12 col-md-auto">
              <SaveList inputListName={this.state.inputListName} updateGrosseryListName={this.updateGrosseryListName.bind(this)} saveGrosseryListName={this.saveGrosseryListName.bind(this)} />
            </div>
          </div>
        </div>
        <div className="row justify-content-md-center">
          <div className="col-12 col-md-auto">
            <CurrentItemList
              deleteItem={this.deleteItem.bind(this)}
              searchfda={this.searchFDA.bind(this)}
              currentItems={this.state.currentItems}
              updateGrosseryListName={this.updateGrosseryListName.bind(this)}
              saveGrosseryListName={this.saveGrosseryListName.bind(this)}
              savedListName={this.state.savedListName}
              inputListName={this.state.inputListName}
            />
          </div>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
