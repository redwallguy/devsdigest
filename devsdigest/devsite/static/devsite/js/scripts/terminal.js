define(['jquery','cookie','./base'], function($, cookie, base) {
  let commands = {};
  commands.cd = cd;
  /*commands.ls = ls;
  commands.pwd = pwd;
  commands.sudo = sudo;
  commands.exit = exit;*/
  console.log(base);

  function cd(path) {
    let host = window.location.hostname;
    path = (path === undefined) ? "" : path;
    base.ajax({
      url: path
    }).done(function(data) {
      window.open(host+path, name="_self");
    }).fail(function(data) {
      alert("Invalid url: " + host+path);
    })
  }

  cd('kjsdfkjs');
});
