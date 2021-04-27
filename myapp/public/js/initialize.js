
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

// $(document).ready(function () {
// 	$("#library_button").click(function (event) {
// 		event.preventDefault()
// 		if ($('#library_button').hasClass("in-library")) { // remove from library
// 			$('#library_button').addClass("not-in-library");
// 			$('#library_button').removeClass("in-library");
// 			$('#starred_icon').removeClass("starred");

// 		} else if ($('#library_button').hasClass("not-in-library")) {
// 			$('#library_button').removeClass("not-in-library");
// 			$('#library_button').addClass("in-library");
// 			$('#starred_icon').addClass("starred");
// 		}

// 		$("#myForm")[0].submit()
		
// 	});
// });

$(document).ready(function () {
	$(".remove-recipe").click(function (event) {
		var index = $(this).data('index');
		console.log("INDEX =", index)
		$(`.list-recipe:eq(${index})`).hide();
	});

	$(".favorites-collapse").click(function (event) {
		var shrink = "Shrink <i class=\"fas fa-angle-double-up\"></i>"
		var expand = "Expand <i class=\"fas fa-angle-double-down\"></i>"
		if ($(this).html().trim() === shrink) {
			$(this).html(expand)
		} else if ($(this).html().trim() === expand) {
			$(this).html(shrink)
		} else {
			console.log(`Unexpected: html = '${$(this).html().trim()}', shrink = '${shrink}', expand = '${expand}'`)
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