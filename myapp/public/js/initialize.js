
$(function () {
	$('[data-toggle="tooltip"]').tooltip()
})

$(document).ready(function () {
	$("#showPassword").on('click', function (event) {
		event.preventDefault();
		if ($('#inputPassword').attr("type") == "text") {
			$('#inputPassword').attr('type', 'password');
			$('#eyeButton').addClass("fa-eye-slash");
			$('#eyeButton').removeClass("fa-eye");
		} else if ($('#inputPassword').attr("type") == "password") {
			$('#inputPassword').attr('type', 'text');
			$('#eyeButton').removeClass("fa-eye-slash");
			$('#eyeButton').addClass("fa-eye");
		}
	});
});

(function () {
	'use strict';
	window.addEventListener('load', function () {
		// Fetch all the forms we want to apply custom Bootstrap validation styles to
		var forms = document.getElementsByClassName('needs-validation');
		// Loop over them and prevent submission
		var validation = Array.prototype.filter.call(forms, function (form) {
			form.addEventListener('submit', function (event) {
				if (form.checkValidity() === false) {
					event.preventDefault();
					event.stopPropagation();
				}
				form.classList.add('was-validated');
			}, false);
		});
	}, false);
})();