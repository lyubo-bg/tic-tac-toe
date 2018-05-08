var url = "http://localhost:3000";

function _get (endpoint, params) {  
    var requestUrl = `${url}${endpoint}`;
    if(params != null) {
      requestUrl = `${requestUrl}/${params}`;
    }
  
    return fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    }).then((response, error) => {
      if(response.ok) {
        return response.json(); 
      } else {
        throw response;
      }
    });
  }

  function _getWithAuth (endpoint, params, token) {  
    var requestUrl = `${url}${endpoint}`;
    if(params != null) {
      requestUrl = `${requestUrl}/${params}`;
    }
  
    return fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    }).then((response, error) => {
      if(response.ok) {
        return response.json(); 
      } else {
        throw response;
      }
    });
  }
  
  function _post (endpoint, params) {
    var requestUrl = `${url}${endpoint}`;
  
    return fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params)
    }).then((response, error) => {
      if(response.ok) {
        return response.json();
      } else {
        throw response;
      }
    });
  }

  function _postWithAuth(endpoint, params, token) {
    var requestUrl = `${url}${endpoint}`;
  
    return fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify(params)
    }).then((response, error) => {
      if(response.ok) {
        return response.json();
      } else {
        throw response;
      }
    });
  }
  
  function _handleError (error) {
    throw error;
  }
  
  module.exports = {
    get: function (endpoint, params) {
      return _get(endpoint, params)
        .catch(_handleError);
    },
  
    post: function (endpoint, params) {
      return _post(endpoint, params)
        .catch(_handleError);
    },

    postWithAuth: function(endpoint, params, token){
      return _postWithAuth(endpoint, params, token)
        .catch(_handleError);
    },

    getWithAuth: function(endpoint, params, token){
      return _getWithAuth(endpoint, params, token)
        .catch(_handleError);
    }
  };