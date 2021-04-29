
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

	$("#submit_review").submit(function (event) {
		var values = {};
		$.each($('#submit_review').serializeArray(), function(i, field) {
			values[field.name] = field.value;
		});

		if (values.rating == 0) {
			$("#error_msg").removeClass("hide_me")
			$("#error_msg").html("<strong><i class=\"fas fa-exclamation-circle\"></i> Please select a rating.</strong>")
			event.preventDefault();
		}

		if (values.review.length == 0) {
			$("#error_msg").removeClass("hide_me")
			$("#error_msg").html("<strong><i class=\"fas fa-exclamation-circle\"></i> Please enter a review.</strong>")
			$("#text-form-review").addClass("is-invalid")
			event.preventDefault();
		} else {
			if ($("#text-form-review").hasClass("is-invalid")) {
				$("#text-form-review").removeClass("is-invalid")
			}
			if (!$("#text-form-review").hasClass("is-valid")) {
				$("#text-form-review").addClass("is-valid")
			}
		}
	});

	$("#dark_mode").click(function (event) {
		console.log("LINKED")
		 $( ":button" ).removeClass( "btn-primary" );
		 $( ":button" ).addClass( "btn-secondary" );
		   var element = document.body;
  			element.classList.toggle("dark");
		 $('input[type=text], textarea').addClass( "dark-field" );
		 $('#navbar-id').removeClass(".navbar-maroon");
		 $('#navbar-id').addClass("navbar-maroon-dark");
	});

	$("#tweet_button").click(function (event) {

		var restaurant_name = $("#restaurant-title").text().trim();
		var review = $("#text-form-review").val();
		var msg = encodeURIComponent(`I visited ${restaurant_name} and my review is: ${review}`)

		console.log(msg)

		var twitter_link = `https://twitter.com/intent/tweet?text=${msg}&hashtags=AggieEats`


		window.open(twitter_link, '_blank'); 

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