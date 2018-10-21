(function() {
  angular
    .module('shopify', [])
    .service('sfConnectionService', shopifyConnectionService);

  shopifyConnectionService.$inject = ['$http', '$location', '$window', '$q'];

  function shopifyConnectionService($http, $location, $window, $q) {
    var server = 'http://34.222.155.70';
    var shop   = 'test-chocoland2';

    if (localStorage.__SHOPIFY__ === 'undefined')
      localStorage.removeItem('__SHOPIFY__');

    console.log('[V] open the popup to auth');

    function auth() {
      return $q(function(resolve) {
        if (localStorage.__SHOPIFY__  && localStorage.__SHOPIFY__ !== 'undefined')
          resolve(localStorage.__SHOPIFY__)
        else {
          window.addEventListener('message', function(event) {
            if (!event.data.access_token)
              event.preventDefault();

            console.log(event);
            localStorage.__SHOPIFY__ = event.data.access_token;
            resolve(localStorage.__SHOPIFY__);
          }, false);
          $window.open(server + '/shopify/shop/' + shop, '_blank');
        }
      });
    }

    function ajax(method, path, json) {
      return $q(function(resolve, reject) {
        auth().then(function(access_token) {
          return $http.post(server + '/shopify', {
            shop         : shop,
            access_token : access_token,
            json         : json,
            method       : method,
            path         : path
          }).then(function(response) {
            resolve(response.data);
          }).catch(function(e) {
            reject(e);
          });
        })
      });
    }

    function search(obj) {
      var keys   = _.keys(obj);
      var output = '';
      _.each(keys, function(v) { output += v + '=' + obj[v] + '&' });
      return _.replace(output, /&$/, '');
    }

    var product = {
      all    : function(body)     { return ajax('GET',    '/admin/products.json?' + search(body)); },
      count  : function(body)     { return ajax('GET',    '/admin/products/count.json?' + search(body)); },
      id     : function(id, body) { return ajax('GET',    '/admin/products/' + id + '.json?' + search(body)); },
      create : function(body)     { return ajax('POST',   '/admin/products.json', body); },
      modify : function(id, body) { return ajax('PUT',    '/admin/products/' + id + '.json', body); },
      delete : function(id)       { return ajax('DELETE', '/admin/products/' + id + '.json'); }
    };

    var productListing = {
      all    : function(body)     { return ajax('GET',    '/admin/product_listings.json?' + search(body)); },
      count  : function(body)     { return ajax('GET',    '/admin/product_listings/count.json?' + search(body)); },
      id     : function(id, body) { return ajax('GET',    '/admin/product_listings/' + id + '.json?' + search(body)); },
      create : function(body)     { return ajax('PUT',    '/admin/product_listings/' + id + '.json', body); },
      delete : function(id)       { return ajax('DELETE', '/admin/product_listings/' + id + '.json'); }
    };

    var collectionListing = {
      all    : function(body)     { return ajax('GET',    '/admin/collection_listings.json?' + search(body)); },
      count  : function(body)     { return ajax('GET',    '/admin/collection_listings/count.json?' + search(body)); },
      id     : function(id, body) { return ajax('GET',    '/admin/collection_listings/' + id + '.json?' + search(body)); },
      ids    : function(id)       { return ajax('GET',    '/admin/collection_listings/' + id + '/product_ids.json'); },
      create : function(body)     { return ajax('PUT',    '/admin/collection_listings/' + id + '.json', body); },
      delete : function(id)       { return ajax('DELETE', '/admin/collection_listings/' + id + '.json'); }
    };

    var checkout = {
      all    : function(body)     { return ajax('GET',  '/admin/checkouts.json?' + search(body)); },
      count  : function(body)     { return ajax('GET',  '/admin/checkouts/count.json?' + search(body)); },
      id     : function(id, body) { return ajax('GET',  '/admin/checkouts/' + id + '.json?' + search(body)); },
      create : function(body)     { return ajax('POST', '/admin/checkouts.json', body); },
      modify : function(id, body) { return ajax('PUT',  '/admin/checkouts/' + id + '.json', body); }
    };

    var customer = {
      all    : function(body)     { return ajax('GET',  '/admin/customers.json?' + search(body)) },
      count  : function(body)     { return ajax('GET',  '/admin/customers/count.json?' + search(body)) },
      id     : function(id, body) { return ajax('GET',  '/admin/customers/' + id + '.json?' + search(body)) },
      search : function(body)     { return ajax('GET',  '/admin/customers/search.json?' + search(body)) },
      create : function(body)     { return ajax('POST', '/admin/customers.json', body) },
      modify : function(id, body) { return ajax('PUT',  '/admin/customers/' + id + '.json', body) }
    };

    var blog = {
      all    : function(body)     { return ajax('GET',  '/admin/blogs.json?' + search(body)) },
      count  : function(body)     { return ajax('GET',  '/admin/blogs/count.json?' + search(body)) },
      id     : function(id, body) { return ajax('GET',  '/admin/blogs/' + id + '.json?' + search(body)) },
      create : function(body)     { return ajax('POST', '/admin/blogs.json', body) },
      modify : function(id, body) { return ajax('PUT',  '/admin/blogs/' + id + '.json', body) }
    };

    var article = {
      all    : function(blog, body)     { return ajax('GET',  '/admin/blogs/' + blog + '/articles.json?' + search(body)) },
      count  : function(blog, body)     { return ajax('GET',  '/admin/blogs/' + blog + '/articles/count.json?' + search(body)) },
      id     : function(blog, id, body) { return ajax('GET',  '/admin/blogs/' + blog + '/articles/' + id + '.json?' + search(body)) },
      create : function(blog, body)     { return ajax('POST', '/admin/blogs/' + blog + '/articles.json', body) },
      modify : function(id, blog, body) { return ajax('PUT',  '/admin/blogs/' + blog + '/articles/' + id + '.json', body) }
    };

    var page = {
      all    : function(body)     { return ajax('GET',  '/admin/pages.json?' + search(body)) },
      count  : function(body)     { return ajax('GET',  '/admin/pages/count.json?' + search(body)) },
      id     : function(id, body) { return ajax('GET',  '/admin/pages/' + id + '.json?' + search(body)) },
      create : function(body)     { return ajax('POST', '/admin/pages.json', body) },
      modify : function(id, body) { return ajax('PUT',  '/admin/pages/' + id + '.json', body) }
    };

    var cart = {
      all    : function(body)     { return JSON.parse(localStorage.__CART__ || '{}'); },
      count  : function()         { return _.keys(JSON.parse(localStorage.__CART__ || '{}')).length; },
      id     : function(id)       { return JSON.parse(localStorage.__CART__ || '{}')[id]; },
      clear  : function()         { localStorage.removeItem('__CART__'); },
      delete : function(id)       {
        var cache  = JSON.parse(localStorage.__CART__ || '{}');
        var result = _.omit(cache, id);

        localStorage.__CART__ = JSON.stringify(result);
      },
      add    : function(id, body) {
        var cache  = JSON.parse(localStorage.__CART__ || '{}');
        var object = eval('({ ' + id + ' : body })');
        var result = _.assign(cache, object);

        localStorage.__CART__ = JSON.stringify(result); 
      }
    };

    var favorite = {
      all    : function()   { return JSON.parse(localStorage.__FAVORITE__ || '[]'); },
      count  : function()   { return JSON.parse(localStorage.__FAVORITE__ || '[]').length; },
      id     : function(id) { return _.indexOf(JSON.parse(localStorage.__FAVORITE__ || '[]'), id) !== -1; },
      clear  : function()   { localStorage.removeItem('__FAVORITE__'); },
      delete : function(id) {
        var cache  = JSON.parse(localStorage.__FAVORITE__ || '[]');
        var result = _.filter(cache, function(key) { return  id !== key; });

        localStorage.__FAVORITE__ = JSON.stringify(result);
      },
      add    : function(id) {
        var cache  = JSON.parse(localStorage.__FAVORITE__ || '[]');

        if (id && _.indexOf(cache, id) === -1) {
          var result = _.concat(cache, id);

          localStorage.__FAVORITE__ = JSON.stringify(result);
        }
      }
    };
    return function(obj) {
      shop = obj.shop;

      console.log('[V] get instance from Shopify connection');

      return {
        product           : product,
        productListing    : productListing,
        collectionListing : collectionListing,
        checkout          : checkout,
        blog              : blog,
        article           : article,
        page              : page,
        cart              : cart,
        favorite          : favorite,
        customer          : customer
      };
    }
  }
}());
