define(['jquery', 'cookie'], function($, cookie) {
  console.log($);
  console.log(cookie.get('csrftoken'));

  let csrftoken = cookie.get('csrftoken');

  function csrfsafe(method) {
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
  }

  function ajax(options) {
    let method = (options.method === undefined) ? 'GET' : options.method; // Default method GET
    let url = (options.url === undefined) ? window.location.hostname : options.url; // Default url home
    let datatype = (options.datatype === undefined) ? 'json' : options.datatype; // Deafult datatype json
    let data = options.data; // No default because `undefined` is already handled by ajax

    return $.ajax({
      method: method,
      url: url,
      dataType: datatype,
      data: data,
      beforeSend: function(xhr, settings){
        if (!csrfsafe(method) && this.crossDomain) { // If a vulnerable request is going cross-domain, give token
          xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
      }
    });
  }

  return {ajax: ajax}; // object returned exposes ajax method
});
