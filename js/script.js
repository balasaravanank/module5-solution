(function (global) {

var dc = {};

// URLs
var homeHtmlUrl = "snippets/home-snippet.html";
var allCategoriesUrl =
  "https://coursera-jhu-default-rtdb.firebaseio.com/categories.json";
var categoriesTitleHtml = "snippets/categories-snippet.html";
var categoryHtml = "snippets/category-snippet.html";
var menuItemsUrl =
  "https://coursera-jhu-default-rtdb.firebaseio.com/menu_items/";
var menuItemsTitleHtml = "snippets/menu-items-snippet.html";
var menuItemHtml = "snippets/menu-item.html";

// -----------------------------
// Convenience functions
// -----------------------------
var insertHtml = function (selector, html) {
  document.querySelector(selector).innerHTML = html;
};

var showLoading = function (selector) {
  var html = "<div class='text-center'>";
  html += "<img src='images/ajax-loader.gif'></div>";
  insertHtml(selector, html);
};

var insertProperty = function (string, propName, propValue) {
  var propToReplace = "{{" + propName + "}}";
  string = string.replace(new RegExp(propToReplace, "g"), propValue);
  return string;
};

// -----------------------------
// Load Home Page
// -----------------------------
document.addEventListener("DOMContentLoaded", function () {
  loadHome();
});

function loadHome () {
  showLoading("#main-content");
  $ajaxUtils.sendGetRequest(homeHtmlUrl, function (homeHtml) {
    $ajaxUtils.sendGetRequest(
      allCategoriesUrl,
      function (categories) {
        var categoriesObj = JSON.parse(categories);
        insertRandomCategoryShortName(homeHtml, categoriesObj);
      }
    );
  });
}

dc.loadHome = loadHome;

// -----------------------------
// RANDOM CATEGORY LOGIC
// -----------------------------

function chooseRandomCategory (categories) {
  var randomIndex = Math.floor(Math.random() * categories.length);
  return categories[randomIndex];
}

function insertRandomCategoryShortName (homeHtml, categories) {
  var randomCategory = chooseRandomCategory(categories);
  var shortName = randomCategory.short_name;

  var homeHtmlToInsert =
    homeHtml.replace("{{randomCategoryShortName}}", "'" + shortName + "'");

  insertHtml("#main-content", homeHtmlToInsert);
}

// -----------------------------
// Load Menu Categories
// -----------------------------
dc.loadMenuCategories = function () {
  showLoading("#main-content");
  $ajaxUtils.sendGetRequest(allCategoriesUrl, buildAndShowCategoriesHTML);
};

function buildAndShowCategoriesHTML (categories) {
  $ajaxUtils.sendGetRequest(
    categoriesTitleHtml,
    function (categoriesTitleHtml) {
      $ajaxUtils.sendGetRequest(
        categoryHtml,
        function (categoryHtml) {
          var categoriesObj = JSON.parse(categories);
          var categoriesViewHtml =
            buildCategoriesViewHtml(
              categoriesObj,
              categoriesTitleHtml,
              categoryHtml
            );
          insertHtml("#main-content", categoriesViewHtml);
        }
      );
    }
  );
}

function buildCategoriesViewHtml (categories, categoriesTitleHtml, categoryHtml) {
  var finalHtml = categoriesTitleHtml;
  finalHtml += "<section class='row'>";

  for (var i = 0; i < categories.length; i++) {
    var html = categoryHtml;
    html = insertProperty(html, "name", categories[i].name);
    html = insertProperty(html, "short_name", categories[i].short_name);
    finalHtml += html;
  }

  finalHtml += "</section>";
  return finalHtml;
}

// -----------------------------
// Load Menu Items
// -----------------------------
dc.loadMenuItems = function (categoryShort) {
  showLoading("#main-content");
  $ajaxUtils.sendGetRequest(
    menuItemsUrl + categoryShort + ".json",
    buildAndShowMenuItemsHTML
  );
};

function buildAndShowMenuItemsHTML (categoryMenuItems) {
  var categoryObj = JSON.parse(categoryMenuItems);

  $ajaxUtils.sendGetRequest(
    menuItemsTitleHtml,
    function (menuItemsTitleHtml) {
      $ajaxUtils.sendGetRequest(
        menuItemHtml,
        function (menuItemHtml) {
          var menuItemsViewHtml =
            buildMenuItemsViewHtml(
              categoryObj,
              menuItemsTitleHtml,
              menuItemHtml
            );
          insertHtml("#main-content", menuItemsViewHtml);
        }
      );
    }
  );
}

function buildMenuItemsViewHtml (categoryMenuItems, menuItemsTitleHtml, menuItemHtml) {
  var finalHtml = menuItemsTitleHtml;
  finalHtml = insertProperty(finalHtml, "name", categoryMenuItems.category.name);
  finalHtml = insertProperty(finalHtml, "special_instructions",
    categoryMenuItems.category.special_instructions);

  finalHtml += "<section class='row'>";

  var menuItems = categoryMenuItems.menu_items;
  for (var i = 0; i < menuItems.length; i++) {
    var html = menuItemHtml;
    html = insertProperty(html, "short_name", menuItems[i].short_name);
    html = insertProperty(html, "name", menuItems[i].name);
    html = insertProperty(html, "description", menuItems[i].description);
    finalHtml += html;
  }

  finalHtml += "</section>";
  return finalHtml;
}

global.$dc = dc;

})(window);
