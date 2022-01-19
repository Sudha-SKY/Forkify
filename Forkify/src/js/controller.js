import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';

// if (module.hot) {
//   module.hot.accept();
// }

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();

    //update results view to mark selected search result
    resultsView.update(model.getSearchResultPage());

    //update bookmarks view
    bookmarksView.update(model.state.bookmarks);

    //load recipe
    await model.loadRecipe(id);

    //render recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    console.error(err);
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();

    const query = searchView.getQuery();
    //    console.log(query);
    if (!query) return;

    await model.loadSearchResult(query);

    resultsView.render(model.getSearchResultPage());
    paginationView.render(model.state.search);
  } catch (err) {
    console.error(`${err}`);
  }
};
const controlPagination = function (goToPage) {
  //Render NEW result
  resultsView.render(model.getSearchResultPage(goToPage));

  //Render NEW pagination buttons
  paginationView.render(model.state.search);
  // console.log(goToPage);
};

const controlServings = function (newServings) {
  //update the recipe servings(in state)
  model.updateServings(newServings);

  //update the recipe view(DOM updating algorithm)
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  recipeView.update(model.state.recipe);

  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  // console.log('controlBookmarks TEST');
  // console.log(model.state.bookmarks);
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    addRecipeView.renderSpinner();

    // Upload the new recipe data
    await model.uploadRecipe(newRecipe);

    // Render recipe
    recipeView.render(model.state.recipe);

    // // render the message that recipe is added
    // addRecipeView.renderMessage();

    // update the bookmark
    bookmarksView.render(model.state.bookmarks);

    // Change recipe id in the url
    // console.log(model.state.recipe.id);
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // Close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);

    // render the message that recipe is added
    addRecipeView.renderMessage();
  } catch (err) {
    console.error(err);
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();

//Publisher-Subscriber Patttern
//Controller.js is the Subscriber and recipeView.js the Publisher
//And hence Controller still has control and View simply handles whatever it receives
// ['hashchange', 'load'].forEach(ev =>
//   window.addEventListener(ev, controlRecipes));
