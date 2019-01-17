const devbase = (function($) {
  let csrftoken = Cookies.get('csrftoken');

  // these HTTP methods do not require CSRF protection
  function csrfSafeMethod(method) {
      return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
  }
  

  // Ajax setup code taken/inspired by official django docs
  $.ajaxSetup({
      beforeSend: function(xhr, settings) {
          if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
              xhr.setRequestHeader("X-CSRFToken", csrftoken);
          }
      }
  });

  return {
    csrftoken: csrftoken,
  }

})($);
