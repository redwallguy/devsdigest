define(['jquery', 'cookie'], function($, cookie) {
  console.log($);
  console.log(cookie.get('csrftoken'));

  let csrftoken = cookie.get('csrftoken');

  function csrfsafe(method) {
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
  }

  function ajax(options) {
    let method = (options.method === undefined) ? 'GET' : options.method; // Default method GET
    let url = (options.url === undefined) ? window.location.hostname : options.url;
    let datatype = (options.datatype === undefined) ? 'json' : options.datatype;
    let data = options.data;

    return $.ajax({
      method: method,
      url: url,
      dataType: datatype,
      data: data,
      beforeSend: function(xhr, settings){
        if (!csrfsafe(method) && this.crossDomain) {
          xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
      }
    });
  }

  return {ajax: ajax};
});
