
$(function () {
    $('[data-toggle="tooltip"]').tooltip()
  })

$(document).ready(function(){
  $("#showPassword").click(function(){
    $(this).is(':checked') ? $('#inputPassword').attr('type', 'text') : $('#inputPassword').attr('type', 'password');
  });
});  